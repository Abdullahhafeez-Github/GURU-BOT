package pk.utility.shared.providers

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.URLBuilder
import io.ktor.http.encodeURLParameter
import pk.utility.shared.models.BillRequest
import pk.utility.shared.models.BillSummary

class GepcoProvider(
    private val client: HttpClient = HttpClient()
) : BillProvider {
    override val companyCode: String = "GEPCO"
    override val displayName: String = "GEPCO (Gujranwala)"

    override suspend fun fetchBill(request: BillRequest): BillSummary {
        val ref = request.referenceNumber.trim()
        val url = "https://www.gepco.com.pk/GEPCOBill.aspx?RefNo=" + ref.encodeURLParameter()
        val html: String = client.get(url).body()

        fun extract(pattern: Regex): String? = pattern.find(html)?.groups?.get(1)?.value?.trim()

        // Best-effort regexes based on common DISCO bill markup; will be adjusted if DOM changes
        val name = extract(Regex("Customer\\s*Name.*?<td[^>]*>\\s*([^<]+)\\s*</td>", RegexOption.IGNORE_CASE))
            ?: extract(Regex("Name\\s*</td>\\s*<td[^>]*>\\s*([^<]+)", RegexOption.IGNORE_CASE))
            ?: "Unknown"
        val amount = extract(Regex("Payable[^<]*?:?\\s*</td>\\s*<td[^>]*>\\s*([^<]+)", RegexOption.IGNORE_CASE))
            ?: extract(Regex("Total\\s*Payable.*?<td[^>]*>\\s*([^<]+)", RegexOption.IGNORE_CASE))
            ?: "—"
        val due = extract(Regex("Due\\s*Date.*?<td[^>]*>\\s*([^<]+)", RegexOption.IGNORE_CASE)) ?: "—"
        val month = extract(Regex("Bill(?:ing)?\\s*Month.*?<td[^>]*>\\s*([^<]+)", RegexOption.IGNORE_CASE)) ?: "—"

        return BillSummary(
            customerName = name,
            amount = amount,
            dueDate = due,
            billingMonth = month,
            billImageUrl = null
        )
    }
}

