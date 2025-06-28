"use client";

import React from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const ConvexClientProvider = ({ children }) => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl || convexUrl === 'your_convex_url_here' || convexUrl === 'https://your-deployment-name.convex.cloud') {
        console.error('NEXT_PUBLIC_CONVEX_URL is not properly configured. Please run `npx convex dev` to get your deployment URL and update your .env.local file.');
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-yellow-800 font-medium">Convex Configuration Required</h3>
                <p className="text-yellow-700 mt-1">
                    Please run <code className="bg-yellow-100 px-1 rounded">npx convex dev</code> to get your Convex URL and update your .env.local file.
                </p>
            </div>
        );
    }
    
    const convex = new ConvexReactClient(convexUrl);
    return (
        <ConvexProvider client={convex}>
            {children}
        </ConvexProvider>
    );
};

export default ConvexClientProvider;