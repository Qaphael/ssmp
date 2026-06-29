package com.qaphael.ssmp.data.repository

import android.util.Log
import com.qaphael.ssmp.data.local.*
import com.qaphael.ssmp.data.remote.api.SsmpApiService
import com.qaphael.ssmp.data.remote.dto.*
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TeamRepository @Inject constructor(
    private val api: SsmpApiService,
    private val playerDao: PlayerDao,
    private val matchDao: MatchDao,
    private val lineupDao: LineupDao,
    private val notificationDao: NotificationDao,
    private val offlineQueue: OfflineQueue
) {
    val playersFlow: Flow<List<PlayerEntity>> = playerDao.getAllFlow()
    val matchesFlow: Flow<List<MatchEntity>> = matchDao.getAllFlow()
    val lineupsFlow: Flow<List<LineupEntity>> = lineupDao.getAllFlow()
    val notificationsFlow: Flow<List<NotificationEntity>> = notificationDao.getAllFlow()

    // --- Players ---
    suspend fun refreshPlayers() {
        try {
            val players = api.getPlayers()
            playerDao.insertAll(players.map { it.toEntity("current-team") })
        } catch (e: Exception) {
            Log.e("TeamRepo", "Error refreshing players", e)
        }
    }

    suspend fun createPlayer(request: CreatePlayerRequest): Result<PlayerDto> {
        return try {
            val player = api.createPlayer(request)
            playerDao.insert(player.toEntity(request.teamId))
            Result.success(player)
        } catch (e: Exception) {
            offlineQueue.enqueue("player", "new", "create", request)
            Result.failure(e)
        }
    }

    suspend fun updatePlayer(id: String, request: UpdatePlayerRequest): Result<PlayerDto> {
        return try {
            val player = api.updatePlayer(id, request)
            playerDao.insert(player.toEntity("current-team"))
            Result.success(player)
        } catch (e: Exception) {
            offlineQueue.enqueue("player", id, "update", request)
            Result.failure(e)
        }
    }

    suspend fun markInjured(
        playerId: String,
        description: String,
        expectedReturnDate: String,
        medicalNotes: String?
    ): Result<PlayerDto> {
        return try {
            val player = api.markInjured(playerId, MarkInjuredRequest(description, expectedReturnDate, medicalNotes))
            playerDao.insert(player.toEntity("current-team"))
            Result.success(player)
        } catch (e: Exception) {
            offlineQueue.enqueue("player", playerId, "injury", mapOf(
                "description" to description,
                "expectedReturnDate" to expectedReturnDate,
                "medicalNotes" to (medicalNotes ?: "")
            ))
            Result.failure(e)
        }
    }

    suspend fun clearInjury(playerId: String): Result<PlayerDto> {
        return try {
            val player = api.clearInjury(playerId)
            playerDao.insert(player.toEntity("current-team"))
            Result.success(player)
        } catch (e: Exception) {
            offlineQueue.enqueue("player", playerId, "clear-injury", mapOf("playerId" to playerId))
            Result.failure(e)
        }
    }

    suspend fun deletePlayer(id: String): Result<Unit> {
        return try {
            api.deletePlayer(id)
            playerDao.deleteById(id)
            Result.success(Unit)
        } catch (e: Exception) {
            offlineQueue.enqueue("player", id, "delete", mapOf("id" to id))
            Result.failure(e)
        }
    }

    // --- Matches ---
    suspend fun refreshMatches() {
        try {
            val matches = api.getMatches()
            matchDao.insertAll(matches.map { it.toEntity() })
        } catch (e: Exception) {
            Log.e("TeamRepo", "Error refreshing matches", e)
        }
    }

    suspend fun updateMatchStatus(id: String, status: String): Result<MatchDto> {
        return try {
            val match = api.updateMatchStatus(id, UpdateMatchStatusRequest(status))
            matchDao.insert(match.toEntity())
            Result.success(match)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // --- Lineups ---
    suspend fun getLineup(matchId: String): LineupEntity? = lineupDao.getByMatchId(matchId)

    suspend fun submitLineup(
        matchId: String,
        teamId: String,
        playerIds: List<String>,
        submittedBy: String
    ): Result<LineupDto> {
        return try {
            val lineup = api.submitLineup(matchId, CreateLineupRequest(matchId, teamId, playerIds, true, submittedBy))
            lineupDao.insert(lineup.toEntity())
            Result.success(lineup)
        } catch (e: Exception) {
            offlineQueue.enqueue("lineup", matchId, "create", mapOf(
                "matchId" to matchId, "teamId" to teamId, "playerIds" to playerIds, "submittedBy" to submittedBy
            ))
            Result.failure(e)
        }
    }

    // --- Notifications ---
    suspend fun refreshNotifications() {
        try {
            val notifications = api.getNotifications()
            notificationDao.insertAll(notifications.map { it.toEntity() })
        } catch (e: Exception) {
            Log.e("TeamRepo", "Error refreshing notifications", e)
        }
    }

    suspend fun markNotificationsAsRead(ids: List<String>): Result<Unit> {
        return try {
            api.markNotificationsRead(MarkNotificationReadRequest(ids))
            notificationDao.markAsRead(ids)
            Result.success(Unit)
        } catch (e: Exception) {
            notificationDao.markAsRead(ids)
            Result.failure(e)
        }
    }

    // --- Fixtures ---
    suspend fun refreshFixtures(): Result<List<FixtureDto>> {
        return try {
            Result.success(api.getFixtures())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // --- Competitions ---
    suspend fun refreshCompetitions(): Result<List<CompetitionDto>> {
        return try {
            Result.success(api.getCompetitions())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // --- Standings ---
    suspend fun getStandings(competitionId: String): Result<List<StandingDto>> {
        return try {
            Result.success(api.getStandings(competitionId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // --- Match Events ---
    suspend fun refreshMatchEvents(matchId: String): Result<List<MatchEventDto>> {
        return try {
            Result.success(api.getMatchEvents(matchId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createMatchEvent(matchId: String, request: CreateMatchEventRequest): Result<MatchEventDto> {
        return try {
            Result.success(api.createMatchEvent(matchId, request))
        } catch (e: Exception) {
            offlineQueue.enqueue("match_event", matchId, "create", request)
            Result.failure(e)
        }
    }

    // --- Mappers ---
    private fun PlayerDto.toEntity(teamId: String) = PlayerEntity(
        id = id, teamId = teamId, firstName = firstName, lastName = lastName,
        jerseyNumber = jerseyNumber, position = position, dateOfBirth = dateOfBirth,
        status = status, photoUrl = photoUrl, nationality = nationality,
        height = height, weight = weight,
        injuryDescription = injuryDetails?.description,
        injuryReturnDate = injuryDetails?.expectedReturnDate,
        injuryMedicalNotes = injuryDetails?.medicalNotes
    )

    private fun MatchDto.toEntity() = MatchEntity(
        id = id, fixtureId = fixtureId, competitionId = competitionId,
        homeTeamId = homeTeamId, awayTeamId = awayTeamId,
        homeTeamName = homeTeamName ?: "Home", awayTeamName = awayTeamName ?: "Away",
        scheduledAt = scheduledAt, status = status, homeScore = homeScore,
        awayScore = awayScore, pitchId = pitchId, officialId = officialId, matchday = matchday
    )

    private fun LineupDto.toEntity() = LineupEntity(
        matchId = matchId, teamId = teamId, playerIds = playerIds,
        isStarting = isStarting, isLocked = isLocked
    )

    private fun NotificationDto.toEntity() = NotificationEntity(
        id = id, type = type, title = title, message = message,
        isRead = isRead, createdAt = createdAt
    )
}
