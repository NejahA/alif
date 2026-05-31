#pragma once

#include <string>
#include <functional>

class UIWindow {
public:
    UIWindow();
    ~UIWindow();

    // Create and show the window
    bool Create(const std::string& title, int width, int height);

    // Run the message loop
    int Run();

    // Close the window
    void Close();

    // Update window content
    void Update();

    // Set refresh interval in milliseconds
    void SetRefreshInterval(int interval);

    // Get window handle
    void* GetHandle() const;

    // Check if window is visible
    bool IsVisible() const;

    // Show/Hide window
    void Show();
    void Hide();

    // Window properties
    void SetTitle(const std::string& title);
    std::string GetTitle() const;

    void SetSize(int width, int height);
    void GetSize(int& width, int& height) const;

    void SetPosition(int x, int y);
    void GetPosition(int& x, int& y) const;

    // Callbacks
    using PaintCallback = std::function<void(void* hdc, int width, int height)>;
    using TimerCallback = std::function<void()>;
    using CloseCallback = std::function<bool()>;

    void SetPaintCallback(PaintCallback callback);
    void SetTimerCallback(TimerCallback callback);
    void SetCloseCallback(CloseCallback callback);

    // Drawing helpers
    void DrawText(const std::string& text, int x, int y, int color = 0x000000);
    void DrawRect(int x, int y, int width, int height, int color = 0x000000, bool filled = true);
    void DrawLine(int x1, int y1, int x2, int y2, int color = 0x000000, int thickness = 1);
    void DrawProgressBar(int x, int y, int width, int height, double percentage, int color = 0x00FF00);

private:
    class Impl;
    Impl* pImpl;
};