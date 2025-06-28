"use client"
import React, { use, useContext } from 'react';
import { useState } from 'react';
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import Lookup from '@/data/Lookup';
import EnvironmentConfig from '@/data/EnvironmentConfig';
import { MessagesContext } from '@/context/MessagesContext';
import axios from 'axios';
import Prompt from '@/data/Prompt';
import { useEffect } from 'react';
import { UpdateFiles } from '@/convex/workspace';
import { useConvex, useMutation } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Loader2Icon, Download, Code2, Eye, Zap, FileCode, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

function CodeView() {

    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('code');
    const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
    const [environment, setEnvironment] = useState('react');
    const { messages, setMessages } = useContext(MessagesContext);
    const UpdateFiles = useMutation(api.workspace.UpdateFiles);
    const convex = useConvex();
    const [loading, setLoading] = useState(false);
    const [quotaError, setQuotaError] = useState(null);

    useEffect(() => {
        id && GetFiles();
    }, [id])

    const GetFiles = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        
        // Set environment from workspace
        const workspaceEnvironment = result?.environment || 'react';
        setEnvironment(workspaceEnvironment);
        
        // Get default files for the environment
        const envConfig = EnvironmentConfig.ENVIRONMENTS[workspaceEnvironment.toUpperCase()];
        const defaultFiles = envConfig?.defaultFiles || Lookup.DEFAULT_FILE;
        
        // Preprocess and validate files before merging
        const processedFiles = preprocessFiles(result?.fileData || {});
        const mergedFiles = { ...defaultFiles, ...processedFiles };
        setFiles(mergedFiles);
    }

    // Add file preprocessing function
    const preprocessFiles = (files) => {
        const processed = {};
        Object.entries(files).forEach(([path, content]) => {
            // Ensure the file has proper content structure
            if (typeof content === 'string') {
                processed[path] = { code: content };
            } else if (content && typeof content === 'object') {
                if (!content.code && typeof content === 'object') {
                    processed[path] = { code: JSON.stringify(content, null, 2) };
                } else {
                    processed[path] = content;
                }
            }
        });
        return processed;
    }

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages?.length - 1].role;
            if (role === 'user') {
                GenerateAiCode();
            }
        }
    }, [messages])

    const GenerateAiCode = async () => {
        setLoading(true);
        setQuotaError(null); // Clear any previous quota errors
        
        try {
            const PROMPT = JSON.stringify(messages);
            const result = await axios.post('/api/gen-ai-code', {
                prompt: PROMPT,
                environment: environment
            });

            // Check for quota exceeded error
            if (result.data?.quotaExceeded || result.data?.error === 'QUOTA_EXCEEDED') {
                setQuotaError({
                    message: result.data.message || 'API quota exceeded',
                    details: result.data.details || 'Please try again later'
                });
                setLoading(false);
                return;
            }

            // Check if the API returned an error
            if (result.data?.error && result.data.error !== 'QUOTA_EXCEEDED') {
                console.error('AI Code generation error:', result.data.error);
                // Still try to process any files that might have been returned
            }

            // Ensure we have a files object, even if empty
            const aiFiles = result.data?.files || {};
            
            // Preprocess AI-generated files
            const processedAiFiles = preprocessFiles(aiFiles);
            
            // Get environment-specific default files
            const envConfig = EnvironmentConfig.ENVIRONMENTS[environment.toUpperCase()];
            const defaultFiles = envConfig?.defaultFiles || Lookup.DEFAULT_FILE;
            
            const mergedFiles = { ...defaultFiles, ...processedAiFiles };
            setFiles(mergedFiles);

            // Only update files if we have valid file data
            if (Object.keys(aiFiles).length > 0) {
                await UpdateFiles({
                    workspaceId: id,
                    files: aiFiles
                });
            } else {
                console.warn('No files generated by AI, skipping UpdateFiles call');
            }
        } catch (error) {
            console.error('Error in GenerateAiCode:', error);
            
            // Check if it's a quota error from the response
            if (error.response?.data?.quotaExceeded || error.response?.data?.error === 'QUOTA_EXCEEDED') {
                setQuotaError({
                    message: error.response.data.message || 'API quota exceeded',
                    details: error.response.data.details || 'Please try again later'
                });
            } else {
                // Handle other types of errors
                setQuotaError({
                    message: 'An error occurred while generating code',
                    details: error.message || 'Please try again'
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const downloadFiles = async () => {
        try {
            // Create a new JSZip instance
            const zip = new JSZip();

            // Add each file to the zip
            Object.entries(files).forEach(([filename, content]) => {
                // Handle the file content based on its structure
                let fileContent;
                if (typeof content === 'string') {
                    fileContent = content;
                } else if (content && typeof content === 'object') {
                    if (content.code) {
                        fileContent = content.code;
                    } else {
                        // If it's an object without code property, stringify it
                        fileContent = JSON.stringify(content, null, 2);
                    }
                }

                // Only add the file if we have content
                if (fileContent) {
                    // Remove leading slash if present
                    const cleanFileName = filename.startsWith('/') ? filename.slice(1) : filename;
                    zip.file(cleanFileName, fileContent);
                }
            });

            // Add environment-specific configuration files
            const envConfig = EnvironmentConfig.ENVIRONMENTS[environment.toUpperCase()];
            
            if (environment === 'react' && envConfig?.dependencies) {
                // Add package.json for React projects
                const packageJson = {
                    name: "generated-react-project",
                    version: "1.0.0",
                    private: true,
                    dependencies: envConfig.dependencies,
                    scripts: {
                        "dev": "vite",
                        "build": "vite build",
                        "preview": "vite preview"
                    }
                };
                zip.file("package.json", JSON.stringify(packageJson, null, 2));
            } else if (environment === 'wordpress') {
                // Add README for WordPress theme
                const readmeContent = `# WordPress Theme

## Installation
1. Upload the theme folder to /wp-content/themes/
2. Activate the theme in WordPress admin
3. Customize through Appearance > Customize

## Features
- Responsive design
- Custom post types support
- SEO optimized
- Widget ready

## Requirements
- WordPress 5.0+
- PHP 7.4+
`;
                zip.file("README.md", readmeContent);
                
                // Add theme screenshot placeholder
                zip.file("screenshot.png", ""); // Placeholder for theme screenshot
            } else if (environment === 'html') {
                // Add README for static website
                const readmeContent = `# Static Website

## Setup
1. Extract files to your web server
2. Open index.html in a web browser
3. Customize as needed

## Features
- Responsive design
- Modern CSS and JavaScript
- Contact form with validation
- Smooth scrolling navigation

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
`;
                zip.file("README.md", readmeContent);
            }

            // Generate the zip file
            const blob = await zip.generateAsync({ type: "blob" });

            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${environment}-project-files.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading files:', error);
        }
    };

    const getEnvironmentBadge = () => {
        const envColors = {
            react: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            wordpress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            html: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
        
        const envIcons = {
            react: '⚛️',
            wordpress: '📝',
            html: '🌐'
        };

        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 env-badge ${envColors[environment] || envColors.react}`}>
                <span className="text-lg">{envIcons[environment] || envIcons.react}</span>
                <span>{environment.toUpperCase()}</span>
                <Zap className="h-4 w-4 animate-pulse" />
            </div>
        );
    };

    const getSandpackTemplate = () => {
        switch (environment) {
            case 'react':
                return 'react';
            case 'html':
                return 'vanilla';
            case 'wordpress':
                return 'vanilla';
            default:
                return 'react';
        }
    };

    const getSandpackDependencies = () => {
        const envConfig = EnvironmentConfig.ENVIRONMENTS[environment.toUpperCase()];
        
        // For WordPress and HTML, return empty dependencies since they don't use npm
        if (environment === 'wordpress' || environment === 'html') {
            return {};
        }
        
        return envConfig?.dependencies || Lookup.DEPENDANCY;
    };

    const getSandpackEntry = () => {
        switch (environment) {
            case 'react':
                return '/index.js';
            case 'html':
                return '/index.html';
            case 'wordpress':
                return '/index.html'; // Use index.html for WordPress preview
            default:
                return '/index.js';
        }
    };

    const getSandpackExternalResources = () => {
        switch (environment) {
            case 'html':
                return [
                    'https://cdn.tailwindcss.com',
                    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
                ];
            case 'wordpress':
                return ['https://cdn.tailwindcss.com'];
            case 'react':
            default:
                return ['https://cdn.tailwindcss.com'];
        }
    };

    // Enhanced WordPress preview conversion
    const getWordPressPreviewFiles = () => {
        if (environment !== 'wordpress') return files;

        const previewFiles = { ...files };
        
        // Get WordPress files
        const indexPhp = files['/index.php']?.code || '';
        const headerPhp = files['/header.php']?.code || '';
        const footerPhp = files['/footer.php']?.code || '';
        const styleCss = files['/style.css']?.code || '';
        const singlePhp = files['/single.php']?.code || '';
        const pagePhp = files['/page.php']?.code || '';
        const functionsPhp = files['/functions.php']?.code || '';
        
        // Create sample WordPress content
        const samplePosts = [
            {
                title: "Welcome to Your WordPress Theme",
                content: "This is a sample blog post to demonstrate how your WordPress theme looks. The theme includes modern styling, responsive design, and all the features you need for a professional website.",
                author: "Admin",
                date: "January 15, 2024",
                category: "General"
            },
            {
                title: "Another Sample Post",
                content: "Here's another example of how your blog posts will appear. The theme supports featured images, categories, tags, and all standard WordPress functionality.",
                author: "Editor",
                date: "January 10, 2024",
                category: "News"
            }
        ];

        // Extract header content
        let headerContent = headerPhp;
        headerContent = headerContent.replace(/<\?php[\s\S]*?\?>/g, '');
        headerContent = headerContent.replace(/wp_head\(\);?/g, '');
        headerContent = headerContent.replace(/body_class\(\);?/g, 'class="wordpress-theme"');
        headerContent = headerContent.replace(/language_attributes\(\);?/g, 'lang="en"');
        headerContent = headerContent.replace(/bloginfo\(['"](.*?)['"]\);?/g, (match, p1) => {
            if (p1 === 'charset') return 'UTF-8';
            if (p1 === 'name') return 'Your WordPress Site';
            if (p1 === 'description') return 'Just another WordPress site';
            return 'WordPress Site';
        });

        // Extract footer content
        let footerContent = footerPhp;
        footerContent = footerContent.replace(/<\?php[\s\S]*?\?>/g, '');
        footerContent = footerContent.replace(/wp_footer\(\);?/g, '');

        // Process main content
        let mainContent = indexPhp;
        mainContent = mainContent.replace(/get_header\(\);?\s*\?>/g, '');
        mainContent = mainContent.replace(/<\?php\s*get_footer\(\);?/g, '');
        
        // Replace WordPress loop with sample content
        const loopRegex = /while\s*\(\s*have_posts\(\)\s*\)\s*:\s*the_post\(\);?([\s\S]*?)endwhile;?/g;
        mainContent = mainContent.replace(loopRegex, () => {
            return samplePosts.map(post => `
                <article class="post-article">
                    <header class="entry-header">
                        <h1 class="entry-title">${post.title}</h1>
                        <div class="entry-meta">
                            <span class="posted-on">${post.date}</span>
                            <span class="byline">by ${post.author}</span>
                        </div>
                    </header>
                    <div class="entry-content">
                        <p>${post.content}</p>
                    </div>
                    <footer class="entry-footer">
                        <div class="categories">Categories: <span class="category">${post.category}</span></div>
                    </footer>
                </article>
            `).join('');
        });

        // Replace common WordPress functions
        mainContent = mainContent.replace(/<\?php[\s\S]*?\?>/g, '');
        mainContent = mainContent.replace(/the_title\(\);?/g, 'Sample WordPress Post Title');
        mainContent = mainContent.replace(/the_content\(\);?/g, 'This is sample content for your WordPress theme. The actual content will be managed through the WordPress admin panel.');
        mainContent = mainContent.replace(/the_author\(\);?/g, 'Admin');
        mainContent = mainContent.replace(/get_the_date\(\);?/g, 'January 15, 2024');
        mainContent = mainContent.replace(/home_url\(['"]\/(.*?)['"]\);?/g, '#');
        mainContent = mainContent.replace(/esc_url\((.*?)\);?/g, '#');
        mainContent = mainContent.replace(/esc_html\((.*?)\);?/g, '$1');
        
        // Replace navigation menus
        mainContent = mainContent.replace(/wp_nav_menu\([\s\S]*?\);?/g, `
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        `);

        // Create complete HTML preview
        previewFiles['/index.html'] = {
            code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress Theme Preview</title>
    <style>
        /* WordPress Theme Styles */
        ${styleCss}
        
        /* Additional preview styles */
        .wordpress-theme {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 1rem;
            margin: 0;
            padding: 0;
        }
        
        .nav-menu a {
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        
        .nav-menu a:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .post-article {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .entry-title {
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        
        .entry-meta {
            color: #7f8c8d;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }
        
        .entry-content p {
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        
        .entry-footer {
            border-top: 1px solid #eee;
            padding-top: 1rem;
            margin-top: 1rem;
        }
        
        .category {
            background: #3498db;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .nav-menu {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .post-article {
                padding: 1rem;
            }
        }
    </style>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="wordpress-theme">
    ${headerContent}
    
    <main id="main" class="site-main">
        ${mainContent}
    </main>
    
    ${footerContent}
    
    <script>
        // WordPress theme preview functionality
        document.addEventListener('DOMContentLoaded', function() {
            console.log('WordPress Theme Preview Loaded');
            
            // Smooth scrolling for navigation
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Add mobile menu toggle if needed
            const menuToggle = document.querySelector('.menu-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (menuToggle && navMenu) {
                menuToggle.addEventListener('click', function() {
                    navMenu.classList.toggle('active');
                });
            }
            
            // Simulate WordPress admin bar (optional)
            const adminBar = document.createElement('div');
            adminBar.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 32px;
                background: #23282d;
                color: #eee;
                font-size: 13px;
                line-height: 32px;
                padding: 0 20px;
                z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            \`;
            adminBar.innerHTML = '🔧 WordPress Theme Preview Mode - This is how your theme will look';
            document.body.insertBefore(adminBar, document.body.firstChild);
            
            // Adjust body padding for admin bar
            document.body.style.paddingTop = '32px';
        });
    </script>
</body>
</html>`
        };

        return previewFiles;
    };

    return (
        <div className='relative'>
            {/* Enhanced Header */}
            <div className='glass-dark border border-cyan-400/20 w-full p-4 rounded-t-xl'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-6'>
                        {/* Enhanced Tab Switcher */}
                        <div className='flex items-center glass border border-cyan-400/30 p-1 rounded-full'>
                            <button 
                                onClick={() => setActiveTab('code')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                                    activeTab === 'code' 
                                        ? 'bg-turquoise-gradient text-white shadow-lg animate-pulse-glow' 
                                        : 'text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/10'
                                }`}
                            >
                                <Code2 className="h-4 w-4" />
                                Code
                            </button>

                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                                    activeTab === 'preview' 
                                        ? 'bg-turquoise-gradient text-white shadow-lg animate-pulse-glow' 
                                        : 'text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/10'
                                }`}
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </button>
                        </div>
                        
                        {getEnvironmentBadge()}
                        
                        {/* File count indicator */}
                        <div className="flex items-center gap-2 text-cyan-400/60 text-sm">
                            <FileCode className="h-4 w-4" />
                            <span>{Object.keys(files).length} files</span>
                        </div>
                    </div>

                    {/* Enhanced Download Button */}
                    <button
                        onClick={downloadFiles}
                        className="group relative overflow-hidden bg-turquoise-gradient hover:scale-105 text-white px-6 py-3 rounded-full transition-all duration-300 hover-lift animate-pulse-glow"
                    >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="flex items-center gap-2 relative z-10">
                            <Download className="h-4 w-4 group-hover:animate-bounce" />
                            <span className="font-medium">Download</span>
                        </div>
                    </button>
                </div>
            </div>
            
            {/* Quota Error Banner */}
            {quotaError && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-amber-400 font-medium mb-1">API Quota Exceeded</h3>
                            <p className="text-amber-200/80 text-sm mb-2">{quotaError.message}</p>
                            <p className="text-amber-200/60 text-xs mb-3">{quotaError.details}</p>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1 text-amber-200/60">
                                    <Clock className="h-3 w-3" />
                                    <span>Quota resets in 24 hours</span>
                                </div>
                                <a 
                                    href="https://ai.google.dev/gemini-api/docs/rate-limits" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Learn about quotas</span>
                                </a>
                            </div>
                        </div>
                        <button 
                            onClick={() => setQuotaError(null)}
                            className="text-amber-400/60 hover:text-amber-400 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
            
            {/* Enhanced Code Editor */}
            <div className="code-editor-wrapper">
                <SandpackProvider
                    files={environment === 'wordpress' ? getWordPressPreviewFiles() : files}
                    template={getSandpackTemplate()}
                    theme={{
                        colors: {
                            surface1: '#0f172a',
                            surface2: '#1e293b',
                            surface3: '#334155',
                            clickable: '#22d3ee',
                            base: '#e2e8f0',
                            disabled: '#64748b',
                            hover: '#06b6d4',
                            accent: '#22d3ee',
                            error: '#ef4444',
                            errorSurface: '#7f1d1d',
                        },
                        syntax: {
                            plain: '#e2e8f0',
                            comment: '#64748b',
                            keyword: '#22d3ee',
                            tag: '#06b6d4',
                            punctuation: '#94a3b8',
                            definition: '#0891b2',
                            property: '#22d3ee',
                            static: '#06b6d4',
                            string: '#10b981',
                        },
                        font: {
                            body: '"Fira Code", "Consolas", "Monaco", monospace',
                            mono: '"Fira Code", "Consolas", "Monaco", monospace',
                            size: '14px',
                            lineHeight: '1.5',
                        },
                    }}
                    customSetup={{
                        dependencies: getSandpackDependencies(),
                        entry: getSandpackEntry()
                    }}
                    options={{
                        externalResources: getSandpackExternalResources(),
                        bundlerTimeoutSecs: 120,
                        recompileMode: "immediate",
                        recompileDelay: 300,
                        showNavigator: true,
                        showTabs: true,
                        showLineNumbers: true,
                        showInlineErrors: true,
                        wrapContent: true,
                        editorHeight: '80vh',
                        editorWidthPercentage: activeTab === 'code' ? 50 : 0,
                    }}
                >
                    <div className="relative">
                        <SandpackLayout>
                            {activeTab === 'code' ? (
                                <>
                                    <SandpackFileExplorer 
                                        style={{ 
                                            height: '80vh',
                                            background: '#0f172a',
                                            border: '1px solid rgba(34, 211, 238, 0.2)'
                                        }} 
                                    />
                                    <SandpackCodeEditor
                                        style={{ 
                                            height: '80vh',
                                            background: '#0f172a',
                                            border: '1px solid rgba(34, 211, 238, 0.2)'
                                        }}
                                        showTabs
                                        showLineNumbers
                                        showInlineErrors
                                        wrapContent 
                                    />
                                </>
                            ) : (
                                <SandpackPreview
                                    style={{ 
                                        height: '80vh',
                                        background: '#0f172a',
                                        border: '1px solid rgba(34, 211, 238, 0.2)'
                                    }}
                                    showNavigator={true}
                                    showOpenInCodeSandbox={false}
                                    showRefreshButton={true}
                                />
                            )}
                        </SandpackLayout>
                    </div>
                </SandpackProvider>
            </div>

            {/* Enhanced Loading Overlay */}
            {loading && (
                <div className='absolute inset-0 glass-dark rounded-xl flex items-center justify-center z-50'>
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-turquoise-gradient rounded-full flex items-center justify-center animate-pulse-glow">
                                <Loader2Icon className='animate-spin h-10 w-10 text-white' />
                            </div>
                            <div className="absolute inset-0 bg-turquoise-gradient rounded-full blur-xl opacity-30 animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <h2 className='text-2xl font-bold text-cyan-400 neon-text'>
                                Generating {environment.toUpperCase()} files...
                            </h2>
                            <p className="text-gray-400">AI is crafting your perfect code</p>
                            <div className="loading-dots justify-center">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CodeView;