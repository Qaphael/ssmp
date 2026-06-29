package com.qaphael.ssmp.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qaphael.ssmp.data.local.NotificationEntity
import com.qaphael.ssmp.data.repository.TeamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val repository: TeamRepository
) : ViewModel() {

    val notifications = repository.notificationsFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.refreshNotifications()
            _isLoading.value = false
        }
    }

    fun markAllAsRead() {
        viewModelScope.launch {
            val unreadIds = notifications.value.filter { !it.isRead }.map { it.id }
            if (unreadIds.isNotEmpty()) {
                repository.markNotificationsAsRead(unreadIds)
            }
        }
    }
}
