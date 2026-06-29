package com.qaphael.ssmp.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = BentoSecondary,
    secondary = BentoPrimary,
    tertiary = BentoBg,
    background = Color(0xFF1D1B1E),
    surface = Color(0xFF2A282D),
    onPrimary = Color(0xFF21005D),
    onSecondary = Color.White,
    onBackground = Color(0xFFE6E0E9),
    onSurface = Color(0xFFE6E0E9),
    surfaceVariant = Color(0xFF323035),
    outline = Color(0xFF49454F),
    error = Color(0xFFF2B8B5),
    errorContainer = Color(0xFF8C1D18)
  )

private val LightColorScheme =
  lightColorScheme(
    primary = BentoPrimary,
    secondary = BentoSecondary,
    tertiary = BentoTertiary,
    background = BentoBg,
    surface = BentoSurface,
    onPrimary = Color.White,
    onSecondary = BentoTertiary,
    onBackground = BentoTextDark,
    onSurface = BentoTextDark,
    surfaceVariant = BentoSurfaceVariant,
    outline = BentoOutline,
    error = BentoAlertIcon,
    errorContainer = BentoAlertBg,
    onErrorContainer = BentoAlertText
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // Disable dynamic color to enforce our beautiful Bento design theme
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }

      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
