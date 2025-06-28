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
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 3 + 1,
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
                    'Create a modern e-commerce dashboard with React hooks',
                    'Build a social media feed with infinite scrolling',
                    'Develop a task management app with drag and drop',
                    'Create a weather app with geolocation',
                    'Build a music player with playlist management',
                    'Develop a chat application with real-time messaging'
                ];
            case 'wordpress':
                return [
                    'Create a custom WordPress blog theme',
                    'Build a business website theme with contact forms',
                    'Develop a portfolio theme for photographers',
                    'Create an e-commerce theme with WooCommerce',
                    'Build a news/magazine theme with custom post types',
                    'Develop a restaurant theme with menu management'
                ];
            case 'html':
                return [
                    'Create a responsive landing page for a startup',
                    'Build a portfolio website with CSS animations',
                    'Develop a restaurant website with online menu',
                    'Create a corporate website with contact forms',
                    'Build a photography portfolio with image gallery',
                    'Develop a fitness website with class schedules'
                ];
            default:
                return Lookup.SUGGSTIONS;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Animated Particles Background */}
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

            {/* Enhanced Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20">
                <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(circle_600px_at_50%_400px,rgba(34,211,238,0.15),transparent)]" />
                <div className="absolute right-0 top-1/4 h-[600px] w-[800px] bg-[radial-gradient(circle_400px_at_80%_300px,rgba(6,182,212,0.1),transparent)]" />
                <div className="absolute left-0 bottom-1/4 h-[500px] w-[600px] bg-[radial-gradient(circle_300px_at_20%_200px,rgba(8,145,178,0.08),transparent)]" />
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-12">
                    {/* Enhanced Hero Header */}
                    <div className="text-center space-y-8 animate-slide-in-up">
                        <div className="inline-flex items-center justify-center space-x-3 glass px-8 py-4 rounded-full mb-8 border border-cyan-400/30 hover-lift group">
                            <div className="relative">
                                <Sparkles className="h-6 w-6 text-cyan-400 group-hover:animate-spin transition-all duration-300" />
                                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-cyan-400 text-lg font-semibold tracking-wide">
                                NEXT-GEN AI DEVELOPMENT
                            </span>
                            <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
                        </div>
                        
                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
                                <span className="text-gradient neon-text animate-float">Code the</span>
                                <br />
                                <span className="text-gradient neon-text" style={{ animationDelay: '0.5s' }}>Impossible</span>
                            </h1>
                            
                            <div className="flex items-center justify-center space-x-4 text-xl text-cyan-400 font-mono tracking-tight animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                                <Code2 className="h-6 w-6 animate-pulse" />
                                <span>Transform ideas into production-ready code</span>
                                <Rocket className="h-6 w-6 animate-bounce" />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Environment Selector */}
                    <div className="animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                        <EnvironmentSelector 
                            selectedEnvironment={selectedEnvironment}
                            onEnvironmentChange={setSelectedEnvironment}
                        />
                    </div>

                    {/* Enhanced Input Section */}
                    <div className="w-full max-w-4xl animate-slide-in-up" style={{ animationDelay: '0.9s' }}>
                        <div className="glass-dark rounded-2xl border border-cyan-400/30 shadow-2xl hover:border-cyan-400/50 transition-all duration-300 overflow-hidden">
                            <div className="p-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                <div className="glass-dark p-8 rounded-xl">
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative group">
                                            <textarea
                                                placeholder={`🚀 DESCRIBE YOUR ${selectedEnvironment.toUpperCase()} PROJECT...`}
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                className="w-full bg-transparent border-2 border-cyan-400/30 rounded-xl p-6 text-gray-100 placeholder-cyan-400/60 focus:border-cyan-400 focus:ring-0 outline-none font-mono text-lg h-40 resize-none transition-all duration-300 hover:border-cyan-400/60 form-input custom-scrollbar"
                                                disabled={isEnhancing}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-3">
                                            {userInput && (
                                                <>
                                                    <button
                                                        onClick={enhancePrompt}
                                                        disabled={isEnhancing}
                                                        className={`group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl px-6 py-4 transition-all duration-300 hover-lift ${isEnhancing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                        {isEnhancing ? (
                                                            <Loader2 className="h-8 w-8 animate-spin relative z-10" />
                                                        ) : (
                                                            <Wand2 className="h-8 w-8 relative z-10 group-hover:animate-pulse" />
                                                        )}
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => onGenerate(userInput)}
                                                        disabled={isEnhancing}
                                                        className={`group relative overflow-hidden bg-turquoise-gradient hover:scale-105 rounded-xl px-6 py-4 transition-all duration-300 hover-lift animate-pulse-glow ${isEnhancing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                        <Send className="h-8 w-8 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="flex items-center space-x-2 text-cyan-400/60 text-sm">
                                            <Link className="h-4 w-4" />
                                            <span>AI-powered code generation</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-cyan-400/60 text-sm">
                                            <span>Press Ctrl+Enter to generate</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Suggestions Grid */}
                    <div className="w-full max-w-6xl animate-slide-in-up" style={{ animationDelay: '1.2s' }}>
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold text-cyan-400 mb-3 neon-text">
                                {EnvironmentConfig.ENVIRONMENTS[selectedEnvironment.toUpperCase()]?.name} Project Ideas
                            </h3>
                            <p className="text-gray-400">Click any suggestion to get started instantly</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getEnvironmentSuggestions().map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="group relative p-6 glass-dark hover:glass border-2 border-cyan-400/20 rounded-xl text-left transition-all duration-300 hover:border-cyan-400/40 hover-lift interactive-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRight className="h-5 w-5 text-cyan-400" />
                                    </div>
                                    <span className="text-cyan-400/80 group-hover:text-cyan-400 font-mono text-sm tracking-wide transition-colors duration-300 relative z-10">
                                        {suggestion}
                                    </span>
                                    <div className="absolute bottom-0 left-0 h-1 bg-turquoise-gradient w-0 group-hover:w-full transition-all duration-500 rounded-b-xl" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Features Section */}
                    <div className="w-full max-w-4xl mt-16 animate-slide-in-up" style={{ animationDelay: '1.5s' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 glass-dark rounded-xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover-lift">
                                <div className="w-16 h-16 bg-turquoise-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Lightning Fast</h4>
                                <p className="text-gray-400 text-sm">Generate complete applications in seconds with AI</p>
                            </div>
                            
                            <div className="text-center p-6 glass-dark rounded-xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover-lift" style={{ animationDelay: '0.2s' }}>
                                <div className="w-16 h-16 bg-turquoise-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                                    <Code2 className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Production Ready</h4>
                                <p className="text-gray-400 text-sm">Clean, optimized code following best practices</p>
                            </div>
                            
                            <div className="text-center p-6 glass-dark rounded-xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover-lift" style={{ animationDelay: '0.4s' }}>
                                <div className="w-16 h-16 bg-turquoise-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                                    <Rocket className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Multi-Platform</h4>
                                <p className="text-gray-400 text-sm">React, WordPress, and static HTML support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;