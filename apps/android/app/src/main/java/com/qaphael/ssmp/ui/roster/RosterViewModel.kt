package com.qaphael.ssmp.ui.roster

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qaphael.ssmp.data.local.PlayerEntity
import com.qaphael.ssmp.data.remote.dto.CreatePlayerRequest
import com.qaphael.ssmp.data.remote.dto.UpdatePlayerRequest
import com.qaphael.ssmp.data.repository.TeamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RosterViewModel @Inject constructor(
    private val repository: TeamRepository
) : ViewModel() {

    val players = repository.playersFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.refreshPlayers()
            _isLoading.value = false
        }
    }

    fun addPlayer(
        teamId: String,
        firstName: String,
        lastName: String,
        jerseyNumber: Int,
        position: String,
        dateOfBirth: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.createPlayer(
                CreatePlayerRequest(teamId, firstName, lastName, jerseyNumber, position, dateOfBirth)
            )
            result.onSuccess {
                _successMessage.value = "Player added successfully"
                _errorMessage.value = null
            }.onFailure {
                _errorMessage.value = "Failed to add player: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    fun updatePlayer(
        id: String,
        firstName: String? = null,
        lastName: String? = null,
        jerseyNumber: Int? = null,
        position: String? = null,
        status: String? = null
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.updatePlayer(id, UpdatePlayerRequest(firstName, lastName, jerseyNumber, position, status))
            result.onSuccess {
                _successMessage.value = "Player updated"
                _errorMessage.value = null
            }.onFailure {
                _errorMessage.value = "Failed to update player: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    fun markInjured(playerId: String, description: String, expectedReturnDate: String, medicalNotes: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.markInjured(playerId, description, expectedReturnDate, medicalNotes)
            result.onSuccess {
                _successMessage.value = "Player marked as injured"
                _errorMessage.value = null
            }.onFailure {
                _errorMessage.value = "Failed to mark injury: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    fun clearInjury(playerId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.clearInjury(playerId)
            result.onSuccess {
                _successMessage.value = "Injury cleared"
                _errorMessage.value = null
            }.onFailure {
                _errorMessage.value = "Failed to clear injury: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    fun deletePlayer(id: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = repository.deletePlayer(id)
            result.onSuccess {
                _successMessage.value = "Player removed"
                _errorMessage.value = null
            }.onFailure {
                _errorMessage.value = "Failed to remove player: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    fun clearMessages() {
        _errorMessage.value = null
        _successMessage.value = null
    }
}
