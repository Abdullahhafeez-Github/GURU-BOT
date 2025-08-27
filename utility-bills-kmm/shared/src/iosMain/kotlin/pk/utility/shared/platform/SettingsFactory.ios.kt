package pk.utility.shared.platform

import com.russhwolf.settings.AppleSettings
import com.russhwolf.settings.Settings
import platform.Foundation.NSUserDefaults

actual object SettingsFactory {
    actual fun create(): Settings = AppleSettings(NSUserDefaults.standardUserDefaults())
}

