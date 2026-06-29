package com.qaphael.ssmp.ui.roster

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.qaphael.ssmp.data.local.PlayerEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RosterScreen(
    viewModel: RosterViewModel,
    modifier: Modifier = Modifier
) {
    val players by viewModel.players.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val successMessage by viewModel.successMessage.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var showInjuryDialog by remember { mutableStateOf<PlayerEntity?>(null) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Player")
            }
        }
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = "ROSTER",
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

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(players) { player ->
                    PlayerCard(
                        player = player,
                        onMarkInjured = { showInjuryDialog = it },
                        onClearInjury = { viewModel.clearInjury(it.id) }
                    )
                }
            }
        }
    }

    if (showAddDialog) {
        AddPlayerDialog(
            onDismiss = { showAddDialog = false },
            onConfirm = { firstName, lastName, jersey, position, dob ->
                viewModel.addPlayer("current-team", firstName, lastName, jersey, position, dob)
                showAddDialog = false
            }
        )
    }

    showInjuryDialog?.let { player ->
        InjuryDialog(
            player = player,
            onDismiss = { showInjuryDialog = null },
            onConfirm = { description, returnDate, notes ->
                viewModel.markInjured(player.id, description, returnDate, notes)
                showInjuryDialog = null
            }
        )
    }
}

@Composable
fun PlayerCard(
    player: PlayerEntity,
    onMarkInjured: (PlayerEntity) -> Unit,
    onClearInjury: (PlayerEntity) -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "${player.firstName} ${player.lastName}",
                        fontWeight = FontWeight.Bold
                    )
                    Text("#${player.jerseyNumber} • ${player.position}", style = MaterialTheme.typography.bodySmall)
                }

                // Status badge
                Surface(
                    color = when (player.status) {
                        "injured" -> MaterialTheme.colorScheme.errorContainer
                        "suspended" -> MaterialTheme.colorScheme.tertiaryContainer
                        else -> MaterialTheme.colorScheme.primaryContainer
                    },
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = player.status.uppercase(),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (player.status) {
                            "injured" -> MaterialTheme.colorScheme.onErrorContainer
                            "suspended" -> MaterialTheme.colorScheme.onTertiaryContainer
                            else -> MaterialTheme.colorScheme.onPrimaryContainer
                        }
                    )
                }
            }

            // Injury details
            if (player.status == "injured" && player.injuryDescription != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                    )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                player.injuryDescription,
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        if (player.injuryReturnDate != null) {
                            Text(
                                "Expected return: ${player.injuryReturnDate}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        if (player.injuryMedicalNotes != null) {
                            Text(
                                player.injuryMedicalNotes,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                TextButton(
                    onClick = { onClearInjury(player) },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Clear Injury (Mark Active)")
                }
            }

            // Mark injured button for active players
            if (player.status == "active") {
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedButton(
                    onClick = { onMarkInjured(player) },
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Mark Injured")
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InjuryDialog(
    player: PlayerEntity,
    onDismiss: () -> Unit,
    onConfirm: (String, String, String?) -> Unit
) {
    var description by remember { mutableStateOf("") }
    var returnDate by remember { mutableStateOf("") }
    var medicalNotes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Report Injury: ${player.firstName} ${player.lastName}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Injury Description *") },
                    placeholder = { Text("e.g. ACL tear, hamstring strain") }
                )
                OutlinedTextField(
                    value = returnDate,
                    onValueChange = { returnDate = it },
                    label = { Text("Expected Return Date *") },
                    placeholder = { Text("YYYY-MM-DD") }
                )
                OutlinedTextField(
                    value = medicalNotes,
                    onValueChange = { medicalNotes = it },
                    label = { Text("Medical Notes (optional)") },
                    placeholder = { Text("Treatment plan, rehab schedule...") }
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onConfirm(description, returnDate, medicalNotes.ifBlank { null }) },
                enabled = description.isNotBlank() && returnDate.isNotBlank()
            ) { Text("Confirm") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddPlayerDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, Int, String, String) -> Unit
) {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var jerseyNumber by remember { mutableStateOf("") }
    var position by remember { mutableStateOf("") }
    var dateOfBirth by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Player") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = firstName, onValueChange = { firstName = it }, label = { Text("First Name") })
                OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Last Name") })
                OutlinedTextField(value = jerseyNumber, onValueChange = { jerseyNumber = it }, label = { Text("Jersey Number") })
                OutlinedTextField(value = position, onValueChange = { position = it }, label = { Text("Position") })
                OutlinedTextField(value = dateOfBirth, onValueChange = { dateOfBirth = it }, label = { Text("Date of Birth (YYYY-MM-DD)") })
            }
        },
        confirmButton = {
            TextButton(onClick = {
                onConfirm(firstName, lastName, jerseyNumber.toIntOrNull() ?: 0, position, dateOfBirth)
            }) { Text("Add") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
