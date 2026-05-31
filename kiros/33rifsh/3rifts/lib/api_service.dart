import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/wiki_model.dart';

class ApiService {
  static const String actionApi = 'https://en.wikipedia.org/w/api.php';

  Future<List<WikiSummary>> fetchRandomArticles(int count) async {
    try {
      final randomRes = await http.get(Uri.parse(
          '$actionApi?action=query&list=random&rnlimit=$count&rnnamespace=0&format=json&origin=*'));
      
      if (randomRes.statusCode == 200) {
        final randomData = jsonDecode(randomRes.body);
        final List titles = randomData['query']['random'].map((r) => r['title']).toList();
        
        return await fetchDetailedSummaries(titles.cast<String>());
      } else {
        throw Exception('Failed to load random articles');
      }
    } catch (e) {
      debugPrint('Error fetching random articles: $e');
      return [];
    }
  }

  Future<List<WikiSummary>> fetchDetailedSummaries(List<String> titles) async {
    final titlesParam = Uri.encodeComponent(titles.join('|'));
    final url = '$actionApi?action=query&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&titles=$titlesParam&format=json&pithumbsize=500&origin=*';
    
    try {
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final Map<String, dynamic> pages = data['query']['pages'];
        
        return pages.values.map((p) => WikiSummary.fromJson(p)).toList();
      } else {
        throw Exception('Failed to load details');
      }
    } catch (e) {
      debugPrint('Error fetching detailed summaries: $e');
      return [];
    }
  }

  Future<List<WikiSummary>> searchWikipedia(String query) async {
    try {
      final res = await http.get(Uri.parse(
          '$actionApi?action=query&list=search&srsearch=${Uri.encodeComponent(query)}&format=json&origin=*'));
      
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final List results = data['query']['search'];
        final titles = results.take(6).map((r) => r['title'].toString()).toList();
        
        if (titles.isEmpty) return [];
        return await fetchDetailedSummaries(titles);
      } else {
        throw Exception('Search failed');
      }
    } catch (e) {
      debugPrint('Search error: $e');
      return [];
    }
  }

  Future<String?> fetchFullHtmlContent(String title) async {
    final url = '$actionApi?action=parse&page=${Uri.encodeComponent(title)}&format=json&prop=text&origin=*';
    try {
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['parse'] != null && data['parse']['text'] != null) {
          return data['parse']['text']['*'];
        }
      }
    } catch (e) {
      debugPrint('Error fetching full content HTML: $e');
    }
    return null;
  }
}
