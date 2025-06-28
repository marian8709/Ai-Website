import ChatView from '@/components/custom/ChatView';
import CodeView from '@/components/custom/CodeView';
import React from 'react';

const Workspace = () => {
    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Enhanced Animated Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20">
                <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(circle_600px_at_50%_400px,rgba(34,211,238,0.15),transparent)]" />
                <div className="absolute right-0 top-1/4 h-[600px] w-[800px] bg-[radial-gradient(circle_400px_at_80%_300px,rgba(6,182,212,0.1),transparent)]" />
                <div className="absolute left-0 bottom-1/4 h-[500px] w-[600px] bg-[radial-gradient(circle_300px_at_20%_200px,rgba(8,145,178,0.08),transparent)]" />
            </div>

            {/* Floating Particles */}
            <div className="particles absolute inset-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="particle absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animationDelay: `${Math.random() * 6}s`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className='relative z-10 p-6'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-6rem)]'>
                    {/* Chat Panel */}
                    <div className='lg:col-span-1 animate-slide-in-up'>
                        <ChatView />
                    </div>
                    
                    {/* Code Panel */}
                    <div className='lg:col-span-3 animate-slide-in-up' style={{ animationDelay: '0.2s' }}>
                        <CodeView />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;