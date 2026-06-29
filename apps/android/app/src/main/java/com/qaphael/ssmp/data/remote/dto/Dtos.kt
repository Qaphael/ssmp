package com.qaphael.ssmp.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// Auth
@JsonClass(generateAdapter = true)
data class LoginRequest(val email: String, val password: String)

@JsonClass(generateAdapter = true)
data class RegisterRequest(
    val email: String,
    val password: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    val role: String
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    val token: String,
    val user: UserDto
)

@JsonClass(generateAdapter = true)
data class UserDto(
    val id: String,
    val email: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    val role: String
)

// Player
@JsonClass(generateAdapter = true)
data class PlayerDto(
    val id: String,
    @Json(name = "teamId") val teamId: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "jerseyNumber") val jerseyNumber: Int,
    val position: String,
    @Json(name = "dateOfBirth") val dateOfBirth: String,
    val status: String,
    @Json(name = "photoUrl") val photoUrl: String? = null,
    val nationality: String? = null,
    val height: Double? = null,
    val weight: Double? = null,
    @Json(name = "injuryDetails") val injuryDetails: InjuryDetailsDto? = null
)

@JsonClass(generateAdapter = true)
data class InjuryDetailsDto(
    val description: String,
    @Json(name = "expectedReturnDate") val expectedReturnDate: String,
    @Json(name = "medicalNotes") val medicalNotes: String? = null
)

@JsonClass(generateAdapter = true)
data class CreatePlayerRequest(
    @Json(name = "teamId") val teamId: String,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "jerseyNumber") val jerseyNumber: Int,
    val position: String,
    @Json(name = "dateOfBirth") val dateOfBirth: String,
    val status: String = "active"
)

@JsonClass(generateAdapter = true)
data class UpdatePlayerRequest(
    @Json(name = "firstName") val firstName: String? = null,
    @Json(name = "lastName") val lastName: String? = null,
    @Json(name = "jerseyNumber") val jerseyNumber: Int? = null,
    val position: String? = null,
    val status: String? = null
)

@JsonClass(generateAdapter = true)
data class MarkInjuredRequest(
    val description: String,
    @Json(name = "expectedReturnDate") val expectedReturnDate: String,
    @Json(name = "medicalNotes") val medicalNotes: String? = null
)

// Match
@JsonClass(generateAdapter = true)
data class MatchDto(
    val id: String,
    @Json(name = "fixtureId") val fixtureId: String,
    @Json(name = "competitionId") val competitionId: String,
    @Json(name = "homeTeamId") val homeTeamId: String,
    @Json(name = "awayTeamId") val awayTeamId: String,
    @Json(name = "homeTeamName") val homeTeamName: String? = null,
    @Json(name = "awayTeamName") val awayTeamName: String? = null,
    @Json(name = "homeScore") val homeScore: Int = 0,
    @Json(name = "awayScore") val awayScore: Int = 0,
    val status: String,
    @Json(name = "scheduledAt") val scheduledAt: String,
    @Json(name = "pitchId") val pitchId: String? = null,
    @Json(name = "officialId") val officialId: String? = null,
    @Json(name = "matchday") val matchday: Int? = null
)

@JsonClass(generateAdapter = true)
data class UpdateMatchStatusRequest(val status: String)

// Fixture
@JsonClass(generateAdapter = true)
data class FixtureDto(
    val id: String,
    @Json(name = "competitionId") val competitionId: String,
    @Json(name = "matchday") val matchday: Int,
    @Json(name = "homeTeamId") val homeTeamId: String,
    @Json(name = "awayTeamId") val awayTeamId: String,
    @Json(name = "homeTeamName") val homeTeamName: String? = null,
    @Json(name = "awayTeamName") val awayTeamName: String? = null,
    @Json(name = "scheduledAt") val scheduledAt: String,
    @Json(name = "pitchId") val pitchId: String? = null,
    val status: String,
    @Json(name = "homeScore") val homeScore: Int? = null,
    @Json(name = "awayScore") val awayScore: Int? = null,
    @Json(name = "officialId") val officialId: String? = null
)

// Lineup
@JsonClass(generateAdapter = true)
data class LineupDto(
    val id: String,
    @Json(name = "matchId") val matchId: String,
    @Json(name = "teamId") val teamId: String,
    @Json(name = "playerIds") val playerIds: List<String>,
    @Json(name = "isStarting") val isStarting: Boolean,
    @Json(name = "isLocked") val isLocked: Boolean
)

@JsonClass(generateAdapter = true)
data class CreateLineupRequest(
    @Json(name = "matchId") val matchId: String,
    @Json(name = "teamId") val teamId: String,
    @Json(name = "playerIds") val playerIds: List<String>,
    @Json(name = "isStarting") val isStarting: Boolean = true,
    @Json(name = "submittedBy") val submittedBy: String
)

// Match Event
@JsonClass(generateAdapter = true)
data class MatchEventDto(
    val id: String,
    @Json(name = "matchId") val matchId: String,
    val type: String,
    val minute: Int,
    @Json(name = "playerId") val playerId: String? = null,
    @Json(name = "teamId") val teamId: String? = null,
    val description: String? = null,
    @Json(name = "recordedBy") val recordedBy: String
)

@JsonClass(generateAdapter = true)
data class CreateMatchEventRequest(
    @Json(name = "matchId") val matchId: String,
    val type: String,
    val minute: Int,
    @Json(name = "playerId") val playerId: String? = null,
    @Json(name = "teamId") val teamId: String? = null,
    val description: String? = null,
    @Json(name = "recordedBy") val recordedBy: String
)

// Notification
@JsonClass(generateAdapter = true)
data class NotificationDto(
    val id: String,
    val type: String,
    val title: String,
    val message: String,
    @Json(name = "isRead") val isRead: Boolean,
    @Json(name = "createdAt") val createdAt: String
)

@JsonClass(generateAdapter = true)
data class MarkNotificationReadRequest(val ids: List<String>)

// Competition
@JsonClass(generateAdapter = true)
data class CompetitionDto(
    val id: String,
    @Json(name = "seasonId") val seasonId: String,
    val name: String,
    val sport: String,
    val status: String
)

// Standing
@JsonClass(generateAdapter = true)
data class StandingDto(
    val id: String,
    @Json(name = "competitionId") val competitionId: String,
    @Json(name = "teamId") val teamId: String,
    val played: Int,
    val won: Int,
    val drawn: Int,
    val lost: Int,
    @Json(name = "goalsFor") val goalsFor: Int,
    @Json(name = "goalsAgainst") val goalsAgainst: Int,
    @Json(name = "goalDifference") val goalDifference: Int,
    val points: Int,
    val position: Int? = null
)
