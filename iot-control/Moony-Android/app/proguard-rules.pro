# This is a configuration file for ProGuard.
# http://proguard.sourceforge.net/index.html#manual/usage.html

-keep class org.java_websocket.** { *; }
-keep class com.google.gson.** { *; }
-keep class com.moony.iot.** { *; }

-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

-dontwarn java.beans.**
-dontwarn sun.misc.**
-dontwarn com.sun.**
