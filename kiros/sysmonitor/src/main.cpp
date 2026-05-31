#include <windows.h>
#include <windowsx.h>
#include <commctrl.h>
#include <psapi.h>
#include <pdh.h>
#include <pdhmsg.h>
#include <iphlpapi.h>
#include <stdio.h>
#include <tchar.h>
#include <string>
#include <vector>
#include <chrono>
#include <thread>
#include <iomanip>
#include <sstream>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "comctl32.lib")
#pragma comment(lib, "psapi.lib")
#pragma comment(lib, "pdh.lib")
#pragma comment(lib, "iphlpapi.lib")

// Constants
#define IDT_REFRESH_TIMER 1
#define REFRESH_INTERVAL 1000  // 1 second

// Global variables
HWND g_hWnd = NULL;
HINSTANCE g_hInstance = NULL;

// System information
double g_cpuUsage = 0.0;
MEMORYSTATUSEX g_memoryInfo = { sizeof(MEMORYSTATUSEX) };
ULARGE_INTEGER g_diskFree = { 0 };
ULARGE_INTEGER g_diskTotal = { 0 };
ULARGE_INTEGER g_diskTotalFree = { 0 };
ULARGE_INTEGER g_diskTotalSize = { 0 };

// PDH query for CPU usage
PDH_HQUERY g_cpuQuery = NULL;
PDH_HCOUNTER g_cpuTotal = NULL;

// Forward declarations
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam);
void InitializeSystemMonitoring();
void UpdateSystemInfo();
void DrawSystemInfo(HDC hdc, int width, int height);
std::wstring FormatBytes(ULONGLONG bytes);
double GetCPUUsage();
void GetMemoryInfo();
void GetDiskInfo();
void DrawProgressBar(HDC hdc, int x, int y, int width, int height, double percentage, COLORREF color);

// Entry point
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    g_hInstance = hInstance;

    // Initialize common controls
    INITCOMMONCONTROLSEX icex = { sizeof(INITCOMMONCONTROLSEX) };
    icex.dwICC = ICC_WIN95_CLASSES;
    InitCommonControlsEx(&icex);

    // Register window class
    WNDCLASSEX wcex = { sizeof(WNDCLASSEX) };
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = WndProc;
    wcex.cbClsExtra = 0;
    wcex.cbWndExtra = 0;
    wcex.hInstance = hInstance;
    wcex.hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(101));
    wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszMenuName = NULL;
    wcex.lpszClassName = _T("SysMonitorClass");
    wcex.hIconSm = LoadIcon(hInstance, MAKEINTRESOURCE(101));

    if (!RegisterClassEx(&wcex)) {
        MessageBox(NULL, _T("Window Registration Failed!"), _T("Error"), MB_ICONERROR);
        return 1;
    }

    // Create window
    g_hWnd = CreateWindow(
        _T("SysMonitorClass"),
        _T("SysMonitor - System Information"),
        WS_OVERLAPPEDWINDOW & ~WS_MAXIMIZEBOX & ~WS_THICKFRAME,
        CW_USEDEFAULT, CW_USEDEFAULT, 600, 500,
        NULL, NULL, hInstance, NULL
    );

    if (!g_hWnd) {
        MessageBox(NULL, _T("Window Creation Failed!"), _T("Error"), MB_ICONERROR);
        return 1;
    }

    // Initialize system monitoring
    InitializeSystemMonitoring();

    // Show window
    ShowWindow(g_hWnd, nCmdShow);
    UpdateWindow(g_hWnd);

    // Main message loop
    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    // Cleanup
    if (g_cpuQuery) {
        PdhCloseQuery(g_cpuQuery);
    }

    return (int)msg.wParam;
}

// Window procedure
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_CREATE:
        // Create refresh timer
        SetTimer(hWnd, IDT_REFRESH_TIMER, REFRESH_INTERVAL, NULL);
        break;

    case WM_TIMER:
        if (wParam == IDT_REFRESH_TIMER) {
            UpdateSystemInfo();
            InvalidateRect(hWnd, NULL, TRUE);
        }
        break;

    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hWnd, &ps);
        
        RECT clientRect;
        GetClientRect(hWnd, &clientRect);
        DrawSystemInfo(hdc, clientRect.right, clientRect.bottom);
        
        EndPaint(hWnd, &ps);
        break;
    }

    case WM_SIZE:
        InvalidateRect(hWnd, NULL, TRUE);
        break;

    case WM_DESTROY:
        KillTimer(hWnd, IDT_REFRESH_TIMER);
        PostQuitMessage(0);
        break;

    default:
        return DefWindowProc(hWnd, message, wParam, lParam);
    }
    return 0;
}

// Initialize system monitoring
void InitializeSystemMonitoring() {
    // Initialize PDH for CPU monitoring
    PdhOpenQuery(NULL, NULL, &g_cpuQuery);
    PdhAddEnglishCounter(g_cpuQuery, L"\\Processor(_Total)\\% Processor Time", NULL, &g_cpuTotal);
    PdhCollectQueryData(g_cpuQuery);
}

// Update system information
void UpdateSystemInfo() {
    // Get CPU usage
    g_cpuUsage = GetCPUUsage();
    
    // Get memory info
    GetMemoryInfo();
    
    // Get disk info
    GetDiskInfo();
}

// Draw system information
void DrawSystemInfo(HDC hdc, int width, int height) {
    // Set up fonts
    HFONT hTitleFont = CreateFont(24, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, _T("Arial"));
    
    HFONT hNormalFont = CreateFont(16, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, _T("Arial"));
    
    HFONT hSmallFont = CreateFont(12, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, _T("Arial"));
    
    // Select fonts
    HFONT hOldFont = (HFONT)SelectObject(hdc, hTitleFont);
    
    // Draw title
    SetTextColor(hdc, RGB(0, 0, 0));
    SetBkMode(hdc, TRANSPARENT);
    TextOut(hdc, 20, 20, _T("System Monitor"), 13);
    
    // Draw CPU section
    SelectObject(hdc, hNormalFont);
    TextOut(hdc, 20, 60, _T("CPU Usage:"), 10);
    
    // Draw CPU progress bar
    DrawProgressBar(hdc, 150, 60, width - 200, 25, g_cpuUsage, RGB(0, 150, 0));
    
    // Draw CPU percentage
    std::wstring cpuText = std::to_wstring(static_cast<int>(g_cpuUsage)) + L"%";
    TextOut(hdc, width - 40, 60, cpuText.c_str(), cpuText.length());
    
    // Draw Memory section
    TextOut(hdc, 20, 100, _T("Memory Usage:"), 13);
    
    double memoryUsage = (g_memoryInfo.ullTotalPhys - g_memoryInfo.ullAvailPhys) * 100.0 / g_memoryInfo.ullTotalPhys;
    DrawProgressBar(hdc, 150, 100, width - 200, 25, memoryUsage, RGB(0, 100, 200));
    
    std::wstring memText = std::to_wstring(static_cast<int>(memoryUsage)) + L"%";
    TextOut(hdc, width - 40, 100, memText.c_str(), memText.length());
    
    // Draw detailed info with small font
    SelectObject(hdc, hSmallFont);
    
    // Memory details
    std::wstring memDetails = L"Total: " + FormatBytes(g_memoryInfo.ullTotalPhys) +
                              L" | Used: " + FormatBytes(g_memoryInfo.ullTotalPhys - g_memoryInfo.ullAvailPhys) +
                              L" | Free: " + FormatBytes(g_memoryInfo.ullAvailPhys);
    TextOut(hdc, 20, 130, memDetails.c_str(), memDetails.length());
    
    // Disk section
    SelectObject(hdc, hNormalFont);
    TextOut(hdc, 20, 160, _T("Disk Usage (C:):"), 15);
    
    if (g_diskTotal.QuadPart > 0) {
        double diskUsage = (g_diskTotal.QuadPart - g_diskFree.QuadPart) * 100.0 / g_diskTotal.QuadPart;
        DrawProgressBar(hdc, 150, 160, width - 200, 25, diskUsage, RGB(200, 100, 0));
        
        std::wstring diskText = std::to_wstring(static_cast<int>(diskUsage)) + L"%";
        TextOut(hdc, width - 40, 160, diskText.c_str(), diskText.length());
        
        // Disk details
        SelectObject(hdc, hSmallFont);
        std::wstring diskDetails = L"Total: " + FormatBytes(g_diskTotal.QuadPart) +
                                   L" | Used: " + FormatBytes(g_diskTotal.QuadPart - g_diskFree.QuadPart) +
                                   L" | Free: " + FormatBytes(g_diskFree.QuadPart);
        TextOut(hdc, 20, 190, diskDetails.c_str(), diskDetails.length());
    }
    
    // System info
    SelectObject(hdc, hNormalFont);
    TextOut(hdc, 20, 220, _T("System Information:"), 19);
    
    SelectObject(hdc, hSmallFont);
    
    // Get system info
    SYSTEM_INFO sysInfo;
    GetSystemInfo(&sysInfo);
    
    std::wstring sysDetails = L"Processors: " + std::to_wstring(sysInfo.dwNumberOfProcessors) +
                              L" | Architecture: " + (sysInfo.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64 ? L"x64" :
                                                      sysInfo.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_INTEL ? L"x86" : L"Unknown");
    TextOut(hdc, 20, 250, sysDetails.c_str(), sysDetails.length());
    
    // OS version
    OSVERSIONINFOEX osvi = { sizeof(OSVERSIONINFOEX) };
    GetVersionEx((OSVERSIONINFO*)&osvi);
    
    std::wstring osDetails = L"Windows Version: " + std::to_wstring(osvi.dwMajorVersion) + L"." +
                             std::to_wstring(osvi.dwMinorVersion) + L" (Build " +
                             std::to_wstring(osvi.dwBuildNumber) + L")";
    TextOut(hdc, 20, 270, osDetails.c_str(), osDetails.length());
    
    // Footer
    TextOut(hdc, 20, height - 40, _T("Updated: "), 9);
    
    // Get current time
    SYSTEMTIME st;
    GetLocalTime(&st);
    std::wstring timeText = std::to_wstring(st.wHour) + L":" +
                           std::to_wstring(st.wMinute) + L":" +
                           std::to_wstring(st.wSecond);
    TextOut(hdc, 100, height - 40, timeText.c_str(), timeText.length());
    
    // Restore original font
    SelectObject(hdc, hOldFont);
    
    // Cleanup
    DeleteObject(hTitleFont);
    DeleteObject(hNormalFont);
    DeleteObject(hSmallFont);
}

// Format bytes to human readable string
std::wstring FormatBytes(ULONGLONG bytes) {
    const wchar_t* suffixes[] = { L"B", L"KB", L"MB", L"GB", L"TB" };
    int suffixIndex = 0;
    double dblBytes = static_cast<double>(bytes);
    
    while (dblBytes >= 1024.0 && suffixIndex < 4) {
        dblBytes /= 1024.0;
        suffixIndex++;
    }
    
    std::wstringstream ss;
    ss << std::fixed << std::setprecision(2) << dblBytes << L" " << suffixes[suffixIndex];
    return ss.str();
}

// Get CPU usage using PDH
double GetCPUUsage() {
    PDH_FMT_COUNTERVALUE counterVal;
    
    PdhCollectQueryData(g_cpuQuery);
    PdhGetFormattedCounterValue(g_cpuTotal, PDH_FMT_DOUBLE, NULL, &counterVal);
    
    return counterVal.doubleValue;
}

// Get memory information
void GetMemoryInfo() {
    GlobalMemoryStatusEx(&g_memoryInfo);
}

// Get disk information
void GetDiskInfo() {
    GetDiskFreeSpaceEx(_T("C:\\"), &g_diskFree, &g_diskTotal, &g_diskTotalFree);
}

// Draw a progress bar
void DrawProgressBar(HDC hdc, int x, int y, int width, int height, double percentage, COLORREF color) {
    // Draw background
    HBRUSH hBgBrush = CreateSolidBrush(RGB(220, 220, 220));
    RECT bgRect = { x, y, x + width, y + height };
    FillRect(hdc, &bgRect, hBgBrush);
    DeleteObject(hBgBrush);
    
    // Draw border
    HPEN hBorderPen = CreatePen(PS_SOLID, 1, RGB(150, 150, 150));
    HPEN hOldPen = (HPEN)SelectObject(hdc, hBorderPen);
    Rectangle(hdc, x, y, x + width, y + height);
    SelectObject(hdc, hOldPen);
    DeleteObject(hBorderPen);
    
    // Draw progress
    int progressWidth = static_cast<int>((percentage / 100.0) * (width - 2));
    if (progressWidth > 0) {
        HBRUSH hProgressBrush = CreateSolidBrush(color);
        RECT progressRect = { x + 1, y + 1, x + 1 + progressWidth, y + height - 1 };
        FillRect(hdc, &progressRect, hProgressBrush);
        DeleteObject(hProgressBrush);
    }
}