package com.qaphael.ssmp.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    modifier: Modifier = Modifier,
    onNavigateToLineup: (String) -> Unit
) {
    val players by viewModel.players.collectAsState()
    val matches by viewModel.matches.collectAsState()
    val notifications by viewModel.notifications.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val activeCount by viewModel.activeCount.collectAsState()
    val injuredCount by viewModel.injuredCount.collectAsState()
    val suspendedCount by viewModel.suspendedCount.collectAsState()
    val nextMatch by viewModel.nextMatch.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "COACH DASHBOARD",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
            letterSpacing = 1.sp
        )

        Text(
            text = "Team Overview",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )

        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        }

        // Player stats
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Player Stats", fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    StatChip("Active", activeCount, MaterialTheme.colorScheme.primary)
                    StatChip("Injured", injuredCount, MaterialTheme.colorScheme.error)
                    StatChip("Suspended", suspendedCount, MaterialTheme.colorScheme.tertiary)
                }
            }
        }

        // Next match
        nextMatch?.let { match ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Next Match", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${match.homeTeamName} vs ${match.awayTeamName}")
                    Text("Scheduled: ${match.scheduledAt}", style = MaterialTheme.typography.bodySmall)
                    Text("Status: ${match.status}", style = MaterialTheme.typography.bodySmall)
                }
            }
        }

        // Recent notifications
        if (notifications.isNotEmpty()) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Recent Notifications", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    notifications.take(3).forEach { notification ->
                        Text(notification.title, fontWeight = FontWeight.Medium)
                        Text(notification.message, style = MaterialTheme.typography.bodySmall)
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun StatChip(label: String, count: Int, color: androidx.compose.ui.graphics.Color) {
    Card(colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("$count", fontWeight = FontWeight.Bold, color = color)
            Text(label, style = MaterialTheme.typography.bodySmall)
        }
    }
}
