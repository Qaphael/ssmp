package com.qaphael.ssmp.ui.lineup

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.qaphael.ssmp.data.local.PlayerEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LineupScreen(
    viewModel: LineupViewModel,
    modifier: Modifier = Modifier
) {
    val players by viewModel.players.collectAsState()
    val currentLineup by viewModel.currentLineup.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val successMessage by viewModel.successMessage.collectAsState()

    var selectedPlayers by remember { mutableStateOf(setOf<String>()) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "LINEUP",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )

        errorMessage?.let {
            Text(it, color = MaterialTheme.colorScheme.error)
        }

        successMessage?.let {
            Text(it, color = MaterialTheme.colorScheme.primary)
        }

        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        }

        Text("Select 11 starting players:", fontWeight = FontWeight.Medium)
        Text("${selectedPlayers.size}/11 selected", style = MaterialTheme.typography.bodySmall)

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            items(players) { player ->
                PlayerLineupItem(
                    player = player,
                    isSelected = player.id in selectedPlayers,
                    onToggle = {
                        if (player.id in selectedPlayers) {
                            selectedPlayers = selectedPlayers - player.id
                        } else if (selectedPlayers.size < 11) {
                            selectedPlayers = selectedPlayers + player.id
                        }
                    }
                )
            }
        }

        Button(
            onClick = {
                viewModel.saveLineup(
                    matchId = "current-match",
                    teamId = "current-team",
                    playerIds = selectedPlayers.toList(),
                    submittedBy = "coach-001"
                )
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = selectedPlayers.size == 11 && !isLoading
        ) {
            Text("Submit Lineup")
        }
    }
}

@Composable
fun PlayerLineupItem(
    player: PlayerEntity,
    isSelected: Boolean,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer
            else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    "${player.firstName} ${player.lastName}",
                    fontWeight = FontWeight.Medium
                )
                Text("#${player.jerseyNumber} • ${player.position}", style = MaterialTheme.typography.bodySmall)
            }
            Checkbox(checked = isSelected, onCheckedChange = { onToggle() })
        }
    }
}
