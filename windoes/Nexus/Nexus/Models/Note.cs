using System;

namespace Nexus.Models;

public class Note
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Link
{
    public int SourceId { get; set; }
    public int TargetId { get; set; }
}

public class GraphData
{
    public Note[] Nodes { get; set; } = Array.Empty<Note>();
    public Link[] Links { get; set; } = Array.Empty<Link>();
}
