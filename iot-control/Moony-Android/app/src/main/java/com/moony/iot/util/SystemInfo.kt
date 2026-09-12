import android.os.Build

object SystemInfo {
    val osName: String = "Android"
    val osVersion: String = Build.VERSION.RELEASE
    val deviceManufacturer: String = Build.MANUFACTURER
    val deviceModel: String = Build.MODEL
    val sdkInt: Int = Build.VERSION.SDK_INT

    override fun toString(): String {
        return "$osName $osVersion ($deviceManufacturer $deviceModel, API $sdkInt)"
    }
}
