package pk.utility.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import pk.utility.shared.models.BillRequest
import pk.utility.shared.models.BillType
import pk.utility.shared.providers.defaultRegistry
import pk.utility.shared.repository.BillRepository
import pk.utility.shared.favorites.FavoritesService
import pk.utility.shared.models.FavoriteEntry
import pk.utility.shared.platform.appContext
import android.app.Application
import android.content.Context
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        pk.utility.shared.platform.appContext = applicationContext
        setContent {
            App()
        }
    }
}

@Composable
fun App() {
    var showSplash by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        delay(2000)
        showSplash = false
    }
    if (showSplash) SplashScreen() else MainTabs()
}

@Composable
fun SplashScreen() {
    val alpha by animateFloatAsState(targetValue = 1f, label = "fade")
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // Placeholder logo - replace with actual resource later
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Utility Bills PK",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(12.dp))
            Text(
                text = "Developed by Abdullah Hafeez",
                modifier = Modifier.alpha(alpha),
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun MainScreen() {
    val registry = remember { defaultRegistry() }
    val repo = remember { BillRepository(registry) }
    var ref by remember { mutableStateOf("") }
    var type by remember { mutableStateOf(BillType.Electricity) }
    var company by remember { mutableStateOf("GEPCO") }
    var result by remember { mutableStateOf("") }
    val favorites = remember { FavoritesService() }
    var showSaved by remember { mutableStateOf(false) }
    var lastBillLines by remember { mutableStateOf<List<String>>(emptyList()) }
    val scope = rememberCoroutineScope()
    val ctx = LocalContext.current
    Scaffold(topBar = { TopAppBar(title = { Text("Utility Bills PK") }) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(value = ref, onValueChange = { ref = it }, label = { Text("Reference / Consumer ID") }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = { type = BillType.Electricity }) { Text("Electricity") }
                Button(onClick = { type = BillType.Gas }) { Text("Gas") }
            }
            OutlinedTextField(value = company, onValueChange = { company = it }, label = { Text("Company (e.g., LESCO)") }, modifier = Modifier.fillMaxWidth())
            Button(onClick = {
                scope.launch {
                    result = "Loading..."
                    try {
                        val bill = repo.getBill(BillRequest(type, company, ref))
                        result = "${bill.customerName}\n${bill.amount}\n${bill.dueDate}\n${bill.billingMonth}"
                        lastBillLines = listOf(
                            "Customer: ${bill.customerName}",
                            "Amount: ${bill.amount}",
                            "Due: ${bill.dueDate}",
                            "Month: ${bill.billingMonth}",
                            "Company: $company",
                            "Type: ${type.name}",
                            "Ref: $ref"
                        )
                    } catch (t: Throwable) {
                        result = "Failed to fetch. Open GEPCO site below."
                    }
                }
            }) { Text("Check Bill") }
            Button(onClick = {
                val url = "https://www.gepco.com.pk/GEPCOBill.aspx?RefNo=" + ref
                ctx.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)))
            }) { Text("Open GEPCO Page") }
            Text(result)
            Button(onClick = {
                favorites.add("Saved ${type.name}", type.name, company, ref)
                showSaved = true
            }) { Text("Add to Favorites") }
            if (showSaved) Text("Saved! Open Favorites tab to view.")
            if (lastBillLines.isNotEmpty()) {
                Button(onClick = {
                    PdfExporter.exportSimpleBillPdf(
                        context = ctx,
                        title = "Utility Bill",
                        lines = lastBillLines,
                        fileName = "bill-${company}-${ref.takeLast(6)}.pdf"
                    )
                }) { Text("Download PDF") }
            }
        }
    }
}

@Composable
fun FavoritesScreen() {
    val favorites = remember { FavoritesService() }
    var items by remember { mutableStateOf(favorites.list()) }
    Scaffold(topBar = { TopAppBar(title = { Text("Favorites") }) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items.forEach { fav ->
                Text("${fav.displayName} • ${fav.companyCode} • ${fav.referenceNumber}")
            }
        }
    }
}

@Composable
fun MainTabs() {
    var tab by remember { mutableStateOf(0) }
    Column(Modifier.fillMaxSize()) {
        TabRow(selectedTabIndex = tab) {
            Tab(selected = tab == 0, onClick = { tab = 0 }) { Text("Home", modifier = Modifier.padding(16.dp)) }
            Tab(selected = tab == 1, onClick = { tab = 1 }) { Text("Favorites", modifier = Modifier.padding(16.dp)) }
        }
        when (tab) {
            0 -> MainScreen()
            1 -> FavoritesScreen()
        }
    }
}

