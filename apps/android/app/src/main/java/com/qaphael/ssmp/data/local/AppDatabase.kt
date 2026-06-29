package com.qaphael.ssmp.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [
        PlayerEntity::class,
        MatchEntity::class,
        LineupEntity::class,
        NotificationEntity::class,
        PendingWriteEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(StringListConverter::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun playerDao(): PlayerDao
    abstract fun matchDao(): MatchDao
    abstract fun lineupDao(): LineupDao
    abstract fun notificationDao(): NotificationDao
    abstract fun pendingWriteDao(): PendingWriteDao
}
