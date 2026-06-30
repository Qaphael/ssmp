package com.qaphael.ssmp.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PlayerDao {
    @Query("SELECT * FROM players ORDER BY jerseyNumber ASC")
    fun getAllFlow(): Flow<List<PlayerEntity>>

    @Query("SELECT * FROM players ORDER BY jerseyNumber ASC")
    suspend fun getAll(): List<PlayerEntity>

    @Query("SELECT * FROM players WHERE id = :id")
    suspend fun getById(id: String): PlayerEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(player: PlayerEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(players: List<PlayerEntity>)

    @Update
    suspend fun update(player: PlayerEntity)

    @Query("DELETE FROM players WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM players")
    suspend fun deleteAll()
}

@Dao
interface MatchDao {
    @Query("SELECT * FROM matches ORDER BY scheduledAt ASC")
    fun getAllFlow(): Flow<List<MatchEntity>>

    @Query("SELECT * FROM matches ORDER BY scheduledAt ASC")
    suspend fun getAll(): List<MatchEntity>

    @Query("SELECT * FROM matches WHERE id = :id")
    suspend fun getById(id: String): MatchEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(match: MatchEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(matches: List<MatchEntity>)

    @Update
    suspend fun update(match: MatchEntity)

    @Query("DELETE FROM matches")
    suspend fun deleteAll()
}

@Dao
interface LineupDao {
    @Query("SELECT * FROM lineups")
    fun getAllFlow(): Flow<List<LineupEntity>>

    @Query("SELECT * FROM lineups WHERE matchId = :matchId")
    suspend fun getByMatchId(matchId: String): List<LineupEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(lineup: LineupEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(lineups: List<LineupEntity>)

    @Query("DELETE FROM lineups WHERE matchId = :matchId")
    suspend fun deleteByMatchId(matchId: String)
}

@Dao
interface NotificationDao {
    @Query("SELECT * FROM notifications ORDER BY createdAt DESC")
    fun getAllFlow(): Flow<List<NotificationEntity>>

    @Query("SELECT * FROM notifications ORDER BY createdAt DESC")
    suspend fun getAll(): List<NotificationEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(notifications: List<NotificationEntity>)

    @Query("UPDATE notifications SET isRead = 1 WHERE id IN (:ids)")
    suspend fun markAsRead(ids: List<String>)
}

@Dao
interface PendingWriteDao {
    @Query("SELECT * FROM pending_writes ORDER BY createdAt ASC")
    suspend fun getAll(): List<PendingWriteEntity>

    @Insert
    suspend fun insert(pendingWrite: PendingWriteEntity)

    @Query("DELETE FROM pending_writes WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("UPDATE pending_writes SET retryCount = retryCount + 1 WHERE id = :id")
    suspend fun incrementRetry(id: Long)

    @Query("SELECT COUNT(*) FROM pending_writes")
    suspend fun count(): Int
}
