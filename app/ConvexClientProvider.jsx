"use client";

import React from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const ConvexClientProvider = ({ children }) => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl) {
        console.error('NEXT_PUBLIC_CONVEX_URL is not defined. Make sure to run `npx convex dev` and check your .env.local file.');
        return <div>Error: Convex configuration missing. Please check console for details.</div>;
    }
    
    const convex = new ConvexReactClient(convexUrl);
    return (
        <ConvexProvider client={convex}>
            {children}
        </ConvexProvider>
    );
};

export default ConvexClientProvider;