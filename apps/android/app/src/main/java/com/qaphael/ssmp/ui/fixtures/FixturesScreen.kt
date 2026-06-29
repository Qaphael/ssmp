package com.qaphael.ssmp.ui.fixtures

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FixturesScreen(
    viewModel: FixturesViewModel,
    modifier: Modifier = Modifier,
    onNavigateToLineup: (String) -> Unit = {}
) {
    val fixtures by viewModel.fixtures.collectAsState()
    val matches by viewModel.matches.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "FIXTURES",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )

        errorMessage?.let {
            Text(it, color = MaterialTheme.colorScheme.error)
        }

        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(fixtures) { fixture ->
                FixtureCard(fixture = fixture)
            }
            items(matches) { match ->
                MatchCard(
                    match = match,
                    onNavigateToLineup = { onNavigateToLineup(match.id) }
                )
            }
        }
    }
}

@Composable
fun FixtureCard(fixture: com.qaphael.ssmp.data.remote.dto.FixtureDto) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Matchday ${fixture.matchday}", fontWeight = FontWeight.Bold)
            Text("${fixture.homeTeamName ?: "Home"} vs ${fixture.awayTeamName ?: "Away"}")
            Text("Scheduled: ${fixture.scheduledAt}", style = MaterialTheme.typography.bodySmall)
            Text("Status: ${fixture.status}", style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun MatchCard(
    match: com.qaphael.ssmp.data.local.MatchEntity,
    onNavigateToLineup: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onNavigateToLineup() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Matchday ${match.matchday}", fontWeight = FontWeight.Bold)
            Text("${match.homeTeamName} vs ${match.awayTeamName}")
            if (match.status != "scheduled") {
                Text("Score: ${match.homeScore} - ${match.awayScore}", fontWeight = FontWeight.Bold)
            }
            Text("Status: ${match.status}", style = MaterialTheme.typography.bodySmall)
            Text("Tap to manage lineup", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}
