package com.qaphael.ssmp.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qaphael.ssmp.data.local.MatchEntity
import com.qaphael.ssmp.data.local.PlayerEntity
import com.qaphael.ssmp.data.local.NotificationEntity
import com.qaphael.ssmp.data.repository.TeamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: TeamRepository
) : ViewModel() {

    val players = repository.playersFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val matches = repository.matchesFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

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
            repository.refreshPlayers()
            repository.refreshMatches()
            repository.refreshNotifications()
            _isLoading.value = false
        }
    }

    val activeCount: StateFlow<Int> = players.map { list ->
        list.count { it.status == "active" }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val injuredCount: StateFlow<Int> = players.map { list ->
        list.count { it.status == "injured" }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val suspendedCount: StateFlow<Int> = players.map { list ->
        list.count { it.status == "suspended" }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val nextMatch: StateFlow<MatchEntity?> = matches.map { list ->
        list.filter { it.status == "scheduled" }.minByOrNull { it.scheduledAt }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
}
