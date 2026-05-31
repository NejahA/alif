import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state.dart';
import 'widgets/question_card.dart';
import 'widgets/category_selector.dart';
import 'widgets/progress_indicator_widget.dart';
import 'services/database_service.dart';

void main() {
  // Initialize sqflite for desktop platforms
  DatabaseService.initializeSqflite();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState()..initialize(),
      child: MaterialApp(
        title: 'conVeys',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: const MyHomePage(),
      ),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('conVeys'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Consumer<AppState>(
          builder: (context, appState, child) {
            if (appState.isLoading) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (appState.error != null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    appState.error!,
                    style: const TextStyle(color: Colors.red, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }

            final progress = appState.getProgress();

            return Column(
              children: [
                CategorySelector(
                  activeCategory: appState.activeCategory,
                  onSelectCategory: (category) {
                    appState.switchCategory(category);
                  },
                ),
                Expanded(
                  child: GestureDetector(
                    onHorizontalDragEnd: (details) {
                      if (details.primaryVelocity! > 0) {
                        // Swiped right - go backward
                        appState.previousQuestion();
                      } else if (details.primaryVelocity! < 0) {
                        // Swiped left - go forward
                        appState.nextQuestion();
                      }
                    },
                    child: Center(
                      child: QuestionCard(
                        question: appState.currentQuestion,
                        categoryName: appState.activeCategory.displayName,
                      ),
                    ),
                  ),
                ),
                ProgressIndicatorWidget(
                  current: progress['current']!,
                  total: progress['total']!,
                  hasMoreQuestions: appState.hasMoreQuestions(),
                  onResetDeck: () {
                    appState.resetDeck();
                  },
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          appState.previousQuestion();
                        },
                        child: const Icon(Icons.arrow_back),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          appState.nextQuestion();
                        },
                        child: const Icon(Icons.arrow_forward),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
