package com.qaphael.ssmp.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "players")
data class PlayerEntity(
    @PrimaryKey val id: String,
    val teamId: String,
    val firstName: String,
    val lastName: String,
    val jerseyNumber: Int,
    val position: String,
    val dateOfBirth: String,
    val status: String,
    val photoUrl: String? = null,
    val nationality: String? = null,
    val height: Double? = null,
    val weight: Double? = null,
    val injuryDescription: String? = null,
    val injuryReturnDate: String? = null,
    val injuryMedicalNotes: String? = null
)

@Entity(tableName = "matches")
data class MatchEntity(
    @PrimaryKey val id: String,
    val fixtureId: String,
    val competitionId: String,
    val homeTeamId: String,
    val awayTeamId: String,
    val homeTeamName: String,
    val awayTeamName: String,
    val scheduledAt: String,
    val status: String,
    val homeScore: Int = 0,
    val awayScore: Int = 0,
    val pitchId: String? = null,
    val officialId: String? = null,
    val matchday: Int? = null
)

@Entity(tableName = "lineups")
data class LineupEntity(
    @PrimaryKey val id: String,
    val matchId: String,
    val teamId: String,
    val playerId: String,
    val isStarting: Boolean = true,
    val playerName: String? = null,
    val jerseyNumber: Int? = null,
    val isLocked: Boolean = false,
    val createdAt: String? = null
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey val id: String,
    val type: String,
    val title: String,
    val message: String,
    val isRead: Boolean = false,
    val createdAt: String
)

@Entity(tableName = "pending_writes")
data class PendingWriteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val entityType: String,
    val entityId: String,
    val action: String,
    val payload: String,
    val createdAt: Long = System.currentTimeMillis(),
    val retryCount: Int = 0
)

class StringListConverter {
    @TypeConverter
    fun fromString(value: String?): List<String> {
        if (value.isNullOrEmpty()) return emptyList()
        return value.split(",")
    }

    @TypeConverter
    fun toString(list: List<String>?): String {
        return list?.joinToString(",") ?: ""
    }
}
