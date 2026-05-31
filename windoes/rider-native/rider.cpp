#include <windows.h>
#include <windowsx.h>
const wchar_t CLASS_NAME[] = L"RiderWindow";
const wchar_t WINDOW_TITLE[] = L"Rider - Live Streams";
LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WNDCLASS wc = {};
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    wc.style = CS_HREDRAW | CS_VREDRAW;
    RegisterClass(&wc);
    HWND hwnd = CreateWindowEx(
        0,
        CLASS_NAME,
        WINDOW_TITLE,
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
        NULL, NULL, hInstance, NULL
    );
    if (hwnd == NULL) {
        return 0;
    }
    ShowWindow(hwnd, nCmdShow);
    UpdateWindow(hwnd);
    MSG msg = {};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    return (int)msg.wParam;
}
LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    static HWND hListView;
    static HWND hGoLiveBtn;
    static HWND hSearchBox;
    switch (msg) {
        case WM_CREATE: {
            hListView = CreateWindowEx(
                WS_EX_CLIENTEDGE,
                WC_LISTVIEW,
                L"",
                WS_CHILD | WS_VISIBLE | LVS_REPORT | LVS_SHOWSEL_ALWAYS,
                10, 50, 760, 400,
                hwnd, (HMENU)1001, GetModuleHandle(NULL), NULL
            );
            ListView_SetExtendedListViewStyle(hListView, LVS_EX_FULLROWSELECT);
            LVCOLUMN col = {0};
            col.mask = LVCF_TEXT | LVCF_WIDTH;
            col.cx = 200;
            col.pszText = L"Title";
            ListView_InsertColumn(hListView, 0, &col);
            col.cx = 120;
            col.pszText = L"Streamer";
            ListView_InsertColumn(hListView, 1, &col);
            col.cx = 80;
            col.pszText = L"Viewers";
            ListView_InsertColumn(hListView, 2, &col);
            col.cx = 150;
            col.pszText = L"Category";
            ListView_InsertColumn(hListView, 3, &col);
            col.cx = 60;
            col.pszText = L"Live";
            ListView_InsertColumn(hListView, 4, &col);
            const wchar_t* titles[] = {L"Morning Coffee Chat", L"Gaming Marathon", L"Music Session", L"Tech Talk", L"Art Stream"};
            const wchar_t* streamers[] = {L"CoffeeLover", L"ProGamer", L"Musician123", L"TechGuru", L"ArtistLife"};
            int viewers[] = {1250, 8900, 3400, 5600, 2100};
            const wchar_t* categories[] = {L"IRL", L"Just Chatting", L"Music", L"Science & Technology", L"Art"};
            bool isLive[] = {true, true, true, true, true};
            for (int i = 0; i < 5; i++) {
                LVITEM item = {0};
                item.mask = LVIF_TEXT;
                item.iItem = i;
                item.pszText = (LPWSTR)titles[i];
                ListView_InsertItem(hListView, &item);
                ListView_SetItemText(hListView, i, 1, (LPWSTR)streamers[i]);
                wchar_t viewersStr[20];
                swprintf(viewersStr, 20, L"%d", viewers[i]);
                ListView_SetItemText(hListView, i, 2, viewersStr);
                ListView_SetItemText(hListView, i, 3, (LPWSTR)categories[i]);
                ListView_SetItemText(hListView, i, 4, isLive[i] ? L"YES" : L"NO");
            }
            hSearchBox = CreateWindowEx(
                0,
                WC_EDIT,
                L"",
                WS_CHILD | WS_VISIBLE | WS_BORDER,
                10, 10, 200, 25,
                hwnd, (HMENU)1002, GetModuleHandle(NULL), NULL
            );
            hGoLiveBtn = CreateWindowEx(
                0,
                L"BUTTON",
                L"Go Live",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                650, 10, 100, 30,
                hwnd, (HMENU)1003, GetModuleHandle(NULL), NULL
            );
            SendMessage(hSearchBox, WM_SETFONT, (WPARAM)GetStockObject(DEFAULT_GUI_FONT), MAKELPARAM(TRUE, 0));
            break;
        }
        case WM_COMMAND:
            if (LOWORD(wParam) == 1003) {
                MessageBox(hwnd, L"Starting live stream...", L"Rider", MB_OK | MB_ICONINFORMATION);
            }
            break;
        case WM_DESTROY:
            PostQuitMessage(0);
            break;
        default:
            return DefWindowProc(hwnd, msg, wParam, lParam);
    }
    return 0;
}
