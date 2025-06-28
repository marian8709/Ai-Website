import React, { useState, useEffect } from 'react';
import { Code, Sparkles, Zap, Cpu, Brain } from 'lucide-react';

function Header() {
    const [providerStatus, setProviderStatus] = useState({
        gemini: false,
        deepseek: false,
        activeProvider: null
    });

    useEffect(() => {
        // Check provider status on component mount
        checkProviders();
    }, []);

    const checkProviders = async () => {
        try {
            const response = await fetch('/api/provider-status');
            if (response.ok) {
                const status = await response.json();
                setProviderStatus(status);
            }
        } catch (error) {
            console.error('Failed to check provider status:', error);
        }
    };

    const getProviderIcon = (provider) => {
        switch (provider) {
            case 'gemini':
                return <Sparkles className="h-4 w-4" />;
            case 'deepseek':
                return <Brain className="h-4 w-4" />;
            default:
                return <Cpu className="h-4 w-4" />;
        }
    };

    const getProviderName = (provider) => {
        switch (provider) {
            case 'gemini':
                return 'Gemini';
            case 'deepseek':
                return 'DeepSeek';
            default:
                return 'AI';
        }
    };

    return (
        <header className="border-b border-gray-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3 animate-slide-in-up">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-turquoise-gradient rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                            <div className="relative bg-turquoise-gradient p-2 rounded-lg shadow-lg">
                                <Code className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gradient neon-text">
                                AI Website Builder
                            </h1>
                            <span className="text-xs text-cyan-400/70 font-medium tracking-wide">
                                Multi-Provider AI Platform
                            </span>
                        </div>
                    </div>

                    {/* Enhanced Status Badges */}
                    <div className="flex items-center space-x-4">
                        {/* Provider Status */}
                        <div className="hidden md:flex items-center space-x-3">
                            {/* Active Provider Badge */}
                            {providerStatus.activeProvider && (
                                <div className="flex items-center space-x-2 glass-dark px-4 py-2 rounded-full border border-cyan-400/20 hover-lift group">
                                    <div className="relative">
                                        {getProviderIcon(providerStatus.activeProvider)}
                                        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm opacity-30 animate-pulse"></div>
                                    </div>
                                    <span className="text-cyan-400 text-sm font-medium">
                                        {getProviderName(providerStatus.activeProvider)}
                                    </span>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                            )}

                            {/* Fallback Providers Indicator */}
                            <div className="flex items-center space-x-1">
                                {providerStatus.gemini && (
                                    <div className={`w-2 h-2 rounded-full ${
                                        providerStatus.activeProvider === 'gemini' 
                                            ? 'bg-green-400 animate-pulse' 
                                            : 'bg-yellow-400'
                                    }`} title="Gemini Available" />
                                )}
                                {providerStatus.deepseek && (
                                    <div className={`w-2 h-2 rounded-full ${
                                        providerStatus.activeProvider === 'deepseek' 
                                            ? 'bg-green-400 animate-pulse' 
                                            : 'bg-blue-400'
                                    }`} title="DeepSeek Available" />
                                )}
                            </div>
                        </div>

                        {/* AI Status Badge */}
                        <div className="flex items-center space-x-2 glass-dark px-4 py-2 rounded-full border border-cyan-400/20 hover-lift group">
                            <div className="relative">
                                <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
                                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm opacity-30 animate-pulse"></div>
                            </div>
                            <span className="text-cyan-400 text-sm font-medium">Multi-AI</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>

                        {/* Main Status Badge */}
                        <div className="flex items-center space-x-2 glass px-4 py-2 rounded-full border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 group interactive-card">
                            <div className="relative">
                                <Sparkles className="h-4 w-4 text-cyan-400 group-hover:animate-spin transition-all duration-300" />
                                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-cyan-400 text-sm font-medium tracking-wide">
                                Ready to Create
                            </span>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse-glow"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Animated border bottom */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-gradient"></div>
        </header>
    );
}

export default Header;