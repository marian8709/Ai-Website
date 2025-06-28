"use client"
import React from 'react';
import EnvironmentConfig from '@/data/EnvironmentConfig';

function EnvironmentSelector({ selectedEnvironment, onEnvironmentChange }) {
    const environments = EnvironmentConfig.ENVIRONMENTS;

    return (
        <div className="w-full max-w-3xl mb-8">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-electric-blue-400 mb-2">
                    Choose Development Environment
                </h3>
                <p className="text-gray-400 text-sm">
                    Select the technology stack for your project
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(environments).map((env) => (
                    <button
                        key={env.id}
                        onClick={() => onEnvironmentChange(env.id)}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                            selectedEnvironment === env.id
                                ? 'border-electric-blue-500 bg-electric-blue-500/10 shadow-[0_0_20px_2px_rgba(59,130,246,0.3)]'
                                : 'border-electric-blue-500/20 bg-gray-900/50 hover:border-electric-blue-500/40 hover:bg-gray-800/60'
                        }`}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-3">{env.icon}</div>
                            <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                                selectedEnvironment === env.id
                                    ? 'text-electric-blue-400'
                                    : 'text-gray-300 group-hover:text-electric-blue-400'
                            }`}>
                                {env.name}
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {env.description}
                            </p>
                        </div>
                        
                        {selectedEnvironment === env.id && (
                            <div className="absolute top-2 right-2">
                                <div className="w-3 h-3 bg-electric-blue-500 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default EnvironmentSelector;