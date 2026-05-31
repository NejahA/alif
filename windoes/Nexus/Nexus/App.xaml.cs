using System;
using System.Windows;
using Nexus.Services;
using System.Threading;

namespace Nexus;

public partial class App : Application
{
    private static Mutex? _mutex;
    public static DatabaseService Database { get; private set; } = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        // Prevent multiple instances
        const string mutexName = "NexusAppMutex_SingleInstance";
        _mutex = new Mutex(true, mutexName, out bool createdNew);

        if (!createdNew)
        {
            MessageBox.Show("Nexus is already running!", "Already Running", MessageBoxButton.OK, MessageBoxImage.Information);
            Shutdown();
            return;
        }

        base.OnStartup(e);
        Database = new DatabaseService();
        var mainWindow = new MainWindow();
        mainWindow.Show();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _mutex?.ReleaseMutex();
        _mutex?.Dispose();
        base.OnExit(e);
    }
}
