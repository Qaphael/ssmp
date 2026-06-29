package com.qaphael.ssmp.di

import android.content.Context
import androidx.room.Room
import com.qaphael.ssmp.data.local.AppDatabase
import com.qaphael.ssmp.data.local.PendingWriteDao
import com.qaphael.ssmp.data.local.PlayerDao
import com.qaphael.ssmp.data.local.MatchDao
import com.qaphael.ssmp.data.local.LineupDao
import com.qaphael.ssmp.data.local.NotificationDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "ssmp_db")
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    fun providePlayerDao(db: AppDatabase): PlayerDao = db.playerDao()

    @Provides
    fun provideMatchDao(db: AppDatabase): MatchDao = db.matchDao()

    @Provides
    fun provideLineupDao(db: AppDatabase): LineupDao = db.lineupDao()

    @Provides
    fun provideNotificationDao(db: AppDatabase): NotificationDao = db.notificationDao()

    @Provides
    fun providePendingWriteDao(db: AppDatabase): PendingWriteDao = db.pendingWriteDao()
}
