package com.qaphael.ssmp.data.repository

import com.qaphael.ssmp.data.remote.api.SsmpApiService
import com.qaphael.ssmp.data.remote.dto.*
import com.qaphael.ssmp.data.remote.AuthInterceptor
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: SsmpApiService,
    private val authInterceptor: AuthInterceptor
) {
    suspend fun login(email: String, password: String): Result<String> {
        return try {
            val response = api.login(LoginRequest(email, password))
            authInterceptor.setToken(response.token)
            Result.success(response.token)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun setToken(token: String) { authInterceptor.setToken(token) }
    fun logout() { authInterceptor.setToken(null) }
}
