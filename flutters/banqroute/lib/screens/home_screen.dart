import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/currency_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _fromCurrency = 'TND';
  String _toCurrency = 'EUR';
  double _amount = 1.0;
  final _amountController = TextEditingController(text: '1.0');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<CurrencyProvider>(context, listen: false).loadRates();
    });
  }

  double? get _convertedAmount {
    final provider = Provider.of<CurrencyProvider>(context);
    if (provider.rates.isEmpty) return null;

    final fromRate = _fromCurrency == 'TND' ? 1.0 : 1.0 / (provider.rates[_fromCurrency] ?? 1.0);
    final toRate = provider.rates[_toCurrency] ?? 1.0;
    return _amount * fromRate * toRate;
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CurrencyProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('TND Currency Converter')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Amount'),
                    onChanged: (value) {
                      _amount = double.tryParse(value) ?? 1.0;
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButton<String>(
                          value: _fromCurrency,
                          isExpanded: true,
                          items: _buildCurrencyItems(provider.rates),
                          onChanged: (val) {
                            if (val != null) setState(() => _fromCurrency = val);
                          },
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.swap_horiz),
                        onPressed: () {
                          setState(() {
                            final temp = _fromCurrency;
                            _fromCurrency = _toCurrency;
                            _toCurrency = temp;
                          });
                        },
                      ),
                      Expanded(
                        child: DropdownButton<String>(
                          value: _toCurrency,
                          isExpanded: true,
                          items: _buildCurrencyItems(provider.rates),
                          onChanged: (val) {
                            if (val != null) setState(() => _toCurrency = val);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  Text(
                    _convertedAmount == null
                        ? 'No rates available'
                        : NumberFormat.currency(
                            symbol: _getSymbol(_toCurrency),
                            decimalDigits: 2,
                          ).format(_convertedAmount!),
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Last updated: ${provider.lastUpdateStr}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
                  ),
                  if (provider.rates.isNotEmpty && provider.lastUpdateStr != 'Never')
                    TextButton(
                      onPressed: () => provider.loadRates(),
                      child: const Text('Refresh Rates'),
                    ),
                ],
              ),
            ),
    );
  }

  List<DropdownMenuItem<String>> _buildCurrencyItems(Map<String, dynamic> rates) {
    final currencies = ['TND', ...rates.keys.where((k) => k != 'TND')];
    return currencies.map((code) => DropdownMenuItem(
          value: code,
          child: Text('$code ${_getSymbol(code)}'),
        )).toList();
  }

  String _getSymbol(String code) {
    switch (code) {
      case 'USD': return '\$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'TND': return 'د.ت';
      default: return code;
    }
  }
}