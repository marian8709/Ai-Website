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
import { Loader2Icon, Download } from 'lucide-react';
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
        const PROMPT = JSON.stringify(messages);
        const result = await axios.post('/api/gen-ai-code', {
            prompt: PROMPT,
            environment: environment
        });

        // Preprocess AI-generated files
        const processedAiFiles = preprocessFiles(result.data?.files || {});
        
        // Get environment-specific default files
        const envConfig = EnvironmentConfig.ENVIRONMENTS[environment.toUpperCase()];
        const defaultFiles = envConfig?.defaultFiles || Lookup.DEFAULT_FILE;
        
        const mergedFiles = { ...defaultFiles, ...processedAiFiles };
        setFiles(mergedFiles);

        await UpdateFiles({
            workspaceId: id,
            files: result.data?.files
        });
        setLoading(false);
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
            react: 'bg-blue-500/20 text-blue-400',
            wordpress: 'bg-purple-500/20 text-purple-400',
            html: 'bg-green-500/20 text-green-400'
        };
        
        const envIcons = {
            react: '⚛️',
            wordpress: '📝',
            html: '🌐'
        };

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${envColors[environment] || envColors.react}`}>
                <span>{envIcons[environment] || envIcons.react}</span>
                <span>{environment.toUpperCase()}</span>
            </div>
        );
    };

    const getSandpackTemplate = () => {
        switch (environment) {
            case 'react':
                return 'react';
            case 'html':
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
                return '/preview.html'; // Special preview file for WordPress
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

    // Create a preview HTML file for WordPress
    const getWordPressPreviewFiles = () => {
        if (environment !== 'wordpress') return files;

        const previewFiles = { ...files };
        
        // Create a preview HTML file that shows the WordPress theme structure
        previewFiles['/preview.html'] = {
            code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress Theme Preview</title>
    <style>
        ${files['/style.css']?.code || ''}
    </style>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="preview-notice" style="background: #0073aa; color: white; padding: 10px; text-align: center; font-family: Arial, sans-serif;">
        <strong>WordPress Theme Preview</strong> - This is a static preview of your WordPress theme
    </div>
    
    <!-- Simulate WordPress header -->
    <header id="masthead" class="site-header">
        <div class="container">
            <div class="site-branding">
                <h1 class="site-title">
                    <a href="#" rel="home">Your WordPress Site</a>
                </h1>
                <p class="site-description">Just another WordPress site</p>
            </div>
            <nav id="site-navigation" class="main-navigation">
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Simulate WordPress content -->
    <main id="main" class="site-main">
        <div class="container">
            <article class="post-article">
                <header class="entry-header">
                    <h1 class="entry-title">Welcome to Your WordPress Theme</h1>
                    <div class="entry-meta">
                        <span class="posted-on">January 15, 2024</span>
                        <span class="byline">by Admin</span>
                    </div>
                </header>
                
                <div class="post-thumbnail">
                    <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80" alt="Featured Image" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px;">
                </div>
                
                <div class="entry-content">
                    <p>This is a preview of your WordPress theme. The actual theme will be generated with proper PHP files that can be uploaded to your WordPress installation.</p>
                    <p>Your theme includes:</p>
                    <ul>
                        <li>✅ Responsive design</li>
                        <li>✅ Modern CSS styling</li>
                        <li>✅ WordPress template hierarchy</li>
                        <li>✅ Custom post type support</li>
                        <li>✅ Widget areas</li>
                        <li>✅ Navigation menus</li>
                    </ul>
                    <p>To use this theme, download the files and upload them to your WordPress /wp-content/themes/ directory.</p>
                </div>
                
                <footer class="entry-footer">
                    <div class="categories">
                        <span class="category">WordPress</span>
                        <span class="category">Themes</span>
                        <span class="category">Design</span>
                    </div>
                </footer>
            </article>

            <!-- Sample second post -->
            <article class="post-article">
                <header class="entry-header">
                    <h2 class="entry-title">Another Sample Post</h2>
                    <div class="entry-meta">
                        <span class="posted-on">January 10, 2024</span>
                        <span class="byline">by Editor</span>
                    </div>
                </header>
                
                <div class="entry-content">
                    <p>This is another sample post to show how your WordPress theme handles multiple posts on the homepage.</p>
                    <p>The theme is fully responsive and includes all the necessary WordPress template files.</p>
                </div>
                
                <footer class="entry-footer">
                    <div class="categories">
                        <span class="category">Sample</span>
                        <span class="category">Content</span>
                    </div>
                </footer>
            </article>
        </div>
    </main>

    <!-- Simulate WordPress footer -->
    <footer id="colophon" class="site-footer">
        <div class="container">
            <div class="site-info">
                <p>&copy; 2024 Your WordPress Site. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Add some basic interactivity for the preview
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
        });
    </script>
</body>
</html>`
        };

        return previewFiles;
    };

    return (
        <div className='relative'>
            <div className='bg-[#181818] w-full p-2 border'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center flex-wrap shrink-0 bg-black p-1 justify-center
                        w-[140px] gap-3 rounded-full'>
                            <h2 onClick={() => setActiveTab('code')}
                                className={`text-sm cursor-pointer 
                            ${activeTab == 'code' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'}`}>
                                Code</h2>

                            <h2 onClick={() => setActiveTab('preview')}
                                className={`text-sm cursor-pointer 
                            ${activeTab == 'preview' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'}`}>
                                Preview</h2>
                        </div>
                        {getEnvironmentBadge()}
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={downloadFiles}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download Files</span>
                    </button>
                </div>
            </div>
            <SandpackProvider
                files={environment === 'wordpress' ? getWordPressPreviewFiles() : files}
                template={getSandpackTemplate()}
                theme={'dark'}
                customSetup={{
                    dependencies: getSandpackDependencies(),
                    entry: getSandpackEntry()
                }}
                options={{
                    externalResources: getSandpackExternalResources(),
                    bundlerTimeoutSecs: 120,
                    recompileMode: "immediate",
                    recompileDelay: 300
                }}
            >
                <div className="relative">
                    <SandpackLayout>
                        {activeTab == 'code' ? <>
                            <SandpackFileExplorer style={{ height: '80vh' }} />
                            <SandpackCodeEditor
                                style={{ height: '80vh' }}
                                showTabs
                                showLineNumbers
                                showInlineErrors
                                wrapContent />
                        </> :
                            <>
                                <SandpackPreview
                                    style={{ height: '80vh' }}
                                    showNavigator={environment !== 'wordpress'}
                                    showOpenInCodeSandbox={false}
                                    showRefreshButton={true}
                                />
                            </>}
                    </SandpackLayout>
                </div>
            </SandpackProvider>

            {loading && <div className='p-10 bg-gray-900 opacity-80 absolute top-0 
            rounded-lg w-full h-full flex items-center justify-center'>
                <Loader2Icon className='animate-spin h-10 w-10 text-white' />
                <h2 className='text-white'> Generating {environment.toUpperCase()} files...</h2>
            </div>}
        </div>
    );
}

export default CodeView;