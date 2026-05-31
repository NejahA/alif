'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, Brain, TrendingUp, Zap, X, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'query' | 'analysis' | 'prediction' | 'suggestion';
}

interface Prediction {
  id: string;
  politician: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

export default function VirtuoAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Virtuo, your political intelligence assistant. I can help you analyze political trends, predict election outcomes, and provide insights on campaigns.',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'analysis'
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      politician: 'Alexandra Chen',
      prediction: 'Re-election likely',
      confidence: 85,
      timeframe: 'Next 6 months',
      reasoning: 'Strong approval ratings and successful policy initiatives'
    },
    {
      id: '2',
      politician: 'Marcus Johnson',
      prediction: 'Investigation outcome pending',
      confidence: 60,
      timeframe: 'Next 3 months',
      reasoning: 'Ethics committee review in progress'
    },
    {
      id: '3',
      politician: '2024 Presidential Election',
      prediction: 'Competitive race',
      confidence: 75,
      timeframe: 'Next 12 months',
      reasoning: 'Current polling shows close margins'
    },
  ]);
  const [activeTab, setActiveTab] = useState<'chat' | 'predictions' | 'insights'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'query'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on current data, I can see that approval ratings are trending upward for progressive candidates.",
        "The campaign analytics show strong public support for environmental initiatives.",
        "My analysis suggests a shift in voter sentiment towards moderate policies.",
        "Looking at the historical data, election outcomes in similar scenarios have favored incumbents.",
        "The sentiment analysis indicates positive reception to recent policy announcements.",
        "Based on polling data and social media sentiment, I predict increased support for this campaign.",
        "The data shows correlation between economic indicators and political approval ratings.",
        "My algorithms detect emerging patterns in voter behavior across different demographics."
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant',
        timestamp: new Date(),
        type: 'analysis'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      // In a real app, this would integrate with Web Speech API
      setTimeout(() => {
        setIsListening(false);
        setInput("Analyze the current political trends");
        handleSend();
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const quickQuestions = [
    "Analyze election trends",
    "Predict campaign outcomes",
    "Compare politician approval",
    "Show sentiment analysis",
    "Generate political report",
    "Identify key issues",
    "Forecast election results",
    "Analyze demographic trends"
  ];

  const generateInsight = () => {
    const insights = [
      {
        title: "Progressive Momentum",
        description: "Analysis shows 15% increase in support for progressive policies among young voters",
        icon: TrendingUp,
        color: "bg-purple-100 text-purple-800"
      },
      {
        title: "Campaign Efficiency",
        description: "Grassroots campaigns show 40% higher engagement than traditional methods",
        icon: Zap,
        color: "bg-green-100 text-green-800"
      },
      {
        title: "Sentiment Shift",
        description: "Positive sentiment increased by 22% following policy announcements",
        icon: Brain,
        color: "bg-blue-100 text-blue-800"
      },
      {
        title: "Prediction Accuracy",
        description: "AI predictions show 89% accuracy for election outcomes",
        icon: Sparkles,
        color: "bg-yellow-100 text-yellow-800"
      },
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  };

  const [currentInsight] = useState(generateInsight());

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m Virtuo, your political intelligence assistant. I can help you analyze political trends, predict election outcomes, and provide insights on campaigns.',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'analysis'
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Virtuo Assistant</h2>
            <p className="text-gray-600">AI-powered political intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-medium ${activeTab === 'predictions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Predictions</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 font-medium ${activeTab === 'insights' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Insights</span>
          </div>
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          {/* Quick Questions */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Questions</h3>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(question);
                    handleSend();
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-100 ml-2' : 'bg-gray-100 mr-2'}`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className={`px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                      {message.text}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.type && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-gray-600">
                          {message.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="text-left">
                <div className="inline-flex items-start">
                  <div className="p-2 rounded-lg bg-gray-100 mr-2">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-lg ${isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Virtuo about political trends, predictions, or analysis..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 resize-none"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-lg ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">AI Predictions</h3>
            </div>
            <p className="text-sm text-gray-600">
              Machine learning models analyze historical data, current trends, and sentiment to generate political predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{prediction.politician}</h4>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-16 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          prediction.confidence >= 80 ? 'bg-green-500' :
                          prediction.confidence >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold ${
                      prediction.confidence >= 80 ? 'text-green-600' :
                      prediction.confidence >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {prediction.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-2">{prediction.prediction}</p>
                <p className="text-sm text-gray-600 mb-3">{prediction.reasoning}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Timeframe: {prediction.timeframe}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">AI Prediction</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Prediction Methodology</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Analyzes historical election data and voting patterns</li>
              <li>• Processes real-time polling and sentiment analysis</li>
              <li>• Considers economic indicators and demographic trends</li>
              <li>• Uses ensemble machine learning models</li>
              <li>• Updates predictions based on new data inputs</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Current Insight */}
          <div className="p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${currentInsight.color.split(' ')[0]}`}>
                  <currentInsight.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{currentInsight.title}</h3>
              </div>
              <button
                onClick={() => setCurrentInsight(generateInsight())}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                New Insight
              </button>
            </div>
            <p className="text-gray-700 mb-4">{currentInsight.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Generated by AI analysis</span>
            </div>
          </div>

          {/* Insight Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Trend Analysis</h4>
              <p className="text-sm text-gray-600 mb-3">
                Identifies emerging patterns in political behavior and voter sentiment
              </p>
              <div className="text-xs text-blue-600">Real-time monitoring</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Sentiment Intelligence</h4>
              <p className="text-sm text-gray-600 mb-3">
                Analyzes public opinion from social media and news sources
              </p>
              <div className="text-xs text-green-600">Natural language processing</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Predictive Modeling</h4>
              <p className="text-sm text-gray-600 mb-3">
                Forecasts election outcomes and campaign performance
              </p>
              <div className="text-xs text-purple-600">Machine learning</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Risk Assessment</h4>
              <p className="text-sm text-gray-600 mb-3">
                Evaluates potential risks and opportunities in political strategies
              </p>
              <div className="text-xs text-yellow-600">Scenario analysis</div>
            </div>
          </div>

          {/* AI Capabilities */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">AI Capabilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">89%</div>
                <div className="text-xs text-gray-600">Prediction Accuracy</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-xs text-gray-600">Analysis</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">10K+</div>
                <div className="text-xs text-gray-600">Data Points</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">Real-time</div>
                <div className="text-xs text-gray-600">Updates</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Virtuo AI Assistant v2.0</span>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">AI Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}