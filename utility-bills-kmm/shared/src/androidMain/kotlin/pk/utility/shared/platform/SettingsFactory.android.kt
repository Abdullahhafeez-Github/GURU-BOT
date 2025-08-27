package pk.utility.shared.platform

import android.content.Context
import com.russhwolf.settings.Settings
import com.russhwolf.settings.SharedPreferencesSettings

lateinit var appContext: Context

actual object SettingsFactory {
    actual fun create(): Settings {
        val prefs = appContext.getSharedPreferences("utility_bills_prefs", Context.MODE_PRIVATE)
        return SharedPreferencesSettings(prefs)
    }
}

