package pk.utility.shared.providers

import kotlinx.coroutines.delay
import pk.utility.shared.models.BillRequest
import pk.utility.shared.models.BillSummary

class MockLescoProvider : BillProvider {
    override val companyCode: String = "LESCO"
    override val displayName: String = "LESCO (Mock)"
    override suspend fun fetchBill(request: BillRequest): BillSummary {
        delay(600) // simulate network
        return BillSummary(
            customerName = "Sample Customer",
            amount = "PKR 5,230",
            dueDate = "25-Sep-2025",
            billingMonth = "Sep-2025",
            billImageUrl = null
        )
    }
}

fun defaultRegistry(): ProviderRegistry = ProviderRegistry(
    providers = listOf(
        GepcoProvider(),
        MockLescoProvider()
    )
)

