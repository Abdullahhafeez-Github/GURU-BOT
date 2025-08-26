package pk.utility.shared.providers

import pk.utility.shared.models.BillRequest
import pk.utility.shared.models.BillSummary

interface BillProvider {
    val companyCode: String
    val displayName: String
    suspend fun fetchBill(request: BillRequest): BillSummary
}

class ProviderRegistry(
    private val providers: List<BillProvider>
) {
    fun resolve(companyCode: String): BillProvider? = providers.firstOrNull { it.companyCode == companyCode }
    fun all(): List<BillProvider> = providers
}

