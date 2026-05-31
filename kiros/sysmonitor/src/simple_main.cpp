#include <windows.h>
#include <windowsx.h>
#include <commctrl.h>
#include <psapi.h>
#include <pdh.h>
#include <pdhmsg.h>
#include <stdio.h>
#include <tchar.h>
#include <string>
#include <sstream>
#include <iomanip>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "comctl32.lib")
#pragma comment(lib, "psapi.lib")
#pragma comment(lib, "pdh.lib")

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
    wcex.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszMenuName = NULL;
    wcex.lpszClassName = _T("SysMonitorClass");
    wcex.hIconSm = LoadIcon(NULL, IDI_APPLICATION);

    if (!RegisterClassEx(&wcex)) {
        MessageBox(NULL, _T("Window Registration Failed!"), _T("Error"), MB_ICONERROR);
        return 1;
    }

    // Create window
    g_hWnd = CreateWindow(
        _T("SysMonitorClass"),
        _T("Windows System Monitor"),
        WS_OVERLAPPEDWINDOW & ~WS_MAXIMIZEBOX & ~WS_THICKFRAME,
        CW_USEDEFAULT, CW_USEDEFAULT, 500, 400,
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
    HFONT hTitleFont = CreateFont(20, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, _T("Arial"));
    
    HFONT hNormalFont = CreateFont(14, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, _T("Arial"));
    
    // Select title font
    HFONT hOldFont = (HFONT)SelectObject(hdc, hTitleFont);
    
    // Draw title
    SetTextColor(hdc, RGB(0, 0, 0));
    SetBkMode(hdc, TRANSPARENT);
    TextOut(hdc, 20, 20, _T("Windows System Monitor"), 21);
    
    // Draw CPU section
    SelectObject(hdc, hNormalFont);
    TextOut(hdc, 20, 60, _T("CPU Usage:"), 10);
    
    // Draw CPU progress bar
    DrawProgressBar(hdc, 120, 60, width - 170, 20, g_cpuUsage, RGB(0, 180, 0));
    
    // Draw CPU percentage
    std::wstring cpuText = std::to_wstring(static_cast<int>(g_cpuUsage)) + L"%";
    TextOut(hdc, width - 40, 60, cpuText.c_str(), cpuText.length());
    
    // Draw Memory section
    TextOut(hdc, 20, 100, _T("Memory Usage:"), 13);
    
    double memoryUsage = (g_memoryInfo.ullTotalPhys - g_memoryInfo.ullAvailPhys) * 100.0 / g_memoryInfo.ullTotalPhys;
    DrawProgressBar(hdc, 120, 100, width - 170, 20, memoryUsage, RGB(0, 120, 200));
    
    std::wstring memText = std::to_wstring(static_cast<int>(memoryUsage)) + L"%";
    TextOut(hdc, width - 40, 100, memText.c_str(), memText.length());
    
    // Memory details
    std::wstring memDetails = L"Total: " + FormatBytes(g_memoryInfo.ullTotalPhys) +
                              L" | Used: " + FormatBytes(g_memoryInfo.ullTotalPhys - g_memoryInfo.ullAvailPhys) +
                              L" | Free: " + FormatBytes(g_memoryInfo.ullAvailPhys);
    TextOut(hdc, 20, 125, memDetails.c_str(), memDetails.length());
    
    // Draw Disk section
    TextOut(hdc, 20, 160, _T("Disk Usage (C:):"), 15);
    
    if (g_diskTotal.QuadPart > 0) {
        double diskUsage = (g_diskTotal.QuadPart - g_diskFree.QuadPart) * 100.0 / g_diskTotal.QuadPart;
        DrawProgressBar(hdc, 120, 160, width - 170, 20, diskUsage, RGB(220, 120, 0));
        
        std::wstring diskText = std::to_wstring(static_cast<int>(diskUsage)) + L"%";
        TextOut(hdc, width - 40, 160, diskText.c_str(), diskText.length());
        
        // Disk details
        std::wstring diskDetails = L"Total: " + FormatBytes(g_diskTotal.QuadPart) +
                                   L" | Used: " + FormatBytes(g_diskTotal.QuadPart - g_diskFree.QuadPart) +
                                   L" | Free: " + FormatBytes(g_diskFree.QuadPart);
        TextOut(hdc, 20, 185, diskDetails.c_str(), diskDetails.length());
    }
    
    // System info
    TextOut(hdc, 20, 220, _T("System Information:"), 19);
    
    // Get system info
    SYSTEM_INFO sysInfo;
    GetSystemInfo(&sysInfo);
    
    std::wstring sysDetails = L"Processors: " + std::to_wstring(sysInfo.dwNumberOfProcessors) +
                              L" | Page Size: " + FormatBytes(sysInfo.dwPageSize);
    TextOut(hdc, 20, 245, sysDetails.c_str(), sysDetails.length());
    
    // Footer with update time
    TextOut(hdc, 20, height - 40, _T("Auto-refreshing every second"), 27);
    
    // Restore original font
    SelectObject(hdc, hOldFont);
    
    // Cleanup
    DeleteObject(hTitleFont);
    DeleteObject(hNormalFont);
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
    ss << std::fixed << std::setprecision(1) << dblBytes << L" " << suffixes[suffixIndex];
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
    GetDiskFreeSpaceEx(_T("C:\\"), &g_diskFree, &g_diskTotal, NULL);
}

// Draw a progress bar
void DrawProgressBar(HDC hdc, int x, int y, int width, int height, double percentage, COLORREF color) {
    // Draw background
    HBRUSH hBgBrush = CreateSolidBrush(RGB(240, 240, 240));
    RECT bgRect = { x, y, x + width, y + height };
    FillRect(hdc, &bgRect, hBgBrush);
    DeleteObject(hBgBrush);
    
    // Draw border
    HPEN hBorderPen = CreatePen(PS_SOLID, 1, RGB(180, 180, 180));
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