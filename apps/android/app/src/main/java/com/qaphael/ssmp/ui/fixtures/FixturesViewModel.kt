package com.qaphael.ssmp.ui.fixtures

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qaphael.ssmp.data.remote.dto.FixtureDto
import com.qaphael.ssmp.data.remote.dto.MatchDto
import com.qaphael.ssmp.data.repository.TeamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FixturesViewModel @Inject constructor(
    private val repository: TeamRepository
) : ViewModel() {

    private val _fixtures = MutableStateFlow<List<FixtureDto>>(emptyList())
    val fixtures: StateFlow<List<FixtureDto>> = _fixtures.asStateFlow()

    val matches = repository.matchesFlow.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.refreshFixtures().onSuccess {
                _fixtures.value = it
            }.onFailure {
                _errorMessage.value = "Failed to load fixtures: ${it.message}"
            }
            repository.refreshMatches()
            _isLoading.value = false
        }
    }

    fun updateMatchStatus(matchId: String, status: String) {
        viewModelScope.launch {
            _isLoading.value = true
            repository.updateMatchStatus(matchId, status).onSuccess {
                refresh()
            }.onFailure {
                _errorMessage.value = "Failed to update match: ${it.message}"
            }
            _isLoading.value = false
        }
    }

    fun clearMessages() {
        _errorMessage.value = null
    }
}
