import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { aiService } from '../services/ai.service';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [asking, setAsking] = useState(false);

    const chatEndRef = useRef(null);

    // Initial load: Fetch chat history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await aiService.getHistory();
                if (res.data && res.data.length > 0) {
                    const mappedHistory = [];
                    // Backend returns recent first, so reverse to display chronologically downwards
                    res.data.reverse().forEach(hItem => {
                        mappedHistory.push({ role: 'user', content: hItem.question, timestamp: hItem.createdAt });
                        mappedHistory.push({ role: 'assistant', content: hItem.response, timestamp: hItem.createdAt });
                    });
                    setMessages(mappedHistory);
                } else {
                    setMessages([
                        {
                            role: 'system', // or 'assistant'
                            content: `Hello! I am your AI Academic Assistant. You can ask me about your attendance, fees, schedule, or general university queries. How can I help you today?`,
                            timestamp: new Date().toISOString()
                        }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
                setMessages([
                    {
                        role: 'system',
                        content: "Welcome to the AI Assistant. History could not be loaded, but you can still send messages.",
                        timestamp: new Date().toISOString()
                    }
                ]);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [user]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, asking]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || asking) return;

        const userMessage = input.trim();
        setInput('');

        // Optimistically add user message to UI
        const newMsg = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        setAsking(true);

        try {
            const res = await aiService.askQuestion(userMessage);

            // Backend response comes as { answer, contextUsed } or similar depending on implementation
            // Assuming res.data.answer or res.data is the string response for now
            const aiResponse = typeof res.data === 'string' ? res.data : (res.data.answer || res.data.response || "No response received.");

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                }
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    role: 'system',
                    content: '⚠️ Failed to get a response from the server. Please check your connection and try again.',
                    timestamp: new Date().toISOString(),
                    isError: true
                }
            ]);
        } finally {
            setAsking(false);
        }
    };

    const isUser = (role) => role === 'user';

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    ✨ IAMS AI Assistant
                </h1>
                <p className="text-gray-500">Ask questions about your academic data, schedules, or policies.</p>
            </div>

            <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-gray-50 border-gray-200">

                {/* Chat History Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingHistory ? (
                        <div className="flex justify-center items-center h-full text-gray-400">Loading chat history...</div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${isUser(msg.role) ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isUser(msg.role)
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : msg.isError
                                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${isUser(msg.role) ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing Indicator */}
                    {asking && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex gap-1 items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            disabled={asking || loadingHistory}
                            className="flex-1 border border-gray-300 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm disabled:bg-gray-50"
                        />
                        <Button
                            type="submit"
                            isLoading={asking}
                            disabled={!input.trim() || asking}
                            className="rounded-full px-6 flex items-center justify-center"
                        >
                            {!asking && (
                                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            )}
                        </Button>
                    </form>
                    <p className="text-center text-[10px] text-gray-400 mt-2">AI can make mistakes. Please verify important information via your academic dashboard.</p>
                </div>

            </Card>
        </div>
    );
};

export default AIAssistant;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
