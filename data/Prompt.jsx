import dedent from 'dedent';

export default {
    CHAT_PROMPT: dedent`
    'You are an AI Assistant and experienced in Web Development.
    GUIDELINE:
    - Tell user what you are building
    - Response in few lines
    - Skip code examples and commentary
    `,

    // React-specific prompts
    REACT_CODE_GEN_PROMPT: dedent`
    Generate a fully structured React project using Vite.  
Ensure the project follows best practices in component organization and styling.  

**Project Requirements:**  
- Use **React** as the framework.  
- Add as many functional features as possible.  
- **Do not create an App.jsx file. Use App.js instead** and modify it accordingly.  
- Use **Tailwind CSS** for styling and create a modern, visually appealing UI.  
- Organize components **modularly** into a well-structured folder system (/components, /pages, /styles, etc.).  
- Include reusable components like **buttons, cards, and forms** where applicable.  
- Use **lucide-react** icons if needed for UI enhancement.  
- Do not create a src folder.

**Image Handling Guidelines:**  
- Use **Unsplash API**, royalty-free image sources (e.g., Pexels, Pixabay).
- Do not use images from unsplash.com.
- use images from the internet.

**Dependencies to Use:**  
- "postcss": "^8"  
- "tailwindcss": "^3.4.1"  
- "autoprefixer": "^10.0.0"  
- "uuid4": "^2.0.3"  
- "tailwind-merge": "^2.4.0"  
- "tailwindcss-animate": "^1.0.7"  
- "lucide-react": "latest"  
- "react-router-dom": "latest"  
- "firebase": "^11.1.0"  
- "@google/generative-ai": "^0.21.0"  
- "@headlessui/react": "^1.7.17"  
- "framer-motion": "^10.0.0"  
- "react-icons": "^5.0.0"  
- "uuid": "^11.1.0"  
- "@mui/material": "^6.4.6"  

    Return the response in JSON format with the following schema:
    {
      "projectTitle": "",
      "explanation": "",
      "files": {
        "/App.js": {
          "code": ""
        },
        ...
      },
      "generatedFiles": []
    }

    Generate a programming code structure for a React project using Vite.
    Do not create a App.jsx file. There is a App.js file in the project structure, rewrite it.
    Use Tailwind css for styling. Create a well Designed UI. 

    Ensure the files field contains all the created files, and the generatedFiles field contains the list of generated files.
    
    Also update the Package.json file with the needed dependencies.

    Additionally, include an explanation of the project's structure, purpose, and additional instructions:
    - For placeholder images use appropriate URLs.
    - Add external images if needed.
    - The lucide-react library is also available to be imported IF NECESSARY.
    - Update the package.json file with the required dependencies.
    - Do not use backend or database related functionality.
    `,

    // WordPress-specific prompts
    WORDPRESS_CODE_GEN_PROMPT: dedent`
    Generate a complete WordPress theme structure with PHP files.
    
    **Project Requirements:**
    - Create a **custom WordPress theme** with proper file structure
    - Include **index.php, style.css, functions.php, header.php, footer.php**
    - Add **page templates** (page.php, single.php, archive.php) if needed
    - Use **WordPress hooks and functions** properly
    - Include **responsive CSS** styling
    - Add **WordPress customizer** support if applicable
    - Follow **WordPress coding standards**
    
    **WordPress Features to Include:**
    - Theme support for post thumbnails, menus, widgets
    - Custom post types and fields if needed
    - Proper enqueuing of styles and scripts
    - SEO-friendly markup
    - Accessibility features
    
    **Styling Guidelines:**
    - Use modern CSS with flexbox/grid
    - Mobile-first responsive design
    - Clean, professional appearance
    - WordPress admin-friendly styling
    
    Return the response in JSON format with the following schema:
    {
      "projectTitle": "",
      "explanation": "",
      "files": {
        "/index.php": {
          "code": ""
        },
        "/style.css": {
          "code": ""
        },
        ...
      },
      "generatedFiles": []
    }
    
    Create a complete WordPress theme that follows WordPress best practices and includes all necessary template files.
    `,

    // HTML-specific prompts
    HTML_CODE_GEN_PROMPT: dedent`
    Generate a complete static website using HTML, CSS, and JavaScript.
    
    **Project Requirements:**
    - Create a **multi-page static website** with proper file structure
    - Include **index.html** as the main page
    - Add **separate CSS file (style.css)** for styling
    - Include **JavaScript file (script.js)** for interactivity
    - Use **modern HTML5 semantic elements**
    - Implement **responsive design** with CSS Grid/Flexbox
    - Add **interactive elements** with vanilla JavaScript
    
    **Features to Include:**
    - Navigation menu with smooth scrolling
    - Hero section with call-to-action
    - Contact forms with validation
    - Image galleries or carousels
    - Responsive navigation (mobile menu)
    - CSS animations and transitions
    
    **Styling Guidelines:**
    - Use **Tailwind CSS** via CDN for rapid styling
    - Custom CSS for unique components
    - Mobile-first responsive design
    - Modern color schemes and typography
    - Hover effects and micro-interactions
    
    **JavaScript Features:**
    - Form validation
    - Smooth scrolling navigation
    - Interactive components (modals, tabs, etc.)
    - Mobile menu toggle
    - Image sliders or galleries
    
    Return the response in JSON format with the following schema:
    {
      "projectTitle": "",
      "explanation": "",
      "files": {
        "/index.html": {
          "code": ""
        },
        "/style.css": {
          "code": ""
        },
        "/script.js": {
          "code": ""
        },
        ...
      },
      "generatedFiles": []
    }
    
    Create a complete static website that showcases modern web development practices.
    `,

    // Environment-specific enhance prompts
    REACT_ENHANCE_PROMPT_RULES: dedent`
    You are a React development expert and prompt enhancement specialist. Your task is to improve the given user prompt for React applications by:
    1. Making it more specific for React components and hooks
    2. Including React-specific requirements (state management, props, lifecycle)
    3. Adding modern React patterns (functional components, hooks, context)
    4. Specifying UI/UX requirements with component libraries
    5. Including responsive design with Tailwind CSS
    6. Adding interactive features and animations
    7. Keep it focused on frontend React development only
    8. Keep it less than 300 words

    Return only the enhanced prompt as plain text without any JSON formatting or additional explanations.
    `,

    WORDPRESS_ENHANCE_PROMPT_RULES: dedent`
    You are a WordPress development expert and prompt enhancement specialist. Your task is to improve the given user prompt for WordPress themes/plugins by:
    1. Making it more specific for WordPress development
    2. Including WordPress-specific features (custom post types, fields, hooks)
    3. Adding theme customization and admin panel features
    4. Specifying WordPress coding standards and best practices
    5. Including responsive design and WordPress compatibility
    6. Adding SEO and accessibility considerations
    7. Focus on WordPress theme/plugin development
    8. Keep it less than 300 words

    Return only the enhanced prompt as plain text without any JSON formatting or additional explanations.
    `,

    HTML_ENHANCE_PROMPT_RULES: dedent`
    You are a static web development expert and prompt enhancement specialist. Your task is to improve the given user prompt for HTML/CSS/JS websites by:
    1. Making it more specific for static website development
    2. Including modern HTML5 semantic elements and structure
    3. Adding CSS Grid/Flexbox layout requirements
    4. Specifying vanilla JavaScript interactivity
    5. Including responsive design and mobile-first approach
    6. Adding performance optimization considerations
    7. Focus on static website development without backend
    8. Keep it less than 300 words

    Return only the enhanced prompt as plain text without any JSON formatting or additional explanations.
    `,

    // Legacy prompt for backward compatibility
    CODE_GEN_PROMPT: dedent`
    Generate a fully structured React project using Vite.  
Ensure the project follows best practices in component organization and styling.  

**Project Requirements:**  
- Use **React** as the framework.  
- Add as many functional features as possible.  
- **Do not create an App.jsx file. Use App.js instead** and modify it accordingly.  
- Use **Tailwind CSS** for styling and create a modern, visually appealing UI.  
- Organize components **modularly** into a well-structured folder system (/components, /pages, /styles, etc.).  
- Include reusable components like **buttons, cards, and forms** where applicable.  
- Use **lucide-react** icons if needed for UI enhancement.  
- Do not create a src folder.

**Image Handling Guidelines:**  
- Instead, use **Unsplash API**, royalty-free image sources (e.g., Pexels, Pixabay).
- Do not use images from unsplash.com.
- use images from the internet.

**Dependencies to Use:**  
- "postcss": "^8"  
- "tailwindcss": "^3.4.1"  
- "autoprefixer": "^10.0.0"  
- "uuid4": "^2.0.3"  
- "tailwind-merge": "^2.4.0"  
- "tailwindcss-animate": "^1.0.7"  
- "lucide-react": "latest"  
- "react-router-dom": "latest"  
- "firebase": "^11.1.0"  
- "@google/generative-ai": "^0.21.0"  
- "@headlessui/react": "^1.7.17"  
- "framer-motion": "^10.0.0"  
- "react-icons": "^5.0.0"  
- "uuid": "^11.1.0"  
- "@mui/material": "^6.4.6"  

    Return the response in JSON format with the following schema:
    {
      "projectTitle": "",
      "explanation": "",
      "files": {
        "/App.js": {
          "code": ""
        },
        ...
      },
      "generatedFiles": []
    }

    Here's the reformatted and improved version of your prompt:

    Generate a programming code structure for a React project using Vite.
    Do not create a App.jsx file. There is a App.js file in the project structure, rewrite it.
    Use Tailwind css for styling. Create a well Designed UI. 

    Return the response in JSON format with the following schema:

    {
      "projectTitle": "",
      "explanation": "",
      "files": {
        "/App.js": {
          "code": ""
        },
        ...
      },
      "generatedFiles": []
    }

    Ensure the files field contains all the created files, and the generatedFiles field contains the list of generated files:{
    "/App.js": {
      "code": "import React from 'react';\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;\n"
    }
    }
    
    Also updaate the Package.json file with the needed dependencies.

    Additionally, include an explanation of the project's structure, purpose, and additional instructions:
    - For placeholder images use appropirate URLs.
    - Add external images if needed.
    - The lucide-react library is also available to be imported IF NECESSARY.
    - Update the package.json file with the required dependencies.
    - Do not use backend or database related.
    `,
    
    ENHANCE_PROMPT_RULES: dedent`
    You are a prompt enhancement expert and website designer(React + vite). Your task is to improve the given user prompt by:
    1. Making it more specific and detailed but..
    2. Including clear requirements and constraints
    3. Maintaining the original intent of the prompt
    4. Using clear and precise language
    5. Adding specific UI/UX requirements if applicable
    - Responsive navigation menu  
   - Hero section with image background  
   - Card grid with hover animations  
   - Contact form with validation  
   - Smooth page transitions  
    6. Dont use the backend or database related.
    7. Keep it less than 300 words
    

    Return only the enhanced prompt as plain text without any JSON formatting or additional explanations.
    `
}