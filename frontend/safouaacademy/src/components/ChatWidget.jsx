import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Minimize2, Maximize2, 
  Bot, Sparkles, BookOpen, ChevronDown, RefreshCw,
  Moon, Sun, Globe, HelpCircle
} from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: '👋 السلام عليكم ! Je suis l\'assistant intelligent de SafouaAcademy. Comment puis-je vous aider dans votre apprentissage aujourd\'hui ?\n\n───────────────\n\n👋 وعليكم السلام ! أنا المساعد الذكي لأكاديمية سفواء. كيف يمكنني مساعدتك في تعلمك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('fr');
  const [suggestedQuestions] = useState([
    { fr: "Comment apprendre le Tajwid ?", ar: "كيف أتعلم التجويد؟" },
    { fr: "Cours d'arabe pour débutants", ar: "دورات اللغة العربية للمبتدئين" },
    { fr: "Histoire des prophètes", ar: "قصص الأنبياء" },
    { fr: "Apprendre le Fiqh", ar: "تعلم الفقه" }
  ]);
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus sur l'input quand le widget s'ouvre
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  // Vérifier le statut d'Ollama au démarrage
  useEffect(() => {
    checkOllamaStatus();
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkOllamaStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('/api/chat/status');
      const data = await response.json();
      setOllamaStatus(data);
    } catch (error) {
      console.error('Erreur vérification Ollama:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { 
      role: 'user', 
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          history: messages.slice(-8).map(m => ({
            role: m.role,
            text: m.text
          }))
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Erreur réseau');

      setMessages(prev => [...prev, { role: 'assistant', text: '', timestamp: new Date() }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.token) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.text += parsed.token;
                  }
                  return newMessages;
                });
              }
              
              if (parsed.done) {
                setIsLoading(false);
              }
            } catch (e) {
              console.error('Erreur parsing:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erreur:', error);
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            text: '❌ Désolé, une erreur est survenue. Veuillez réessayer.\n\n───────────────\n\n❌ عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
            timestamp: new Date()
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        text: '👋 السلام عليكم ! Je suis l\'assistant intelligent de SafouaAcademy. Comment puis-je vous aider dans votre apprentissage aujourd\'hui ?\n\n───────────────\n\n👋 وعليكم السلام ! أنا المساعد الذكي لأكاديمية سفواء. كيف يمكنني مساعدتك في تعلمك اليوم؟',
        timestamp: new Date()
      }
    ]);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(language === 'fr' ? suggestion.fr : suggestion.ar);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 group z-50"
      >
        <div className="relative">
          {/* Animation de pulsation */}
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
          
          {/* Bouton principal */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-110 transition-all duration-300">
            <MessageCircle size={28} />
          </div>
          
          {/* Badge de statut */}
          {ollamaStatus?.ollamaRunning && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          )}
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap shadow-xl">
              Besoin d'aide ? 🇫🇷🇸🇦
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-3xl shadow-3xl z-50 transition-all duration-500 ${
        isMinimized ? 'w-96 h-20' : 'w-[450px] h-[700px]'
      }`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)'
      }}
    >
      {/* Header avec design islamique */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white rounded-t-3xl overflow-hidden">
        {/* Motif islamique en arrière-plan */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
          </svg>
        </div>

        <div className="relative p-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm">
                  <Bot size={24} className="text-white" />
                </div>
                {ollamaStatus?.ollamaRunning && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Assistant SafouaAcademy
                  <Sparkles size={16} className="text-yellow-300" />
                </h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1">
                  <BookOpen size={12} />
                  Disponible 24/7
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="hover:bg-white/20 p-2 rounded-xl transition-all duration-300"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button 
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="hover:bg-white/20 p-2 rounded-xl transition-all duration-300 flex items-center gap-1"
              >
                <Globe size={18} />
                <span className="text-xs font-medium">{language === 'fr' ? 'FR' : 'عربي'}</span>
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-2 rounded-xl transition-all duration-300"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-xl transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[520px] overflow-y-auto p-5 bg-gradient-to-b from-emerald-50/30 to-white">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-5 ${msg.role === 'user' ? 'text-right' : 'text-left'} animate-fadeIn`}
              >
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg flex-shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  
                  <div
                    className={`relative max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none shadow-lg'
                        : 'bg-white rounded-bl-none shadow-md border border-emerald-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ direction: msg.role === 'assistant' && msg.text.includes('───') ? 'ltr' : 'inherit' }}>
                      {msg.text}
                    </p>
                    
                    {/* Timestamp */}
                    {msg.timestamp && (
                      <div className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs shadow-lg flex-shrink-0">
                      <span className="font-bold">U</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="text-left mb-5 animate-fadeIn">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-none p-5 shadow-md border border-emerald-100">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions de questions */}
          {messages.length < 3 && (
            <div className="px-5 py-3 bg-emerald-50/50 border-t border-emerald-100">
              <p className="text-xs text-emerald-700 mb-2 flex items-center gap-1">
                <HelpCircle size={12} />
                Suggestions :
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(q)}
                    className="text-xs bg-white hover:bg-emerald-50 text-gray-700 px-3 py-1.5 rounded-full border border-emerald-200 transition-all duration-300 hover:shadow-md"
                  >
                    {language === 'fr' ? q.fr : q.ar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-5 border-t border-gray-100 bg-white rounded-b-3xl">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'fr' ? "Écrivez votre message..." : "اكتب رسالتك..."}
                className="w-full p-4 pr-16 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-gray-50/50 hover:bg-white transition-all duration-300"
                rows="2"
                disabled={isLoading}
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-3 bottom-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={clearChat}
                className="text-xs text-gray-500 hover:text-emerald-600 transition-colors duration-300 flex items-center gap-1"
              >
                <RefreshCw size={12} />
                {language === 'fr' ? 'Nouvelle conversation' : 'محادثة جديدة'}
              </button>
              
              {!ollamaStatus?.ollamaRunning && (
                <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  ⚠️ Assistant non connecté
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;