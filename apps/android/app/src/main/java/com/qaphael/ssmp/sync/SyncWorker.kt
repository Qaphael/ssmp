package com.qaphael.ssmp.sync

import android.content.Context
import android.util.Log
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.qaphael.ssmp.data.local.PendingWriteDao
import com.qaphael.ssmp.data.remote.api.SsmpApiService
import com.qaphael.ssmp.data.remote.dto.*
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val pendingWriteDao: PendingWriteDao,
    private val api: SsmpApiService,
    private val moshi: Moshi
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val pendingWrites = pendingWriteDao.getAll()

        if (pendingWrites.isEmpty()) return Result.success()

        Log.d("SyncWorker", "Processing ${pendingWrites.size} pending writes")

        for (write in pendingWrites) {
            try {
                when (write.entityType) {
                    "player" -> processPlayerWrite(write)
                    "lineup" -> processLineupWrite(write)
                    "match_event" -> processMatchEventWrite(write)
                }
                pendingWriteDao.deleteById(write.id)
            } catch (e: Exception) {
                Log.e("SyncWorker", "Failed to sync write ${write.id}", e)
                if (write.retryCount >= 3) {
                    pendingWriteDao.deleteById(write.id)
                } else {
                    pendingWriteDao.incrementRetry(write.id)
                }
            }
        }

        return Result.success()
    }

    private suspend fun processPlayerWrite(write: com.qaphael.ssmp.data.local.PendingWriteEntity) {
        val type = Types.newParameterizedType(Map::class.java, String::class.java, Any::class.java)
        val adapter = moshi.adapter<Map<String, Any>>(type)
        val data = adapter.fromJson(write.payload) ?: return

        when (write.action) {
            "create" -> {
                api.createPlayer(CreatePlayerRequest(
                    teamId = data["teamId"] as? String ?: "",
                    firstName = data["firstName"] as? String ?: "",
                    lastName = data["lastName"] as? String ?: "",
                    jerseyNumber = (data["jerseyNumber"] as? Double)?.toInt() ?: 0,
                    position = data["position"] as? String ?: "",
                    dateOfBirth = data["dateOfBirth"] as? String ?: ""
                ))
            }
            "update" -> {
                api.updatePlayer(write.entityId, UpdatePlayerRequest(
                    firstName = data["firstName"] as? String,
                    lastName = data["lastName"] as? String,
                    jerseyNumber = (data["jerseyNumber"] as? Double)?.toInt(),
                    position = data["position"] as? String,
                    status = data["status"] as? String
                ))
            }
            "delete" -> {
                api.deletePlayer(write.entityId)
            }
        }
    }

    private suspend fun processLineupWrite(write: com.qaphael.ssmp.data.local.PendingWriteEntity) {
        val type = Types.newParameterizedType(Map::class.java, String::class.java, Any::class.java)
        val adapter = moshi.adapter<Map<String, Any>>(type)
        val data = adapter.fromJson(write.payload) ?: return

        val playerIdsRaw = data["playerIds"] as? List<*>
        val playerIds = playerIdsRaw?.mapNotNull { it as? String } ?: emptyList()

        api.submitLineup(write.entityId, CreateLineupRequest(
            matchId = data["matchId"] as? String ?: write.entityId,
            teamId = data["teamId"] as? String ?: "",
            playerIds = playerIds,
            submittedBy = data["submittedBy"] as? String ?: ""
        ))
    }

    private suspend fun processMatchEventWrite(write: com.qaphael.ssmp.data.local.PendingWriteEntity) {
        val type = Types.newParameterizedType(Map::class.java, String::class.java, Any::class.java)
        val adapter = moshi.adapter<Map<String, Any>>(type)
        val data = adapter.fromJson(write.payload) ?: return

        api.createMatchEvent(write.entityId, CreateMatchEventRequest(
            matchId = write.entityId,
            type = data["type"] as? String ?: "",
            minute = (data["minute"] as? Double)?.toInt() ?: 0,
            playerId = data["playerId"] as? String,
            teamId = data["teamId"] as? String,
            description = data["description"] as? String,
            recordedBy = data["recordedBy"] as? String ?: ""
        ))
    }
}
