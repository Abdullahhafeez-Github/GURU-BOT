package pk.utility.shared.models

import kotlinx.serialization.Serializable

@Serializable
enum class BillType { Electricity, Gas }

@Serializable
data class BillRequest(
    val billType: BillType,
    val companyCode: String,
    val referenceNumber: String
)

@Serializable
data class BillSummary(
    val customerName: String,
    val amount: String,
    val dueDate: String,
    val billingMonth: String,
    val billImageUrl: String? = null
)

@Serializable
data class FavoriteEntry(
    val id: String,
    val displayName: String,
    val billType: BillType,
    val companyCode: String,
    val referenceNumber: String
)

