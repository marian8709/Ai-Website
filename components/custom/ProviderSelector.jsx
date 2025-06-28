"use client"
import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, Check, Zap } from 'lucide-react';

function ProviderSelector({ selectedProvider, onProviderChange }) {
    const [providerStatus, setProviderStatus] = useState({
        gemini: false,
        deepseek: false,
        activeProvider: null
    });

    useEffect(() => {
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

    const providers = [
        {
            id: 'auto',
            name: 'Auto',
            description: 'Automatically select the best available provider',
            icon: <Zap className="h-6 w-6" />,
            color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            available: providerStatus.gemini || providerStatus.deepseek
        },
        {
            id: 'gemini',
            name: 'Gemini',
            description: 'Google\'s advanced AI model for code generation',
            icon: <Sparkles className="h-6 w-6" />,
            color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            available: providerStatus.gemini
        },
        {
            id: 'deepseek',
            name: 'DeepSeek',
            description: 'Specialized coding AI with deep understanding',
            icon: <Brain className="h-6 w-6" />,
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            available: providerStatus.deepseek
        }
    ];

    return (
        <div className="w-full max-w-4xl mb-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2 neon-text">
                    Choose AI Provider
                </h3>
                <p className="text-gray-400 text-sm">
                    Select which AI model to use for code generation
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((provider, index) => (
                    <button
                        key={provider.id}
                        onClick={() => provider.available && onProviderChange(provider.id)}
                        disabled={!provider.available}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover-lift ${
                            selectedProvider === provider.id
                                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_2px_rgba(34,211,238,0.3)] animate-pulse-glow'
                                : provider.available
                                    ? 'border-cyan-400/20 glass-dark hover:border-cyan-400/40'
                                    : 'border-gray-600/20 glass-dark opacity-50 cursor-not-allowed'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Selection indicator */}
                        {selectedProvider === provider.id && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-turquoise-gradient rounded-full flex items-center justify-center animate-scale-in">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                        
                        {/* Availability indicator */}
                        <div className="absolute top-3 left-3">
                            <div className={`w-3 h-3 rounded-full ${
                                provider.available ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                            }`} />
                        </div>
                        
                        <div className="text-center relative z-10">
                            <div className={`mb-3 transition-transform duration-300 group-hover:scale-110 ${
                                selectedProvider === provider.id ? 'animate-bounce' : ''
                            } ${provider.available ? '' : 'opacity-50'}`}>
                                {provider.icon}
                            </div>
                            
                            <h4 className={`text-lg font-bold mb-2 transition-all duration-300 ${
                                selectedProvider === provider.id
                                    ? 'text-cyan-400 neon-text'
                                    : provider.available
                                        ? 'text-gray-300 group-hover:text-cyan-400'
                                        : 'text-gray-500'
                            }`}>
                                {provider.name}
                            </h4>
                            
                            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                provider.available
                                    ? 'text-gray-400 group-hover:text-gray-300'
                                    : 'text-gray-600'
                            }`}>
                                {provider.description}
                            </p>
                            
                            {!provider.available && (
                                <div className="mt-2">
                                    <span className="text-xs text-red-400">Unavailable</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Bottom accent line */}
                        <div className={`absolute bottom-0 left-0 h-1 bg-turquoise-gradient transition-all duration-500 rounded-b-xl ${
                            selectedProvider === provider.id ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </button>
                ))}
            </div>
            
            {/* Status information */}
            <div className="mt-4 text-center">
                <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span>Selected</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProviderSelector;