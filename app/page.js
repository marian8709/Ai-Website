import Hero from "@/components/custom/Hero";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen"> 
      <Hero />
      
      {/* Chat Preview Section - Visible in first scroll */}
      <div className="bg-slate-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4 neon-text">
              AI-Powered Development Assistant
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Chat with our AI to build, modify, and perfect your applications in real-time
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="glass-dark border border-cyan-400/20 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-400 font-semibold">AI Assistant Online</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="glass border border-cyan-400/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-turquoise-gradient rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">👤</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-sm">
                            "Create a modern dashboard with charts and user management"
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-dark border border-gray-600/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🤖</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-sm">
                            "I'll create a React dashboard with interactive charts, user tables, and a modern design. Let me generate the components..."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-cyan-400">Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Real-time code generation</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Interactive chat interface</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Live preview & editing</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">Multi-platform support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}