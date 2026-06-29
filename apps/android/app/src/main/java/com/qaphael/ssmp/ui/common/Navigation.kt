package com.qaphael.ssmp.ui.common

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.qaphael.ssmp.ui.dashboard.DashboardScreen
import com.qaphael.ssmp.ui.dashboard.DashboardViewModel
import com.qaphael.ssmp.ui.fixtures.FixturesScreen
import com.qaphael.ssmp.ui.fixtures.FixturesViewModel
import com.qaphael.ssmp.ui.lineup.LineupScreen
import com.qaphael.ssmp.ui.lineup.LineupViewModel
import com.qaphael.ssmp.ui.notifications.NotificationsScreen
import com.qaphael.ssmp.ui.notifications.NotificationsViewModel
import com.qaphael.ssmp.ui.roster.RosterScreen
import com.qaphael.ssmp.ui.roster.RosterViewModel

sealed class Screen(val route: String, val label: String, val icon: ImageVector, val selectedIcon: ImageVector) {
    data object Dashboard : Screen("dashboard", "Dashboard", Icons.Outlined.Dashboard, Icons.Filled.Dashboard)
    data object Roster : Screen("roster", "Roster", Icons.Outlined.People, Icons.Filled.People)
    data object Fixtures : Screen("fixtures", "Fixtures", Icons.Outlined.CalendarMonth, Icons.Filled.CalendarMonth)
    data object Lineup : Screen("lineup/{matchId}", "Lineup", Icons.Outlined.SportsSoccer, Icons.Filled.SportsSoccer)
    data object Notifications : Screen("notifications", "Alerts", Icons.Outlined.Notifications, Icons.Filled.Notifications)
}

val bottomNavItems = listOf(Screen.Dashboard, Screen.Roster, Screen.Fixtures, Screen.Notifications)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SSMPApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { screen ->
                    val selected = currentRoute == screen.route
                    NavigationBarItem(
                        icon = {
                            Icon(
                                if (selected) screen.selectedIcon else screen.icon,
                                contentDescription = screen.label
                            )
                        },
                        label = { Text(screen.label) },
                        selected = selected,
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(Screen.Dashboard.route) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) {
                val viewModel: DashboardViewModel = hiltViewModel()
                DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToLineup = { matchId ->
                        navController.navigate("lineup/$matchId")
                    }
                )
            }

            composable(Screen.Roster.route) {
                val viewModel: RosterViewModel = hiltViewModel()
                RosterScreen(viewModel = viewModel)
            }

            composable(Screen.Fixtures.route) {
                val viewModel: FixturesViewModel = hiltViewModel()
                FixturesScreen(
                    viewModel = viewModel,
                    onNavigateToLineup = { matchId ->
                        navController.navigate("lineup/$matchId")
                    }
                )
            }

            composable(
                route = Screen.Lineup.route,
                arguments = listOf(navArgument("matchId") { type = NavType.StringType })
            ) {
                val viewModel: LineupViewModel = hiltViewModel()
                LineupScreen(viewModel = viewModel)
            }

            composable(Screen.Notifications.route) {
                val viewModel: NotificationsViewModel = hiltViewModel()
                NotificationsScreen(viewModel = viewModel)
            }
        }
    }
}
