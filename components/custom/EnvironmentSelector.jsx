"use client"
import React from 'react';
import EnvironmentConfig from '@/data/EnvironmentConfig';
import { Check, Zap } from 'lucide-react';

function EnvironmentSelector({ selectedEnvironment, onEnvironmentChange }) {
    const environments = EnvironmentConfig.ENVIRONMENTS;

    return (
        <div className="w-full max-w-3xl mb-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2 neon-text">
                    Choose Development Environment
                </h3>
                <p className="text-gray-400 text-sm">
                    Select the technology stack for your project
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(environments).map((env, index) => (
                    <button
                        key={env.id}
                        onClick={() => onEnvironmentChange(env.id)}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover-lift ${
                            selectedEnvironment === env.id
                                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_2px_rgba(34,211,238,0.3)] animate-pulse-glow'
                                : 'border-cyan-400/20 glass-dark hover:border-cyan-400/40'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Selection indicator */}
                        {selectedEnvironment === env.id && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-turquoise-gradient rounded-full flex items-center justify-center animate-scale-in">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                        
                        <div className="text-center relative z-10">
                            <div className={`text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 ${
                                selectedEnvironment === env.id ? 'animate-bounce' : ''
                            }`}>
                                {env.icon}
                            </div>
                            
                            <h4 className={`text-lg font-bold mb-2 transition-all duration-300 ${
                                selectedEnvironment === env.id
                                    ? 'text-cyan-400 neon-text'
                                    : 'text-gray-300 group-hover:text-cyan-400'
                            }`}>
                                {env.name}
                            </h4>
                            
                            <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                {env.description}
                            </p>
                        </div>
                        
                        {/* Bottom accent line */}
                        <div className={`absolute bottom-0 left-0 h-1 bg-turquoise-gradient transition-all duration-500 rounded-b-xl ${
                            selectedEnvironment === env.id ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default EnvironmentSelector;