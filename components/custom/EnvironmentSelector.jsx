"use client"
import React from 'react';
import EnvironmentConfig from '@/data/EnvironmentConfig';
import { Check, Zap } from 'lucide-react';

function EnvironmentSelector({ selectedEnvironment, onEnvironmentChange }) {
    const environments = EnvironmentConfig.ENVIRONMENTS;

    return (
        <div className="w-full max-w-4xl mb-8">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-cyan-400 mb-3 neon-text">
                    Choose Development Environment
                </h3>
                <p className="text-gray-400 text-lg">
                    Select the technology stack for your project
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(environments).map((env, index) => (
                    <button
                        key={env.id}
                        onClick={() => onEnvironmentChange(env.id)}
                        className={`group relative p-8 rounded-2xl border-2 transition-all duration-500 hover-lift interactive-card ${
                            selectedEnvironment === env.id
                                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_30px_5px_rgba(34,211,238,0.3)] animate-pulse-glow'
                                : 'border-cyan-400/20 glass-dark hover:border-cyan-400/40'
                        }`}
                        style={{ animationDelay: `${index * 0.2}s` }}
                    >
                        {/* Selection indicator */}
                        {selectedEnvironment === env.id && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-turquoise-gradient rounded-full flex items-center justify-center animate-scale-in">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                        
                        <div className="text-center relative z-10">
                            <div className={`text-6xl mb-4 transition-transform duration-300 group-hover:scale-110 ${
                                selectedEnvironment === env.id ? 'animate-bounce' : ''
                            }`}>
                                {env.icon}
                            </div>
                            
                            <h4 className={`text-xl font-bold mb-3 transition-all duration-300 ${
                                selectedEnvironment === env.id
                                    ? 'text-cyan-400 neon-text'
                                    : 'text-gray-300 group-hover:text-cyan-400'
                            }`}>
                                {env.name}
                            </h4>
                            
                            <p className="text-gray-400 leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
                                {env.description}
                            </p>
                            
                            {/* Tech stack indicators */}
                            <div className="flex items-center justify-center space-x-2 mt-4">
                                <Zap className={`h-4 w-4 transition-colors duration-300 ${
                                    selectedEnvironment === env.id ? 'text-cyan-400' : 'text-gray-500'
                                }`} />
                                <span className={`text-xs font-medium transition-colors duration-300 ${
                                    selectedEnvironment === env.id ? 'text-cyan-400' : 'text-gray-500'
                                }`}>
                                    {env.id === 'react' && 'Modern React + Vite'}
                                    {env.id === 'wordpress' && 'PHP + WordPress'}
                                    {env.id === 'html' && 'HTML5 + CSS3 + JS'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Bottom accent line */}
                        <div className={`absolute bottom-0 left-0 h-1 bg-turquoise-gradient transition-all duration-500 rounded-b-2xl ${
                            selectedEnvironment === env.id ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                        
                        {/* Pulse effect for selected */}
                        {selectedEnvironment === env.id && (
                            <div className="absolute inset-0 border-2 border-cyan-400 rounded-2xl animate-ping opacity-20" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default EnvironmentSelector;