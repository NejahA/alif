package com.mickii.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mickii.app.MainViewModel

private val ROW1 = listOf("q","w","e","r","t","y","u","i","o","p")
private val ROW2 = listOf("a","s","d","f","g","h","j","k","l")
private val ROW3 = listOf("z","x","c","v","b","n","m")

private val SPECIAL_KEYS = listOf(
    "⊞ Win" to "win",
    "Ctrl"  to "ctrl",
    "Alt"   to "alt",
    "Tab"   to "tab",
    "Esc"   to "escape"
)

@Composable
fun KeyboardScreen(vm: MainViewModel) {
    val haptic = LocalHapticFeedback.current
    var shifted by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 12.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // ── Special keys ──────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            SPECIAL_KEYS.forEach { (label, key) ->
                SpecialKey(
                    label = label,
                    modifier = Modifier.weight(1f),
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        vm.typeKey(key)
                    }
                )
            }
        }

        Spacer(Modifier.weight(1f))

        // ── Alpha rows ────────────────────────────────────────────
        KeyRow {
            ROW1.forEach { k ->
                AlphaKey(
                    label = if (shifted) k.uppercase() else k,
                    modifier = Modifier.weight(1f),
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        vm.typeKey(if (shifted) k.uppercase() else k)
                        shifted = false
                    }
                )
            }
        }

        KeyRow {
            Spacer(Modifier.weight(0.5f))
            ROW2.forEach { k ->
                AlphaKey(
                    label = if (shifted) k.uppercase() else k,
                    modifier = Modifier.weight(1f),
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        vm.typeKey(if (shifted) k.uppercase() else k)
                        shifted = false
                    }
                )
            }
            Spacer(Modifier.weight(0.5f))
        }

        KeyRow {
            // Shift
            ActionKey(
                label = if (shifted) "⇧" else "⇧",
                modifier = Modifier.weight(1.5f),
                highlighted = shifted,
                onClick = { shifted = !shifted }
            )
            ROW3.forEach { k ->
                AlphaKey(
                    label = if (shifted) k.uppercase() else k,
                    modifier = Modifier.weight(1f),
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        vm.typeKey(if (shifted) k.uppercase() else k)
                        shifted = false
                    }
                )
            }
            // Backspace
            ActionKey(
                label = "⌫",
                modifier = Modifier.weight(1.5f),
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    vm.typeKey("backspace")
                }
            )
        }

        // ── Space / Enter ─────────────────────────────────────────
        KeyRow {
            ActionKey("?123", Modifier.weight(1.5f)) { /* switch to symbols */ }
            Spacer(Modifier.width(6.dp))
            // Space bar
            Box(
                modifier = Modifier
                    .weight(4f)
                    .height(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surface)
                    .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(10.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = rememberRipple()
                    ) {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        vm.typeKey("space")
                    },
                contentAlignment = Alignment.Center
            ) {
                Text("space", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Spacer(Modifier.width(6.dp))
            // Enter
            Box(
                modifier = Modifier
                    .weight(1.5f)
                    .height(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.primary)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = rememberRipple()
                    ) {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        vm.typeKey("enter")
                    },
                contentAlignment = Alignment.Center
            ) {
                Text("↵", fontSize = 16.sp, color = MaterialTheme.colorScheme.onPrimary)
            }
        }
    }
}

// ── Key composables ───────────────────────────────────────────────────────────

@Composable
private fun KeyRow(content: @Composable RowScope.() -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(5.dp),
        content = content
    )
}

@Composable
private fun AlphaKey(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(8.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple()
            ) { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(label, fontSize = 15.sp, fontWeight = FontWeight.Normal)
    }
}

@Composable
private fun ActionKey(
    label: String,
    modifier: Modifier = Modifier,
    highlighted: Boolean = false,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(
                if (highlighted) MaterialTheme.colorScheme.primary
                else MaterialTheme.colorScheme.surfaceVariant
            )
            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(8.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple()
            ) { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            label,
            fontSize = 14.sp,
            color = if (highlighted) MaterialTheme.colorScheme.onPrimary
                    else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SpecialKey(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .height(40.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(0.5.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(10.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple()
            ) { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
