package com.qaphael.ssmp.data.remote.api

import com.qaphael.ssmp.data.remote.dto.*
import retrofit2.http.*

interface SsmpApiService {
    // Auth
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    // Players
    @GET("api/players")
    suspend fun getPlayers(): List<PlayerDto>

    @POST("api/players")
    suspend fun createPlayer(@Body request: CreatePlayerRequest): PlayerDto

    @PATCH("api/players/{id}")
    suspend fun updatePlayer(@Path("id") id: String, @Body request: UpdatePlayerRequest): PlayerDto

    @PATCH("api/players/{id}/injury")
    suspend fun markInjured(@Path("id") id: String, @Body request: MarkInjuredRequest): PlayerDto

    @DELETE("api/players/{id}/injury")
    suspend fun clearInjury(@Path("id") id: String): PlayerDto

    @DELETE("api/players/{id}")
    suspend fun deletePlayer(@Path("id") id: String)

    // Matches
    @GET("api/matches")
    suspend fun getMatches(): List<MatchDto>

    @GET("api/matches/{id}")
    suspend fun getMatchById(@Path("id") id: String): MatchDto

    @PATCH("api/matches/{id}/status")
    suspend fun updateMatchStatus(@Path("id") id: String, @Body request: UpdateMatchStatusRequest): MatchDto

    // Fixtures
    @GET("api/fixtures")
    suspend fun getFixtures(): List<FixtureDto>

    // Lineups
    @GET("api/matches/{matchId}/lineup")
    suspend fun getLineup(@Path("matchId") matchId: String): LineupResponse

    @POST("api/matches/{matchId}/lineup")
    suspend fun submitLineup(@Path("matchId") matchId: String, @Body request: SubmitLineupRequest): LineupResponse

    @POST("api/matches/{matchId}/lineup/lock")
    suspend fun lockLineup(@Path("matchId") matchId: String): LineupResponse

    // Match Events
    @GET("api/matches/{matchId}/events")
    suspend fun getMatchEvents(@Path("matchId") matchId: String): List<MatchEventDto>

    @POST("api/matches/{matchId}/events")
    suspend fun createMatchEvent(@Path("matchId") matchId: String, @Body request: CreateMatchEventRequest): MatchEventDto

    // Notifications
    @GET("api/notifications")
    suspend fun getNotifications(): List<NotificationDto>

    @PATCH("api/notifications/read")
    suspend fun markNotificationsRead(@Body request: MarkNotificationReadRequest): List<NotificationDto>

    // Competitions
    @GET("api/competitions")
    suspend fun getCompetitions(): List<CompetitionDto>

    @GET("api/competitions/{id}")
    suspend fun getCompetitionById(@Path("id") id: String): CompetitionDto

    // Standings
    @GET("api/competitions/{competitionId}/standings")
    suspend fun getStandings(@Path("competitionId") competitionId: String): List<StandingDto>
}
