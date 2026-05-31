package com.mickii.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.sp
import com.mickii.app.network.ConnectionState
import com.mickii.app.ui.*

data class NavItem(val label: String, val icon: ImageVector, val index: Int)

val NAV_ITEMS = listOf(
    NavItem("Touchpad", Icons.Default.TouchApp, 0),
    NavItem("Keyboard", Icons.Default.Keyboard, 1),
    NavItem("Media",    Icons.Default.MusicNote, 2),
)

class MainActivity : ComponentActivity() {

    private val vm: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MickiiTheme {
                MickiiApp(vm)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MickiiApp(vm: MainViewModel) {
    val connectionState by vm.connectionState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    val connected = connectionState == ConnectionState.CONNECTED

    if (!connected) {
        // Show connect screen until connected
        ConnectScreen(vm)
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "mickii",
                        color = MaterialTheme.colorScheme.primary,
                        letterSpacing = (-0.5).sp
                    )
                },
                actions = {
                    // Connection indicator
                    AssistChip(
                        onClick = { vm.disconnect() },
                        label = { Text("Connected", style = MaterialTheme.typography.labelSmall) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Circle,
                                contentDescription = null,
                                modifier = Modifier.size(8.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    )
                    Spacer(Modifier.width(8.dp))
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NAV_ITEMS.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = selectedTab == item.index,
                        onClick = { selectedTab = item.index }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(Modifier.padding(innerPadding)) {
            when (selectedTab) {
                0 -> TouchpadScreen(vm)
                1 -> KeyboardScreen(vm)
                2 -> MediaScreen(vm)
            }
        }
    }
}
