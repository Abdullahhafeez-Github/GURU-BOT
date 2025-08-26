plugins {
    kotlin("multiplatform")
    id("com.android.library")
    id("org.jetbrains.kotlin.plugin.serialization")
}

kotlin {
    androidTarget()
    iosArm64()
    iosX64()
    iosSimulatorArm64()

    sourceSets {
        val ktorVersion = "2.3.12"
        val coroutines = "1.8.1"
        val serialization = "1.6.3"
        val settingsVersion = "1.1.1"

        commonMain.dependencies {
            implementation(kotlin("stdlib"))
            implementation("io.ktor:ktor-client-core:$ktorVersion")
            implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
            implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutines")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$serialization")
            implementation("com.russhwolf:multiplatform-settings:$settingsVersion")
        }
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-android:$ktorVersion")
        }
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:$ktorVersion")
        }
    }
}

android {
    namespace = "pk.utility.shared"
    compileSdk = 34
    defaultConfig {
        minSdk = 24
    }
}

