package com.qaphael.ssmp.ui.lineup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qaphael.ssmp.data.local.LineupEntity
import com.qaphael.ssmp.data.local.PlayerEntity
import com.qaphael.ssmp.data.repository.TeamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LineupViewModel @Inject constructor(
    private val repository: TeamRepository
) : ViewModel() {

    val players = repository.playersFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val lineups = repository.lineupsFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    private val _selectedMatchId = MutableStateFlow<String?>(null)
    val selectedMatchId: StateFlow<String?> = _selectedMatchId.asStateFlow()

    private val _currentLineup = MutableStateFlow<LineupEntity?>(null)
    val currentLineup: StateFlow<LineupEntity?> = _currentLineup.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage.asStateFlow()

    fun selectMatch(matchId: String?) {
        _selectedMatchId.value = matchId
        if (matchId != null) {
            viewModelScope.launch {
                _isLoading.value = true
                _currentLineup.value = repository.getLineup(matchId)
                _isLoading.value = false
            }
        } else {
            _currentLineup.value = null
        }
    }

    fun saveLineup(matchId: String, teamId: String, playerIds: List<String>, submittedBy: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.submitLineup(matchId, teamId, playerIds, submittedBy)
            result.onSuccess {
                _currentLineup.value = LineupEntity(matchId, teamId, playerIds, true, false)
                _successMessage.value = "Lineup submitted"
                _errorMessage.value = null
            }.onFailure {
                _errorMessage.value = "Failed to save lineup: ${it.message} (queued for offline sync)"
            }
            _isLoading.value = false
        }
    }

    fun clearMessages() {
        _errorMessage.value = null
        _successMessage.value = null
    }
}
