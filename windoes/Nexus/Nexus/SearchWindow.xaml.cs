using System.Windows;
using System.Windows.Input;

namespace Nexus;

public partial class SearchWindow : Window
{
    public string SearchQuery { get; private set; } = string.Empty;

    public SearchWindow()
    {
        InitializeComponent();
        SearchBox.Focus();
    }

    private void Search_Click(object sender, RoutedEventArgs e)
    {
        SearchQuery = SearchBox.Text.Trim();
        DialogResult = true;
        Close();
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private void SearchBox_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            Search_Click(sender, e);
        }
    }
}
