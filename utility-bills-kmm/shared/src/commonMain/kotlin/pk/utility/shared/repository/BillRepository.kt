package pk.utility.shared.repository

import pk.utility.shared.models.BillRequest
import pk.utility.shared.models.BillSummary
import pk.utility.shared.providers.ProviderRegistry

class BillRepository(
    private val registry: ProviderRegistry
) {
    suspend fun getBill(request: BillRequest): BillSummary {
        val provider = registry.resolve(request.companyCode)
            ?: error("No provider for company: ${request.companyCode}")
        return provider.fetchBill(request)
    }
}

