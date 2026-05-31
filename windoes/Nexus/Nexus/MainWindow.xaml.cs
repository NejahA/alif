using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Nexus.Models;

namespace Nexus;

public partial class MainWindow : Window
{
    private ObservableCollection<Note> notes = new();
    private Note? currentNote;

    public MainWindow()
    {
        InitializeComponent();
        SyncFromMongoDB();
        LoadNotes();
        InitializeGraph();
        
        // Subscribe to auto-sync events
        App.Database.MongoService.DataChanged += async (sender, e) =>
        {
            await Dispatcher.InvokeAsync(async () =>
            {
                await App.Database.SyncFromMongoDBAsync();
                LoadNotes();
                if (GraphToggle.IsChecked == true && GraphWebView.CoreWebView2 != null)
                    UpdateGraph();
            });
        };
    }

    private async void SyncFromMongoDB()
    {
        try
        {
            await App.Database.SyncFromMongoDBAsync();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"MongoDB sync error: {ex.Message}", "Sync Warning", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private async void Sync_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            await App.Database.SyncFromMongoDBAsync();
            LoadNotes();
            if (GraphToggle.IsChecked == true && GraphWebView.CoreWebView2 != null)
                UpdateGraph();
            MessageBox.Show("Synced successfully from MongoDB!", "Sync Complete", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Sync failed: {ex.Message}", "Sync Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void LoadNotes()
    {
        notes.Clear();
        foreach (var note in App.Database.GetAllNotes())
            notes.Add(note);
        NotesList.ItemsSource = notes;
    }

    private async void InitializeGraph()
    {
        try
        {
            await GraphWebView.EnsureCoreWebView2Async();
            
            // Handle messages from JavaScript
            GraphWebView.CoreWebView2.WebMessageReceived += (sender, args) =>
            {
                try
                {
                    var json = args.TryGetWebMessageAsString();
                    var message = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(json);
                    
                    var action = message.GetProperty("action").GetString();
                    
                    if (action == "createLink")
                    {
                        var sourceId = message.GetProperty("sourceId").GetInt32();
                        var targetId = message.GetProperty("targetId").GetInt32();
                        App.Database.CreateLink(sourceId, targetId);
                    }
                    else if (action == "deleteLink")
                    {
                        var sourceId = message.GetProperty("sourceId").GetInt32();
                        var targetId = message.GetProperty("targetId").GetInt32();
                        App.Database.DeleteLink(sourceId, targetId);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error handling graph message: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            };
            
            var htmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, "Assets", "graph.html");
            if (System.IO.File.Exists(htmlPath))
            {
                var html = System.IO.File.ReadAllText(htmlPath);
                GraphWebView.CoreWebView2.NavigateToString(html);
            }
            else
            {
                MessageBox.Show($"Graph file not found at: {htmlPath}", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Graph initialization error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void NewNote_Click(object sender, RoutedEventArgs e)
    {
        currentNote = new Note { Title = "Untitled", Content = "", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
        App.Database.SaveNote(currentNote);
        notes.Insert(0, currentNote);
        NotesList.SelectedItem = currentNote;
    }

    private void NotesList_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (NotesList.SelectedItem is Note note)
        {
            currentNote = note;
            TitleBox.Text = note.Title;
            ContentBox.Text = note.Content;
        }
    }

    private void DeleteNote_Click(object sender, RoutedEventArgs e)
    {
        if (currentNote != null)
        {
            var result = MessageBox.Show($"Delete '{currentNote.Title}'?", "Confirm Delete", 
                MessageBoxButton.YesNo, MessageBoxImage.Question);
            
            if (result == MessageBoxResult.Yes)
            {
                App.Database.DeleteNote(currentNote.Id);
                notes.Remove(currentNote);
                currentNote = null;
                TitleBox.Text = "";
                ContentBox.Text = "";
                if (GraphToggle.IsChecked == true && GraphWebView.CoreWebView2 != null)
                    UpdateGraph();
            }
        }
        else
        {
            MessageBox.Show("Please select a note to delete.", "No Note Selected", 
                MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void Save_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            if (currentNote != null)
            {
                currentNote.Title = TitleBox.Text;
                currentNote.Content = ContentBox.Text;
                currentNote.UpdatedAt = DateTime.Now;
                App.Database.SaveNote(currentNote);
                NotesList.Items.Refresh();
                if (GraphToggle.IsChecked == true && GraphWebView.CoreWebView2 != null)
                    UpdateGraph();
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error saving note: {ex.Message}\n\nStack: {ex.StackTrace}", "Save Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void Search_Click(object sender, RoutedEventArgs e)
    {
        var searchWindow = new SearchWindow();
        if (searchWindow.ShowDialog() == true && !string.IsNullOrWhiteSpace(searchWindow.SearchQuery))
        {
            var results = App.Database.Search(searchWindow.SearchQuery);
            if (results.Count > 0)
            {
                notes.Clear();
                foreach (var note in results)
                    notes.Add(note);
            }
            else
            {
                MessageBox.Show("No results found.", "Search", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
        else if (searchWindow.ShowDialog() == false)
        {
            LoadNotes(); // Reload all notes if search is cancelled
        }
    }

    private async void ToggleGraph_Checked(object sender, RoutedEventArgs e)
    {
        GraphWebView.Visibility = Visibility.Visible;
        // Wait a bit for WebView2 to be ready
        await System.Threading.Tasks.Task.Delay(500);
        UpdateGraph();
    }

    private void ToggleGraph_Unchecked(object sender, RoutedEventArgs e)
    {
        GraphWebView.Visibility = Visibility.Collapsed;
    }

    private void UpdateGraph()
    {
        try
        {
            if (GraphWebView.CoreWebView2 != null)
            {
                var graphData = App.Database.GetGraphData();
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNamingPolicy = null,
                    WriteIndented = false
                };
                var json = System.Text.Json.JsonSerializer.Serialize(graphData, options);
                GraphWebView.CoreWebView2.PostWebMessageAsString(json);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Graph update error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }
}
