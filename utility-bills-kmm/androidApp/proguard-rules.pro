-keep class pk.utility.** { *; }
-keep class kotlinx.** { *; }
-keep class io.ktor.** { *; }

# Suppress desktop/IDE-only classes referenced by libraries in release
-dontwarn java.lang.management.**
-dontwarn org.slf4j.**
-dontwarn ch.qos.logback.**
-dontwarn io.ktor.util.debug.**
