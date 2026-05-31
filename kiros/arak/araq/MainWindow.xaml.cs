using System;
using System.IO;
using System.Windows;
using Microsoft.Win32;
using Microsoft.Web.WebView2.Core;

namespace araq;

public partial class MainWindow : Window
{
    private bool _webViewReady = false;
    private string? _pendingPdfPath = null;

    public MainWindow()
    {
        InitializeComponent();
        InitializeWebView();
        CheckCommandLineArgs();
    }

    private async void InitializeWebView()
    {
        try 
        {
            await webView.EnsureCoreWebView2Async(null);
            _webViewReady = true;

            // If a PDF was requested before WebView2 was ready, load it now
            if (_pendingPdfPath != null)
            {
                LoadPdfInternal(_pendingPdfPath);
                _pendingPdfPath = null;
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"WebView2 initialization failed: {ex.Message}");
        }
    }

    private void CheckCommandLineArgs()
    {
        string[] args = Environment.GetCommandLineArgs();
        if (args.Length > 1 && File.Exists(args[1]) && args[1].EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            LoadPdf(args[1]);
        }
    }

    private void LoadPdf(string path)
    {
        if (!File.Exists(path)) return;

        if (_webViewReady)
        {
            LoadPdfInternal(path);
        }
        else
        {
            // WebView2 not ready yet — queue the load
            _pendingPdfPath = path;
        }
    }

    private void LoadPdfInternal(string path)
    {
        webView.Source = new Uri(path);
        DropOverlay.Visibility = Visibility.Collapsed;
        webView.Visibility = Visibility.Visible;
    }

    /// Show the drop overlay again so the user can pick a new file
    private void ShowOpenOverlay()
    {
        DropOverlay.Visibility = Visibility.Visible;
        webView.Visibility = Visibility.Hidden;
    }

    private void TitleBar_MouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        if (e.LeftButton == System.Windows.Input.MouseButtonState.Pressed)
        {
            DragMove();
        }
    }

    private void Minimize_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState.Minimized;
    }

    private void Maximize_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
    }

    private void Close_Click(object sender, RoutedEventArgs e)
    {
        Application.Current.Shutdown();
    }

    private void OpenFile_Click(object sender, RoutedEventArgs e)
    {
        OpenFileDialog openFileDialog = new OpenFileDialog();
        openFileDialog.Filter = "PDF files (*.pdf)|*.pdf";
        if (openFileDialog.ShowDialog() == true)
        {
            LoadPdf(openFileDialog.FileName);
        }
    }

    /// Title bar "Open" button — lets user pick a new PDF at any time
    private void OpenNew_Click(object sender, RoutedEventArgs e)
    {
        OpenFileDialog openFileDialog = new OpenFileDialog();
        openFileDialog.Filter = "PDF files (*.pdf)|*.pdf";
        if (openFileDialog.ShowDialog() == true)
        {
            LoadPdf(openFileDialog.FileName);
        }
    }

    private void DropOverlay_Drop(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
            if (files.Length > 0 && Path.GetExtension(files[0]).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                LoadPdf(files[0]);
            }
        }
    }
}