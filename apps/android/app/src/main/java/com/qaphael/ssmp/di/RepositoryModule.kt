package com.qaphael.ssmp.di

import com.qaphael.ssmp.data.repository.AuthRepository
import com.qaphael.ssmp.data.repository.TeamRepository
import com.qaphael.ssmp.data.repository.OfflineQueue
import com.qaphael.ssmp.data.remote.api.SsmpApiService
import com.qaphael.ssmp.data.local.PlayerDao
import com.qaphael.ssmp.data.local.MatchDao
import com.qaphael.ssmp.data.local.LineupDao
import com.qaphael.ssmp.data.local.NotificationDao
import com.qaphael.ssmp.data.local.PendingWriteDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideOfflineQueue(pendingWriteDao: PendingWriteDao): OfflineQueue =
        OfflineQueue(pendingWriteDao)

    @Provides
    @Singleton
    fun provideTeamRepository(
        api: SsmpApiService,
        playerDao: PlayerDao,
        matchDao: MatchDao,
        lineupDao: LineupDao,
        notificationDao: NotificationDao,
        offlineQueue: OfflineQueue
    ): TeamRepository = TeamRepository(api, playerDao, matchDao, lineupDao, notificationDao, offlineQueue)

    @Provides
    @Singleton
    fun provideAuthRepository(api: SsmpApiService): AuthRepository = AuthRepository(api)
}
