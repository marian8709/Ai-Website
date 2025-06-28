"use client"
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Loader2Icon, Send, Sparkles, Bot, User, Zap } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function ChatView() {
    const { id } = useParams();
    const convex = useConvex();
    const { messages, setMessages } = useContext(MessagesContext);
    const [userInput, setUserInput] = useState();
    const [loading, setLoading] = useState(false);
    const [environment, setEnvironment] = useState('react');
    const [isTyping, setIsTyping] = useState(false);
    const UpdateMessages = useMutation(api.workspace.UpdateWorkspace);

    useEffect(() => {
        id && GetWorkSpaceData();
    }, [id])

    const GetWorkSpaceData = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        setMessages(result?.messages);
        setEnvironment(result?.environment || 'react');
        console.log(result);
    }

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages?.length - 1].role;
            if (role === 'user') {
                GetAiResponse();
            }
        }
    }, [messages])

    const GetAiResponse = async () => {
        setLoading(true);
        setIsTyping(true);
        
        const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
        const result = await axios.post('/api/ai-chat', {
            prompt: PROMPT
        });

        const aiResp = {
            role: 'ai',
            content: result.data.result
        }
        
        setIsTyping(false);
        setMessages(prev => [...prev, aiResp]);
        await UpdateMessages({
            messages: [...messages, aiResp],
            workspaceId: id
        })
        setLoading(false);
    }

    const onGenerate = (input) => {
        setMessages(prev => [...prev, {
            role: 'user',
            content: input,
            environment: environment
        }]);
        setUserInput('');
    }

    const getEnvironmentBadge = () => {
        const envColors = {
            react: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            wordpress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            html: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
        
        const envIcons = {
            react: '⚛️',
            wordpress: '📝',
            html: '🌐'
        };

        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 hover:scale-105 env-badge ${envColors[environment] || envColors.react}`}>
                <span className="text-lg">{envIcons[environment] || envIcons.react}</span>
                <span>{environment.toUpperCase()}</span>
                <Zap className="h-4 w-4 animate-pulse" />
            </div>
        );
    };

    return (
        <div className="relative h-[85vh] flex flex-col glass-dark border border-cyan-400/20 rounded-xl overflow-hidden">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-cyan-400/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-turquoise-gradient rounded-full flex items-center justify-center animate-pulse-glow">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-cyan-400 neon-text">AI Assistant</h2>
                                <p className="text-xs text-gray-400">Ready to help you code</p>
                            </div>
                        </div>
                        {getEnvironmentBadge()}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-cyan-400/60 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Online</span>
                    </div>
                </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {Array.isArray(messages) && messages?.map((msg, index) => (
                        <div
                            key={index}
                            className={`message-enter ${
                                msg.role === 'user' 
                                    ? 'flex justify-end' 
                                    : 'flex justify-start'
                            }`}
                        >
                            <div className={`max-w-[80%] ${
                                msg.role === 'user'
                                    ? 'glass border border-cyan-400/30 rounded-2xl rounded-br-md'
                                    : 'glass-dark border border-gray-600/30 rounded-2xl rounded-bl-md'
                            } p-6 hover-lift transition-all duration-300`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${
                                        msg.role === 'user' 
                                            ? 'bg-turquoise-gradient' 
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    } animate-pulse-glow`}>
                                        {msg.role === 'user' ? (
                                            <User className="h-5 w-5 text-white" />
                                        ) : (
                                            <Bot className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`font-semibold ${
                                                msg.role === 'user' ? 'text-cyan-400' : 'text-purple-400'
                                            }`}>
                                                {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date().toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <ReactMarkdown className="prose prose-invert prose-cyan max-w-none">
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start message-enter">
                            <div className="glass-dark border border-gray-600/30 rounded-2xl rounded-bl-md p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse-glow">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-purple-400 font-semibold">AI Assistant</span>
                                        <span className="text-gray-400">is typing</span>
                                        <div className="loading-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Loading State */}
                    {loading && !isTyping && (
                        <div className="flex justify-center">
                            <div className="glass-dark border border-cyan-400/30 rounded-xl p-6">
                                <div className="flex items-center gap-4 text-cyan-400">
                                    <Loader2Icon className="animate-spin h-6 w-6" />
                                    <p className="font-medium">Processing your request...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Input Section */}
            <div className="border-t border-cyan-400/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-dark border border-cyan-400/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                        <div className="flex gap-4">
                            <div className="flex-1 relative group">
                                <textarea
                                    placeholder={`💬 Ask about your ${environment.toUpperCase()} project...`}
                                    value={userInput}
                                    onChange={(event) => setUserInput(event.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey && userInput) {
                                            onGenerate(userInput);
                                        }
                                    }}
                                    className="w-full bg-transparent border-2 border-cyan-400/30 rounded-xl p-4 text-white placeholder-cyan-400/60 focus:border-cyan-400 focus:ring-0 outline-none transition-all duration-300 resize-none h-24 form-input custom-scrollbar"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            
                            {userInput && (
                                <button
                                    onClick={() => onGenerate(userInput)}
                                    className="group relative overflow-hidden bg-turquoise-gradient hover:scale-105 rounded-xl px-6 py-4 transition-all duration-300 hover-lift animate-pulse-glow"
                                >
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <Send className="h-6 w-6 text-white relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center space-x-2 text-cyan-400/60 text-sm">
                                <Link className="h-4 w-4" />
                                <span>AI-powered assistance</span>
                            </div>
                            <div className="flex items-center space-x-2 text-cyan-400/60 text-sm">
                                <span>Ctrl+Enter to send</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatView;