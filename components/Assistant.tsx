import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { IconClose, IconAssistant, IconSend, IconLoading, IconUser } from '../constants';

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
  </div>
);

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // State for the external chat API
  const [sessionId, setSessionId] = useState('');
  const [tenantApiKey, setTenantApiKey] = useState('');

  const addMessage = (sender: 'user' | 'assistant', text: string) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes typing-dot-fade {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }
      .typing-dot {
        animation: typing-dot-fade 1.4s infinite;
      }
      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'assistant', text: "Hello! How can I help you today? Type a message below." }]);
    } else {
      // Clear state when closing the chat
      setMessages([]);
      setError(null);
      setInputText('');
      setIsSendingText(false);
    }
  }, [isOpen]);
  
  // Effect to set session ID on mount
  useEffect(() => {
    // Generate a unique session ID for the user
    setSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // if (event.origin !== "https://mainwebsite.com") return;
      const { apikey, token } = event.data;
      console.log(event?.data?.token
      );
      console.log(token);
      setTenantApiKey(token);
      
      if (apikey === "apikey" && typeof apikey === 'string') {
        
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleSendText = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isSendingText || !tenantApiKey) {
        if (!tenantApiKey) {
            setError('Chat service is not available. Please wait or refresh.');
        }
        return;
    }

    setIsSendingText(true);
    setError(null);
    addMessage('user', trimmedInput);
    setInputText('');

    try {

      const requestbody = JSON.stringify({
              user_identifier: sessionId,
              message: trimmedInput});

      console.log(requestbody);


      const response = await fetch('http://217.217.249.227:3000/widget/chat', {
          method: 'POST',
          headers: {
              'x-api-key':  tenantApiKey,
              'Content-Type': 'application/json',
          },
          body: requestbody,
      });
        
      // if (!response.ok) {
      //     const errorData = await response.text();
      //     throw new Error(`API error: ${response.status} ${errorData}`);
      // }


  
      const result = await response.json();
      console.log(result.reply);
      
      const assistantResponse = result.reply || "Sorry, I encountered a problem responding.";
      addMessage('assistant', assistantResponse);

    } catch (e) {
      console.error("Failed to send text message:", e);
      let userMessage = "Sorry, I couldn't process your message. Please try again.";
      if (e instanceof Error) {
        if (e.message.toLowerCase().includes('failed to fetch')) {
          userMessage = "Cannot connect to the chat service. Please check your internet connection.";
        } else if (e.message.startsWith('API error:')) {
          userMessage = "There was a problem with the chat service. Please try again later.";
        }
      }
      setError(userMessage);
      addMessage('assistant', userMessage);
    } finally {
      setIsSendingText(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <IconAssistant className="w-8 h-8" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-0 right-0 sm:bottom-8 sm:right-8 w-full h-full sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] bg-gray-800 text-white shadow-2xl rounded-none sm:rounded-lg flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-gray-900 sm:rounded-t-lg">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          {/* <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500">
            <IconClose className="w-6 h-6" />
          </button> */}
        </header>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'assistant' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><IconAssistant className="w-5 h-5"/></div>}
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-gray-700' : 'bg-gray-700/50'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
               {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><IconUser className="w-5 h-5"/></div>}
            </div>
          ))}
          {isSendingText && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <IconAssistant className="w-5 h-5" />
              </div>
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-700/50">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {error && <div className="p-4 text-sm text-red-400 bg-red-900/50">{error}</div>}

        {/* Input/Actions */}
        <footer className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                placeholder={!tenantApiKey ? "Initializing chat..." : "Type a message..."}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                disabled={isSendingText || !tenantApiKey}
                aria-label="Message input"
            />
            <button
                onClick={handleSendText}
                disabled={!inputText.trim() || isSendingText || !tenantApiKey }
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 shrink-0"
                aria-label="Send message"
            >
                {isSendingText ? <IconLoading className="w-6 h-6" /> : <IconSend className="w-6 h-6" />}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Assistant;
