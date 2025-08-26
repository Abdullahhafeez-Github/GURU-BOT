package pk.utility.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import pk.utility.shared.models.BillRequest
import pk.utility.shared.models.BillType
import pk.utility.shared.providers.defaultRegistry
import pk.utility.shared.repository.BillRepository

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
    if (showSplash) SplashScreen() else MainScreen()
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
    var company by remember { mutableStateOf("LESCO") }
    var result by remember { mutableStateOf("") }
    Scaffold(topBar = { TopAppBar(title = { Text("Utility Bills PK") }) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(value = ref, onValueChange = { ref = it }, label = { Text("Reference / Consumer ID") }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = { type = BillType.Electricity }) { Text("Electricity") }
                Button(onClick = { type = BillType.Gas }) { Text("Gas") }
            }
            OutlinedTextField(value = company, onValueChange = { company = it }, label = { Text("Company (e.g., LESCO)") }, modifier = Modifier.fillMaxWidth())
            Button(onClick = {
                result = "Loading..."
                // Launch a coroutine to fetch mock bill
                androidx.compose.runtime.LaunchedEffect(ref + company + type.name) {
                    val bill = repo.getBill(BillRequest(type, company, ref))
                    result = "${bill.customerName}\n${bill.amount}\n${bill.dueDate}\n${bill.billingMonth}"
                }
            }) { Text("Check Bill") }
            Text(result)
        }
    }
}

