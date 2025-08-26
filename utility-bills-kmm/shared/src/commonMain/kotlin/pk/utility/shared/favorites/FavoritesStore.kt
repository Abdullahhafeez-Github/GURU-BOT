package pk.utility.shared.favorites

import com.russhwolf.settings.Settings
import com.russhwolf.settings.set
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import pk.utility.shared.models.FavoriteEntry

class FavoritesStore(private val settings: Settings) {
    private val key = "favorites.json"
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = false }

    fun list(): List<FavoriteEntry> {
        val raw = settings.getStringOrNull(key) ?: return emptyList()
        return runCatching { json.decodeFromString<List<FavoriteEntry>>(raw) }.getOrElse { emptyList() }
    }

    fun saveAll(items: List<FavoriteEntry>) {
        settings[key] = json.encodeToString(items)
    }

    fun upsert(item: FavoriteEntry) {
        val current = list().toMutableList()
        val index = current.indexOfFirst { it.id == item.id }
        if (index >= 0) current[index] = item else current.add(item)
        saveAll(current)
    }

    fun delete(id: String) {
        saveAll(list().filterNot { it.id == id })
    }
}

