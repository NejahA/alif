#include <windows.h>
#include <windowsx.h>
#include <commctrl.h>
#include <shellapi.h>
#include <dwmapi.h>
#include <gdiplus.h>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <algorithm>
#include <cmath>
#include "AudioMaster.h"

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "comctl32.lib")
#pragma comment(lib, "dwmapi.lib")
#pragma comment(lib, "gdiplus.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "winmm.lib")

using namespace Gdiplus;

// Constants
#define WM_UPDATE_VOLUME (WM_USER + 100)
#define WM_UPDATE_PEAK (WM_USER + 101)
#define WM_DEVICE_CHANGE (WM_USER + 102)
#define WM_SESSION_CHANGE (WM_USER + 103)
#define IDT_UPDATE_TIMER 1
#define IDT_PEAK_TIMER 2
#define UPDATE_INTERVAL 100  // 100ms
#define PEAK_UPDATE_INTERVAL 50  // 50ms

// Global variables
HWND g_hWnd = NULL;
HINSTANCE g_hInstance = NULL;
AudioMaster* g_audioMaster = nullptr;
NOTIFYICONDATA g_notifyIcon = { 0 };
bool g_minimizedToTray = false;
bool g_alwaysOnTop = false;
bool g_showPeakMeters = true;
std::map<std::wstring, float> g_deviceVolumes;
std::map<std::wstring, AudioPeakData> g_peakLevels;
std::vector<AudioDeviceInfo> g_audioDevices;
std::vector<AudioSessionInfo> g_audioSessions;

// Colors
COLORREF g_bgColor = RGB(30, 30, 40);
COLORREF g_fgColor = RGB(240, 240, 245);
COLORREF g_accentColor = RGB(0, 120, 215);
COLORREF g_peakColor = RGB(0, 200, 100);
COLORREF g_warningColor = RGB(255, 140, 0);
COLORREF g_errorColor = RGB(220, 50, 50);

// Forward declarations
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam);
void InitializeUI();
void UpdateAudioInfo();
void DrawVolumeSlider(HDC hdc, int x, int y, int width, int height, float volume, bool muted);
void DrawPeakMeter(HDC hdc, int x, int y, int width, int height, const AudioPeakData& peak);
void DrawDevicePanel(HDC hdc, const RECT& rect, const AudioDeviceInfo& device);
void DrawSessionPanel(HDC hdc, const RECT& rect, const AudioSessionInfo& session);
void CreateTrayIcon();
void RemoveTrayIcon();
void ShowContextMenu();
void ApplyEqualizerPreset(const std::wstring& preset);
void SaveSettings();
void LoadSettings();
std::wstring FormatVolumeText(float volume);
std::wstring FormatDeviceName(const std::wstring& name);

// Entry point
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    g_hInstance = hInstance;

    // Initialize GDI+
    GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

    // Initialize common controls
    INITCOMMONCONTROLSEX icex = { sizeof(INITCOMMONCONTROLSEX) };
    icex.dwICC = ICC_WIN95_CLASSES | ICC_BAR_CLASSES | ICC_LISTVIEW_CLASSES;
    InitCommonControlsEx(&icex);

    // Initialize audio master
    g_audioMaster = new AudioMaster();
    if (!g_audioMaster->Initialize()) {
        MessageBox(NULL, L"Failed to initialize audio system", L"AudioMaster Error", MB_ICONERROR);
        return 1;
    }

    // Load settings
    LoadSettings();

    // Register window class
    WNDCLASSEX wcex = { sizeof(WNDCLASSEX) };
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = WndProc;
    wcex.cbClsExtra = 0;
    wcex.cbWndExtra = 0;
    wcex.hInstance = hInstance;
    wcex.hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(101));
    wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
    wcex.hbrBackground = CreateSolidBrush(g_bgColor);
    wcex.lpszMenuName = NULL;
    wcex.lpszClassName = L"AudioMasterClass";
    wcex.hIconSm = LoadIcon(hInstance, MAKEINTRESOURCE(101));

    if (!RegisterClassEx(&wcex)) {
        MessageBox(NULL, L"Window Registration Failed!", L"Error", MB_ICONERROR);
        return 1;
    }

    // Create window
    g_hWnd = CreateWindowEx(
        WS_EX_APPWINDOW | WS_EX_ACCEPTFILES,
        L"AudioMasterClass",
        L"AudioMaster - Windows Audio Control",
        WS_OVERLAPPEDWINDOW & ~WS_MAXIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
        NULL, NULL, hInstance, NULL
    );

    if (!g_hWnd) {
        MessageBox(NULL, L"Window Creation Failed!", L"Error", MB_ICONERROR);
        return 1;
    }

    // Initialize UI
    InitializeUI();

    // Create tray icon
    CreateTrayIcon();

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
    RemoveTrayIcon();
    SaveSettings();
    g_audioMaster->Shutdown();
    delete g_audioMaster;
    GdiplusShutdown(gdiplusToken);

    return (int)msg.wParam;
}
// Window procedure
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    static HBRUSH hBgBrush = CreateSolidBrush(g_bgColor);
    static HFONT hFont = NULL;
    static HPEN hBorderPen = NULL;
    static HPEN hAccentPen = NULL;
    static HPEN hMeterPen = NULL;
    static HBRUSH hMeterBrush = NULL;
    static HBRUSH hMeterPeakBrush = NULL;
    static HBRUSH hSliderBrush = NULL;
    static HBRUSH hThumbBrush = NULL;
    
    switch (message) {
        case WM_CREATE: {
            // Create GDI objects
            hFont = CreateFont(16, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
                             DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
                             DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, L"Segoe UI");
            hBorderPen = CreatePen(PS_SOLID, 1, RGB(60, 60, 70));
            hAccentPen = CreatePen(PS_SOLID, 2, g_accentColor);
            hMeterPen = CreatePen(PS_SOLID, 1, g_peakColor);
            hMeterBrush = CreateSolidBrush(RGB(0, 200, 100));
            hMeterPeakBrush = CreateSolidBrush(RGB(255, 100, 100));
            hSliderBrush = CreateSolidBrush(RGB(80, 80, 90));
            hThumbBrush = CreateSolidBrush(g_accentColor);
            
            // Start timers
            SetTimer(hWnd, IDT_UPDATE_TIMER, UPDATE_INTERVAL, NULL);
            SetTimer(hWnd, IDT_PEAK_TIMER, PEAK_UPDATE_INTERVAL, NULL);
            
            // Initial update
            UpdateAudioInfo();
            break;
        }
        
        case WM_PAINT: {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hWnd, &ps);
            
            RECT clientRect;
            GetClientRect(hWnd, &clientRect);
            
            // Fill background
            FillRect(hdc, &clientRect, hBgBrush);
            
            // Draw title
            RECT titleRect = {20, 20, clientRect.right - 20, 60};
            SetBkMode(hdc, TRANSPARENT);
            SetTextColor(hdc, RGB(240, 240, 245));
            SelectObject(hdc, hTitleFont);
            DrawText(hdc, L"AudioMaster", -1, &titleRect, DT_LEFT | DT_VCENTER);
            
            // Draw device panels
            int yPos = 80;
            for (const auto& device : g_audioDevices) {
                RECT deviceRect = {20, yPos, clientRect.right - 20, yPos + 100};
                DrawDevicePanel(hdc, deviceRect, device);
                yPos += 120;
            }
            
            // Draw session panels
            yPos += 20;
            for (const auto& session : g_audioSessions) {
                RECT sessionRect = {20, yPos, clientRect.right - 20, yPos + 60};
                DrawSessionPanel(hdc, sessionRect, session);
                yPos += 80;
            }
            
            EndPaint(hWnd, &ps);
            break;
        }
        
        case WM_SIZE: {
            InvalidateRect(hWnd, NULL, TRUE);
            break;
        }
        
        case WM_COMMAND: {
            int wmId = LOWORD(wParam);
            switch (wmId) {
                case ID_DEVICE_SETTINGS:
                    ShowDeviceSettings();
                    break;
                case ID_EQUALIZER:
                    ShowEqualizerDialog();
                    break;
                case ID_ROUTING:
                    ShowRoutingDialog();
                    break;
                case ID_PROFILES:
                    ShowProfilesDialog();
                    break;
                case ID_EXIT:
                    DestroyWindow(hWnd);
                    break;
            }
            break;
        }
        
        case WM_TIMER: {
            if (wParam == IDT_UPDATE_TIMER) {
                UpdateAudioInfo();
                InvalidateRect(hWnd, NULL, TRUE);
            } else if (wParam == IDT_PEAK_TIMER) {
                UpdatePeakMeters();
                InvalidateRect(hWnd, NULL, FALSE);
            }
            break;
        }
        
        case WM_DEVICECHANGE: {
            // Audio device changed, refresh
            UpdateAudioInfo();
            InvalidateRect(hWnd, NULL, TRUE);
            break;
        }
        
        case WM_DESTROY:
            KillTimer(hWnd, IDT_UPDATE_TIMER);
            KillTimer(hWnd, IDT_PEAK_TIMER);
            DeleteObject(hFont);
            DeleteObject(hBorderPen);
            DeleteObject(hAccentPen);
            DeleteObject(hMeterPen);
            DeleteObject(hMeterBrush);
            DeleteObject(hMeterPeakBrush);
            DeleteObject(hSliderBrush);
            DeleteObject(hThumbBrush);
            PostQuitMessage(0);
            break;
            
        default:
            return DefWindowProc(hWnd, message, wParam, lParam);
    }
    return 0;
}

// Initialize UI components
void InitializeUI() {
    // Create main window controls
    // Volume sliders, mute buttons, device selectors, etc.
}

// Update audio information
void UpdateAudioInfo() {
    if (!g_audioMaster) return;
    
    // Get updated device list
    g_audioDevices = g_audioMaster->GetAudioDevices(AudioDeviceType::All);
    
    // Get audio sessions
    g_audioSessions = g_audioMaster->GetAudioSessions();
    
    // Update peak levels
    for (auto& device : g_audioDevices) {
        g_peakLevels[device.id] = g_audioMaster->GetDevicePeakLevels(device.id);
    }
}

// Draw device panel
void DrawDevicePanel(HDC hdc, const RECT& rect, const AudioDeviceInfo& device) {
    // Draw device panel with volume control, mute button, peak meter
    // and device information
}

// Draw session panel
void DrawSessionPanel(HDC hdc, const RECT& rect, const AudioSessionInfo& session) {
    // Draw session panel with volume, mute, and process info
}

// Tray icon and notifications
void CreateTrayIcon() {
    // Create system tray icon
}

void ShowContextMenu() {
    // Show context menu for tray icon
}

// Settings
void LoadSettings() {
    // Load window position, volume levels, etc.
}

void SaveSettings() {
    // Save current settings
}

// Message handler for about box.
INT_PTR CALLBACK About(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam) {
    UNREFERENCED_PARAMETER(lParam);
    switch (message) {
        case WM_INITDIALOG:
            return (INT_PTR)TRUE;

        case WM_COMMAND:
            if (LOWORD(wParam) == IDOK || LOWORD(wParam) == IDCANCEL) {
                EndDialog(hDlg, LOWORD(wParam));
                return (INT_PTR)TRUE;
            }
            break;
    }
    return (INT_PTR)FALSE;
}