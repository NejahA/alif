import 'package:flutter/material.dart';

void main() {
  runApp(const AphelionApp());
}

class AphelionApp extends StatefulWidget {
  const AphelionApp({super.key});

  @override
  State<AphelionApp> createState() => _AphelionAppState();
}

class _AphelionAppState extends State<AphelionApp> {
  String _selectedCurrency = '\$';
  String _selectedLanguage = 'English 🇬🇧';
  Color _primaryAccent = const Color(0xFF10B981); // Emerald
  String _themeStyle = 'Cosmic Dark';
  bool _isPinLocked = false;
  bool _isAppUnlocked = true;
  bool _spareChangeRoundUp = true;

  void _updateCurrency(String symbol) => setState(() => _selectedCurrency = symbol);
  void _updateLanguage(String lang) => setState(() => _selectedLanguage = lang);
  void _updateAccentColor(Color color) => setState(() => _primaryAccent = color);
  void _updateThemeStyle(String style) => setState(() => _themeStyle = style);
  void _toggleRoundUp(bool val) => setState(() => _spareChangeRoundUp = val);

  void _togglePinLock(bool value) {
    setState(() {
      _isPinLocked = value;
      _isAppUnlocked = !_isPinLocked;
    });
  }

  void _unlockApp() => setState(() => _isAppUnlocked = true);

  Color get _scaffoldBg {
    if (_themeStyle == 'Pitch Black AMOLED') return Colors.black;
    if (_themeStyle == 'Cyberpunk Glass') return const Color(0xFF0F172A);
    return const Color(0xFF0D0F18);
  }

  Color get _cardBg {
    if (_themeStyle == 'Pitch Black AMOLED') return const Color(0xFF121212);
    if (_themeStyle == 'Cyberpunk Glass') return const Color(0xFF1E293B);
    return const Color(0xFF161A29);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aphelion',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: _scaffoldBg,
        primaryColor: _primaryAccent,
        colorScheme: ColorScheme.dark(
          primary: _primaryAccent,
          secondary: const Color(0xFF8B5CF6),
          surface: _cardBg,
        ),
        cardColor: _cardBg,
        useMaterial3: true,
      ),
      home: _isPinLocked && !_isAppUnlocked
          ? PinLockScreen(onUnlock: _unlockApp, primaryColor: _primaryAccent)
          : MainNavigationScreen(
              currencySymbol: _selectedCurrency,
              onCurrencyChanged: _updateCurrency,
              selectedLanguage: _selectedLanguage,
              onLanguageChanged: _updateLanguage,
              primaryAccent: _primaryAccent,
              onAccentChanged: _updateAccentColor,
              themeStyle: _themeStyle,
              onThemeStyleChanged: _updateThemeStyle,
              spareChangeRoundUp: _spareChangeRoundUp,
              onRoundUpToggled: _toggleRoundUp,
              isPinLocked: _isPinLocked,
              onPinLockToggled: _togglePinLock,
            ),
    );
  }
}

class PinLockScreen extends StatefulWidget {
  final VoidCallback onUnlock;
  final Color primaryColor;

  const PinLockScreen({super.key, required this.onUnlock, required this.primaryColor});

  @override
  State<PinLockScreen> createState() => _PinLockScreenState();
}

class _PinLockScreenState extends State<PinLockScreen> {
  String _pin = '';

  void _onKeyPress(String val) {
    if (_pin.length < 4) {
      setState(() => _pin += val);
      if (_pin.length == 4) {
        if (_pin == '1234') {
          widget.onUnlock();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Incorrect PIN (Default: 1234)')),
          );
          setState(() => _pin = '');
        }
      }
    }
  }

  void _onBackspace() {
    if (_pin.isNotEmpty) {
      setState(() => _pin = _pin.substring(0, _pin.length - 1));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock, size: 64, color: widget.primaryColor),
            const SizedBox(height: 16),
            const Text('Aphelion Vault Locked', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Enter 4-Digit Security PIN (Default: 1234)', style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (i) {
                final isFilled = i < _pin.length;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 10),
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled ? widget.primaryColor : Colors.grey.shade800,
                    border: Border.all(color: widget.primaryColor),
                  ),
                );
              }),
            ),
            const SizedBox(height: 48),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 48),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 1.3,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: 12,
              itemBuilder: (ctx, i) {
                if (i == 9) return const SizedBox();
                if (i == 10) return _buildKey('0');
                if (i == 11) {
                  return IconButton(onPressed: _onBackspace, icon: const Icon(Icons.backspace));
                }
                return _buildKey('${i + 1}');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKey(String label) {
    return InkWell(
      onTap: () => _onKeyPress(label),
      borderRadius: BorderRadius.circular(30),
      child: Container(
        decoration: BoxDecoration(color: Theme.of(context).cardColor, shape: BoxShape.circle),
        child: Center(
          child: Text(label, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

class CryptoAsset {
  final String symbol;
  final String name;
  final double price;
  final double changePercent;
  final IconData icon;

  CryptoAsset({
    required this.symbol,
    required this.name,
    required this.price,
    required this.changePercent,
    required this.icon,
  });
}

class Transaction {
  final String id;
  final String title;
  final double amount;
  final DateTime date;
  final String category;
  final bool isIncome;
  final IconData icon;

  Transaction({
    required this.id,
    required this.title,
    required this.amount,
    required this.date,
    required this.category,
    required this.isIncome,
    required this.icon,
  });
}

class MainNavigationScreen extends StatefulWidget {
  final String currencySymbol;
  final ValueChanged<String> onCurrencyChanged;
  final String selectedLanguage;
  final ValueChanged<String> onLanguageChanged;
  final Color primaryAccent;
  final ValueChanged<Color> onAccentChanged;
  final String themeStyle;
  final ValueChanged<String> onThemeStyleChanged;
  final bool spareChangeRoundUp;
  final ValueChanged<bool> onRoundUpToggled;
  final bool isPinLocked;
  final ValueChanged<bool> onPinLockToggled;

  const MainNavigationScreen({
    super.key,
    required this.currencySymbol,
    required this.onCurrencyChanged,
    required this.selectedLanguage,
    required this.onLanguageChanged,
    required this.primaryAccent,
    required this.onAccentChanged,
    required this.themeStyle,
    required this.onThemeStyleChanged,
    required this.spareChangeRoundUp,
    required this.onRoundUpToggled,
    required this.isPinLocked,
    required this.onPinLockToggled,
  });

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  int _challengeWeek = 14;

  final List<CryptoAsset> _cryptoList = [
    CryptoAsset(symbol: 'BTC', name: 'Bitcoin', price: 64250.0, changePercent: 4.8, icon: Icons.currency_bitcoin),
    CryptoAsset(symbol: 'ETH', name: 'Ethereum', price: 3420.0, changePercent: 2.1, icon: Icons.token),
    CryptoAsset(symbol: 'XAU', name: 'Gold Bullion', price: 2380.0, changePercent: 0.6, icon: Icons.workspace_premium),
  ];

  final List<Transaction> _transactions = [
    Transaction(
      id: 't1',
      title: 'Monthly Salary',
      amount: 4500.00,
      date: DateTime.now().subtract(const Duration(days: 1)),
      category: 'Income',
      isIncome: true,
      icon: Icons.account_balance_wallet,
    ),
    Transaction(
      id: 't2',
      title: 'Supermarket Groceries',
      amount: 142.50,
      date: DateTime.now().subtract(const Duration(days: 2)),
      category: 'Food',
      isIncome: false,
      icon: Icons.shopping_bag,
    ),
  ];

  void _addTransaction(Transaction tx) {
    setState(() {
      _transactions.insert(0, tx);
    });
  }

  void _depositChallengeWeek() {
    if (_challengeWeek <= 52) {
      final depositVal = _challengeWeek.toDouble();
      setState(() {
        _transactions.insert(
          0,
          Transaction(
            id: DateTime.now().toString(),
            title: 'Week $_challengeWeek Savings Challenge',
            amount: depositVal,
            date: DateTime.now(),
            category: 'Challenge',
            isIncome: false,
            icon: Icons.emoji_events,
          ),
        );
        _challengeWeek++;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Deposited ${widget.currencySymbol}${depositVal.toStringAsFixed(0)} for Week ${_challengeWeek - 1}!')),
      );
    }
  }

  void _showStatementModal(BuildContext context) {
    final income = _totalIncome;
    final expense = _totalExpenses;
    final netSavings = income - expense;
    final savingsRate = income > 0 ? (netSavings / income * 100).clamp(0.0, 100.0) : 0.0;

    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Monthly Ledger Statement', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                IconButton(onPressed: () => Navigator.of(ctx).pop(), icon: const Icon(Icons.close, color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: widget.primaryAccent.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Net Monthly Savings', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(
                        '${widget.currencySymbol}${netSavings.toStringAsFixed(2)}',
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: widget.primaryAccent),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Savings Rate', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(
                        '${savingsRate.toStringAsFixed(1)}%',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: widget.primaryAccent),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: widget.primaryAccent),
                onPressed: () {
                  Navigator.of(ctx).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Statement PDF downloaded to device storage!')),
                  );
                },
                icon: const Icon(Icons.picture_as_pdf, color: Colors.white),
                label: const Text('Export Statement PDF', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showWireTransferModal(BuildContext context) {
    final contacts = ['Sarah Connor', 'John Doe', 'Emma Watson', 'Michael Scott'];
    String selectedContact = contacts[0];
    final amountController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setWireState) {
          return Padding(
            padding: EdgeInsets.only(
              top: 24,
              left: 24,
              right: 24,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Instant Wire Transfer', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    IconButton(onPressed: () => Navigator.of(ctx).pop(), icon: const Icon(Icons.close, color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Select Recipient', style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: contacts.map((contact) {
                    final isSelected = selectedContact == contact;
                    return ChoiceChip(
                      label: Text(contact),
                      selected: isSelected,
                      selectedColor: widget.primaryAccent,
                      onSelected: (selected) {
                        if (selected) setWireState(() => selectedContact = contact);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: amountController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(
                    labelText: 'Transfer Amount (${widget.currencySymbol})',
                    filled: true,
                    fillColor: Theme.of(context).scaffoldBackgroundColor,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: widget.primaryAccent),
                    onPressed: () {
                      final amount = double.tryParse(amountController.text) ?? 0.0;
                      if (amount > 0) {
                        _addTransaction(Transaction(
                          id: DateTime.now().toString(),
                          title: 'Wire Transfer to $selectedContact',
                          amount: amount,
                          date: DateTime.now(),
                          category: 'Transfer',
                          isIncome: false,
                          icon: Icons.send,
                        ));
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Transferred ${widget.currencySymbol}${amount.toStringAsFixed(2)} to $selectedContact!')),
                        );
                      }
                    },
                    child: const Text('Send Instant Wire', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showAddTransactionModal(BuildContext context) {
    final titleController = TextEditingController();
    final amountController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          top: 24,
          left: 24,
          right: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('New Transaction', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: titleController,
              decoration: InputDecoration(
                labelText: 'Title',
                filled: true,
                fillColor: Theme.of(context).scaffoldBackgroundColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                labelText: 'Amount (${widget.currencySymbol})',
                filled: true,
                fillColor: Theme.of(context).scaffoldBackgroundColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.primaryAccent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  final title = titleController.text.trim();
                  final amount = double.tryParse(amountController.text) ?? 0.0;
                  if (title.isNotEmpty && amount > 0) {
                    _addTransaction(Transaction(
                      id: DateTime.now().toString(),
                      title: title,
                      amount: amount,
                      date: DateTime.now(),
                      category: 'General',
                      isIncome: false,
                      icon: Icons.receipt_long,
                    ));
                    Navigator.of(ctx).pop();
                  }
                },
                child: const Text('Save Transaction', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  double get _totalBalance {
    double total = 0;
    for (var tx in _transactions) {
      if (tx.isIncome) {
        total += tx.amount;
      } else {
        total -= tx.amount;
      }
    }
    return total;
  }

  double get _totalIncome => _transactions.where((tx) => tx.isIncome).fold(0.0, (sum, tx) => sum + tx.amount);
  double get _totalExpenses => _transactions.where((tx) => !tx.isIncome).fold(0.0, (sum, tx) => sum + tx.amount);

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildDashboardTab(),
      _buildHealthTab(),
      _buildChallengeTab(),
      _buildTradeTab(),
      _buildSettingsTab(),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      floatingActionButton: FloatingActionButton(
        backgroundColor: widget.primaryAccent,
        onPressed: () => _showAddTransactionModal(context),
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: Theme.of(context).cardColor,
        indicatorColor: widget.primaryAccent.withValues(alpha: 0.2),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          const NavigationDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: 'Health'),
          const NavigationDestination(icon: Icon(Icons.military_tech_outlined), selectedIcon: Icon(Icons.military_tech), label: 'Challenge'),
          const NavigationDestination(icon: Icon(Icons.pie_chart_outline), selectedIcon: Icon(Icons.pie_chart), label: 'Portfolio'),
          const NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildDashboardTab() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: widget.primaryAccent.withValues(alpha: 0.2),
                      child: Icon(Icons.auto_awesome, color: widget.primaryAccent),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Aphelion Vault', style: TextStyle(color: Colors.grey, fontSize: 13)),
                        Text('Alex Morgan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: () => _showStatementModal(context),
                      icon: Icon(Icons.description_outlined, color: widget.primaryAccent),
                    ),
                    const SizedBox(width: 4),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: widget.primaryAccent),
                      onPressed: () => _showWireTransferModal(context),
                      icon: const Icon(Icons.send, size: 16, color: Colors.white),
                      label: const Text('Wire', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Net Worth Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [const Color(0xFF8B5CF6), widget.primaryAccent],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Net Worth', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 6),
                  Text(
                    '${widget.currencySymbol}${_totalBalance.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Transactions History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _transactions.length,
              separatorBuilder: (ctx, i) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final tx = _transactions[i];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(16)),
                  child: Row(
                    children: [
                      Icon(tx.icon, color: widget.primaryAccent),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(tx.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      ),
                      Text(
                        '${tx.isIncome ? '+' : '-'}${widget.currencySymbol}${tx.amount.toStringAsFixed(2)}',
                        style: TextStyle(fontWeight: FontWeight.bold, color: tx.isIncome ? widget.primaryAccent : const Color(0xFFEF4444)),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthTab() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Financial Health Score Radar', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(24)),
              child: Column(
                children: [
                  Text('780', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: widget.primaryAccent)),
                  const Text('EXCELLENT CREDIT SCORE', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      Text('Utilization: 14%', style: TextStyle(color: Colors.grey)),
                      Text('Debt-to-Income: 18%', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChallengeTab() {
    final totalTarget = 1378.0;
    double savedSoFar = 0.0;
    for (int w = 1; w < _challengeWeek; w++) {
      savedSoFar += w;
    }
    final progress = (savedSoFar / totalTarget).clamp(0.0, 1.0);

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('52-Week Savings Challenge', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(24)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Week $_challengeWeek of 52', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: widget.primaryAccent),
                        onPressed: _depositChallengeWeek,
                        child: const Text('Deposit Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Saved: ${widget.currencySymbol}${savedSoFar.toStringAsFixed(0)}', style: TextStyle(color: widget.primaryAccent, fontWeight: FontWeight.bold)),
                      Text('Target: ${widget.currencySymbol}${totalTarget.toStringAsFixed(0)}', style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 10,
                      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                      valueColor: AlwaysStoppedAnimation<Color>(widget.primaryAccent),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTradeTab() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Portfolio Weight Distribution', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(20)),
              child: Column(
                children: [
                  _buildAssetMeter('Cash Vault Savings', 0.50, widget.primaryAccent),
                  const SizedBox(height: 12),
                  _buildAssetMeter('Bitcoin (BTC)', 0.25, const Color(0xFFF59E0B)),
                  const SizedBox(height: 12),
                  _buildAssetMeter('Ethereum (ETH)', 0.15, const Color(0xFF8B5CF6)),
                  const SizedBox(height: 12),
                  _buildAssetMeter('Gold Bullion (XAU)', 0.10, const Color(0xFF3B82F6)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssetMeter(String name, double ratio, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(name, style: const TextStyle(color: Colors.white70, fontSize: 13)),
            Text('${(ratio * 100).toInt()}%', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: ratio,
            minHeight: 8,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsTab() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Preferences & Settings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
