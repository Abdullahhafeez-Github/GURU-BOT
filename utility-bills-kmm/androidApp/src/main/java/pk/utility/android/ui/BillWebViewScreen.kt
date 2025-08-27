package pk.utility.android.ui

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class BillData(
    val customerName: String,
    val amount: String,
    val dueDate: String,
    val billingMonth: String
)

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun BillWebViewScreen(
    reference: String,
    onParsed: (BillData) -> Unit,
    modifier: Modifier = Modifier
) {
    val ctx = LocalContext.current
    var progress by remember { mutableStateOf("Solving CAPTCHA / Loading...") }
    val url = "https://www.gepco.com.pk/GEPCOBill.aspx?RefNo=$reference"
    Column(modifier.fillMaxSize()) {
        Text(progress, modifier = Modifier.padding(8.dp))
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    CookieManager.getInstance().setAcceptCookie(true)
                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            progress = "Loading..."
                        }
                        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                            return false
                        }
                        override fun onPageFinished(view: WebView?, url: String?) {
                            progress = "Parsing bill..."
                            evaluateJavascript(
                                "(function(){return document.documentElement.outerHTML;})()"
                            ) { html ->
                                // html comes quoted; strip quotes and unescape basic entities
                                val page = html.trim('"').replace("\\n", "\n").replace("\\u003C","<")
                                val data = parseGepcoHtml(page)
                                if (data != null) {
                                    onParsed(data)
                                    progress = "" // handled by parent
                                } else {
                                    progress = "Solve Captcha if shown, then wait..."
                                }
                            }
                        }
                    }
                    loadUrl(url)
                }
            }
        )
    }
}

private fun parseValueAfter(label: String, html: String): String? {
    val regex = Regex("$label.*?<td[^>]*>\\s*([^<]+)", RegexOption.IGNORE_CASE)
    return regex.find(html)?.groups?.get(1)?.value?.trim()
}

fun parseGepcoHtml(html: String): BillData? {
    val name = parseValueAfter("Customer\\s*Name", html)
        ?: parseValueAfter("Name\\s*</td>", html)
    val amount = parseValueAfter("Total\\s*Payable", html)
        ?: parseValueAfter("Payable", html)
    val due = parseValueAfter("Due\\s*Date", html)
    val month = parseValueAfter("Bill(?:ing)?\\s*Month", html)
    return if (name != null && amount != null && due != null && month != null) {
        BillData(name, amount, due, month)
    } else null
}

