package com.qaphael.ssmp.data.repository

import com.qaphael.ssmp.data.local.PendingWriteDao
import com.qaphael.ssmp.data.local.PendingWriteEntity
import com.squareup.moshi.Moshi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OfflineQueue @Inject constructor(
    private val pendingWriteDao: PendingWriteDao,
    private val moshi: Moshi
) {
    suspend fun enqueue(entityType: String, entityId: String, action: String, payload: Any) {
        val json = moshi.adapter(Any::class.java).toJson(payload)
        pendingWriteDao.insert(PendingWriteEntity(
            entityType = entityType, entityId = entityId, action = action, payload = json
        ))
    }

    suspend fun getPendingWrites(): List<PendingWriteEntity> = pendingWriteDao.getAll()
    suspend fun removeWrite(id: Long) = pendingWriteDao.deleteById(id)
    suspend fun incrementRetry(id: Long) = pendingWriteDao.incrementRetry(id)
    suspend fun pendingCount(): Int = pendingWriteDao.count()
}
