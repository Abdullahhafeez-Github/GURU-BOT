package pk.utility.shared.platform

import com.russhwolf.settings.Settings

expect object SettingsFactory {
    fun create(): Settings
}

