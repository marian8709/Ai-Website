export default {
    ENVIRONMENTS: {
        REACT: {
            id: 'react',
            name: 'React',
            description: 'Modern React applications with components',
            icon: '⚛️',
            template: 'react',
            dependencies: {
                "@google/generative-ai": "^0.21.0",
                "@heroicons/react": "^1.0.6",
                "@headlessui/react": "^1.7.17",
                "autoprefixer": "^10.0.0",
                "firebase": "^11.1.0",
                "framer-motion": "^10.0.0",
                "lucide-react": "latest",
                "postcss": "^8",
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-icons": "^5.0.0",
                "react-router-dom": "latest",
                "react-toastify": "^10.0.0",
                "tailwind-merge": "^2.4.0",
                "tailwindcss": "^3.4.1",
                "tailwindcss-animate": "^1.0.7",
                "uuid4": "^2.0.3",
                "uuidv4": "^6.2.13",
                "uuid": "^11.1.0",
                "@mui/material": "^6.4.6"
            },
            defaultFiles: {
                '/public/index.html': {
                    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
                },
                '/App.css': {
                    code: `@tailwind base;
@tailwind components;
@tailwind utilities;`
                },
                '/tailwind.config.js': {
                    code: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
                }
            }
        },
        WORDPRESS: {
            id: 'wordpress',
            name: 'WordPress',
            description: 'WordPress themes and plugins',
            icon: '📝',
            template: 'vanilla',
            dependencies: {},
            defaultFiles: {
                '/index.php': {
                    code: `<?php
/**
 * Theme Name: Custom WordPress Theme
 * Description: AI Generated WordPress Theme
 * Version: 1.0
 */

get_header(); ?>

<main id="main" class="site-main">
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <h1 class="entry-title"><?php the_title(); ?></h1>
                </header>
                <div class="entry-content">
                    <?php the_content(); ?>
                </div>
            </article>
        <?php endwhile; ?>
    <?php endif; ?>
</main>

<?php get_footer(); ?>`
                },
                '/style.css': {
                    code: `/*
Theme Name: Custom WordPress Theme
Description: AI Generated WordPress Theme
Version: 1.0
*/

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}

.site-header {
    background: #333;
    color: white;
    padding: 1rem 0;
}

.site-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.entry-title {
    color: #333;
    margin-bottom: 1rem;
}

.entry-content {
    margin-top: 1rem;
}`
                },
                '/header.php': {
                    code: `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <header class="site-header">
        <div class="container">
            <h1 class="site-title">
                <a href="<?php echo esc_url(home_url('/')); ?>">
                    <?php bloginfo('name'); ?>
                </a>
            </h1>
            <nav class="main-navigation">
                <?php wp_nav_menu(array('theme_location' => 'primary')); ?>
            </nav>
        </div>
    </header>`
                },
                '/footer.php': {
                    code: `    <footer class="site-footer">
        <div class="container">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</p>
        </div>
    </footer>
    <?php wp_footer(); ?>
</body>
</html>`
                },
                '/functions.php': {
                    code: `<?php
function theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'textdomain'),
    ));
}
add_action('after_setup_theme', 'theme_setup');

function theme_styles() {
    wp_enqueue_style('theme-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'theme_styles');
?>`
                }
            }
        },
        HTML: {
            id: 'html',
            name: 'HTML/CSS/JS',
            description: 'Static websites with HTML, CSS and JavaScript',
            icon: '🌐',
            template: 'vanilla',
            dependencies: {},
            defaultFiles: {
                '/index.html': {
                    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Static Website</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <header>
        <nav class="bg-blue-600 text-white p-4">
            <div class="container mx-auto">
                <h1 class="text-2xl font-bold">My Website</h1>
            </div>
        </nav>
    </header>
    
    <main class="container mx-auto p-4">
        <section class="hero bg-gray-100 p-8 rounded-lg mb-8">
            <h2 class="text-4xl font-bold mb-4">Welcome to My Website</h2>
            <p class="text-lg">This is a static website built with HTML, CSS, and JavaScript.</p>
        </section>
    </main>
    
    <footer class="bg-gray-800 text-white p-4 mt-8">
        <div class="container mx-auto text-center">
            <p>&copy; 2024 My Website. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`
                },
                '/style.css': {
                    code: `/* Custom CSS */
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: background 0.3s ease;
}

.btn:hover {
    background: #0056b3;
}`
                },
                '/script.js': {
                    code: `// JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    // Add smooth scrolling to all links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});`
                }
            }
        }
    }
};