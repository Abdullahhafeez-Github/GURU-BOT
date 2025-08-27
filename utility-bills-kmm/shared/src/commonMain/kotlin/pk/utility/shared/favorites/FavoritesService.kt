package pk.utility.shared.favorites

import com.russhwolf.settings.Settings
import pk.utility.shared.models.FavoriteEntry
import pk.utility.shared.platform.SettingsFactory
import kotlin.random.Random

class FavoritesService(
    private val store: FavoritesStore = FavoritesStore(SettingsFactory.create())
) {
    fun list(): List<FavoriteEntry> = store.list()

    fun add(displayName: String, billType: String, companyCode: String, reference: String): FavoriteEntry {
        val id = Random.nextLong().toString()
        val entry = FavoriteEntry(id, displayName, enumValueOf(billType), companyCode, reference)
        store.upsert(entry)
        return entry
    }

    fun update(entry: FavoriteEntry) = store.upsert(entry)
    fun remove(id: String) = store.delete(id)
}

