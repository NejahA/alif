class WikiSummary {
  final String title;
  final String displayTitle;
  final String? thumbnailSource;
  final String? extract;
  final String? contentUrl;
  final int pageId;

  WikiSummary({
    required this.title,
    required this.displayTitle,
    this.thumbnailSource,
    this.extract,
    this.contentUrl,
    required this.pageId,
  });

  factory WikiSummary.fromJson(Map<String, dynamic> json) {
    return WikiSummary(
      title: json['title'] ?? '',
      displayTitle: json['title'] ?? '', // MediaWiki 'title' is usually the display title
      thumbnailSource: json['thumbnail'] != null ? json['thumbnail']['source'] : null,
      extract: json['extract'],
      contentUrl: json['fullurl'],
      pageId: json['pageid'] ?? 0,
    );
  }
}

class WikiSearchResult {
  final String title;
  final String snippet;
  final int pageId;

  WikiSearchResult({
    required this.title,
    required this.snippet,
    required this.pageId,
  });

  factory WikiSearchResult.fromJson(Map<String, dynamic> json) {
    return WikiSearchResult(
      title: json['title'] ?? '',
      snippet: json['snippet'] ?? '',
      pageId: json['pageid'] ?? 0,
    );
  }
}
