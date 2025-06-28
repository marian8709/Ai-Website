"use client"
import Lookup from '@/data/Lookup';
import EnvironmentConfig from '@/data/EnvironmentConfig';
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Sparkles, Send, Wand2, Loader2, Zap, Code2, Rocket } from 'lucide-react';
import React, { useContext, useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import EnvironmentSelector from './EnvironmentSelector';

function Hero() {
    const [userInput, setUserInput] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] = useState('react');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [particles, setParticles] = useState([]);
    const { messages, setMessages } = useContext(MessagesContext);
    const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
    const router = useRouter();

    // Create floating particles effect
    useEffect(() => {
        const createParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 30; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 2 + 1,
                    delay: Math.random() * 6,
                });
            }
            setParticles(newParticles);
        };
        createParticles();
    }, []);

    const onGenerate = async (input) => {
        const msg = {
            role: 'user',
            content: input,
            environment: selectedEnvironment
        }
        setMessages(msg);
        const workspaceID = await CreateWorkspace({
            messages: [msg],
            environment: selectedEnvironment
        });
        router.push('/workspace/' + workspaceID);
    }

    const enhancePrompt = async () => {
        if (!userInput) return;
        
        setIsEnhancing(true);
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: userInput,
                    environment: selectedEnvironment 
                }),
            });

            const data = await response.json();
            if (data.enhancedPrompt) {
                setUserInput(data.enhancedPrompt);
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const onSuggestionClick = (suggestion) => {
        setUserInput(suggestion);
    };

    const getEnvironmentSuggestions = () => {
        const env = EnvironmentConfig.ENVIRONMENTS[selectedEnvironment.toUpperCase()];
        if (!env) return Lookup.SUGGSTIONS;
        
        switch (selectedEnvironment) {
            case 'react':
                return [
                    'Create a modern e-commerce dashboard',
                    'Build a social media feed',
                    'Develop a task management app'
                ];
            case 'wordpress':
                return [
                    'Create a custom blog theme',
                    'Build a business website theme',
                    'Develop a portfolio theme'
                ];
            case 'html':
                return [
                    'Create a responsive landing page',
                    'Build a portfolio website',
                    'Develop a restaurant website'
                ];
            default:
                return Lookup.SUGGSTIONS.slice(0, 3);
        }
    };

    return (
        <div className="min-h-[70vh] bg-slate-950 relative overflow-hidden">
            {/* Minimal Particles Background */}
            <div className="particles absolute inset-0">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="particle absolute"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDelay: `${particle.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Simplified Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-10">
                <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 bg-[radial-gradient(circle_400px_at_50%_200px,rgba(34,211,238,0.1),transparent)]" />
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-8">
                    {/* Compact Hero Header */}
                    <div className="text-center space-y-4 animate-slide-in-up">
                        <div className="inline-flex items-center justify-center space-x-2 glass px-4 py-2 rounded-full border border-cyan-400/30">
                            <Sparkles className="h-4 w-4 text-cyan-400" />
                            <span className="text-cyan-400 text-sm font-semibold tracking-wide">
                                NEXT-GEN AI DEVELOPMENT
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            <span className="text-gradient neon-text">Code the Impossible</span>
                        </h1>
                        
                        <p className="text-lg text-cyan-400/80 font-mono tracking-tight">
                            Transform ideas into production-ready code
                        </p>
                    </div>

                    {/* Compact Environment Selector */}
                    <div className="w-full max-w-2xl animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                                Choose Development Environment
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Select the technology stack for your project
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(EnvironmentConfig.ENVIRONMENTS).map((env) => (
                                <button
                                    key={env.id}
                                    onClick={() => setSelectedEnvironment(env.id)}
                                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                        selectedEnvironment === env.id
                                            ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_2px_rgba(34,211,238,0.3)]'
                                            : 'border-cyan-400/20 glass-dark hover:border-cyan-400/40'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">{env.icon}</div>
                                        <h4 className={`text-sm font-semibold transition-colors duration-300 ${
                                            selectedEnvironment === env.id
                                                ? 'text-cyan-400'
                                                : 'text-gray-300 group-hover:text-cyan-400'
                                        }`}>
                                            {env.name}
                                        </h4>
                                    </div>
                                    
                                    {selectedEnvironment === env.id && (
                                        <div className="absolute top-1 right-1">
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Input Section */}
                    <div className="w-full max-w-3xl animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="glass-dark rounded-xl border border-cyan-400/30 shadow-xl overflow-hidden">
                            <div className="p-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                <div className="glass-dark p-4 rounded-lg">
                                    <div className="flex gap-3">
                                        <textarea
                                            placeholder={`🚀 Describe your ${selectedEnvironment.toUpperCase()} project...`}
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            className="w-full bg-transparent border-2 border-cyan-400/30 rounded-lg p-4 text-gray-100 placeholder-cyan-400/60 focus:border-cyan-400 focus:ring-0 outline-none font-mono text-sm h-24 resize-none transition-all duration-300 form-input"
                                            disabled={isEnhancing}
                                        />
                                        
                                        <div className="flex flex-col gap-2">
                                            {userInput && (
                                                <>
                                                    <button
                                                        onClick={enhancePrompt}
                                                        disabled={isEnhancing}
                                                        className={`group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg px-3 py-3 transition-all duration-200 ${isEnhancing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isEnhancing ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <Wand2 className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => onGenerate(userInput)}
                                                        disabled={isEnhancing}
                                                        className={`group relative overflow-hidden bg-turquoise-gradient hover:scale-105 rounded-lg px-3 py-3 transition-all duration-200 animate-pulse-glow ${isEnhancing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Send className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Suggestions */}
                    <div className="w-full max-w-4xl animate-slide-in-up" style={{ animationDelay: '0.9s' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {getEnvironmentSuggestions().map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="group relative p-3 glass-dark border border-cyan-400/20 rounded-lg text-left transition-all duration-300 hover:border-cyan-400/40 hover-lift"
                                >
                                    <span className="text-cyan-400/80 group-hover:text-cyan-400 font-mono text-xs tracking-wide transition-colors duration-300">
                                        {suggestion}
                                    </span>
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-turquoise-gradient w-0 group-hover:w-full transition-all duration-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;