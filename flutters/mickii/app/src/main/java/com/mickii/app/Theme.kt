package com.mickii.app

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary          = Color(0xFF2563EB),
    onPrimary        = Color.White,
    primaryContainer = Color(0xFFEFF6FF),
    onPrimaryContainer = Color(0xFF1E3A8A),
    secondary        = Color(0xFF64748B),
    surface          = Color.White,
    surfaceVariant   = Color(0xFFF1F5F9),
    background       = Color(0xFFF8FAFC),
    outline          = Color(0xFFCBD5E1),
    outlineVariant   = Color(0xFFE2E8F0),
)

private val DarkColors = darkColorScheme(
    primary          = Color(0xFF60A5FA),
    onPrimary        = Color(0xFF1E3A8A),
    primaryContainer = Color(0xFF1E3A8A),
    onPrimaryContainer = Color(0xFFBFDBFE),
    secondary        = Color(0xFF94A3B8),
    surface          = Color(0xFF1E293B),
    surfaceVariant   = Color(0xFF0F172A),
    background       = Color(0xFF0F172A),
    outline          = Color(0xFF334155),
    outlineVariant   = Color(0xFF1E293B),
)

@Composable
fun MickiiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography  = Typography(),
        content     = content
    )
}
