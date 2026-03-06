// Language Management
let currentLang = localStorage.getItem('lang') || 'fr';

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.getElementById('langText').textContent = lang === 'fr' ? 'EN' : 'FR';
    
    document.querySelectorAll('[data-en][data-fr]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        }
    });
    
    document.querySelectorAll('[data-en-placeholder][data-fr-placeholder]').forEach(el => {
        el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });
}

document.getElementById('langToggle').addEventListener('click', () => {
    updateLanguage(currentLang === 'fr' ? 'en' : 'fr');
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
});

// Fetch GitHub Projects with timeout
async function fetchGitHubProjects() {
    const username = 'regraisamia';
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Set timeout of 5 seconds
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    try {
        const fetchPromise = fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const response = await Promise.race([fetchPromise, timeout]);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const repos = await response.json();
        
        const filteredRepos = repos.filter(repo => {
            const name = repo.name.toLowerCase();
            return name !== 'regraisamia' && name !== 'regrai-samia' && name !== 'e-commerce' && name !== 'personal-portfolio';
        });
        
        if (filteredRepos.length === 0) {
            projectsGrid.innerHTML = `<p style="text-align: center; padding: 2rem;">${currentLang === 'fr' ? 'Aucun projet disponible' : 'No projects available'}</p>`;
            return;
        }
        
        // Display projects immediately without waiting for READMEs
        displayProjects(filteredRepos.slice(0, 10));
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectsGrid.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--text-color);">${currentLang === 'fr' ? 'Impossible de charger les projets. Visitez ' : 'Unable to load projects. Visit '}<a href="https://github.com/regraisamia" target="_blank" style="color: var(--primary-color);">GitHub</a></p>`;
    }
}

function extractDescription(readmeContent) {
    // Remove markdown headers
    let text = readmeContent.replace(/^#+\s+.+$/gm, '');
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    // Remove inline code
    text = text.replace(/`[^`]+`/g, '');
    // Remove links
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove images
    text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
    // Get first meaningful paragraph
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    if (paragraphs.length > 0) {
        let desc = paragraphs[0].trim().replace(/\n/g, ' ');
        if (desc.length > 150) {
            desc = desc.substring(0, 150) + '...';
        }
        return desc;
    }
    return null;
}

function displayProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    projectsGrid.innerHTML = projects.map(repo => {
        const description = repo.description || (currentLang === 'fr' ? 'Projet GitHub' : 'GitHub Project');
        const languageIcon = getLanguageIcon(repo.language);
        const repoUrl = repo.html_url || `https://github.com/regraisamia/${repo.name}`;
        
        return `
            <div class="project-card">
                <div class="project-icon">
                    <i class="${languageIcon}"></i>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${repo.name}</h3>
                    <p class="project-description">${description}</p>
                    <div class="project-tags">
                        ${repo.language ? `<span class="project-tag">${repo.language}</span>` : ''}
                        ${repo.topics ? repo.topics.slice(0, 3).map(topic => 
                            `<span class="project-tag">${topic}</span>`
                        ).join('') : ''}
                    </div>
                    <div class="project-links">
                        <a href="${repoUrl}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i> <span data-en="View Code" data-fr="Voir Code">Voir Code</span>
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="project-link">
                                <i class="fas fa-external-link-alt"></i> <span data-en="Live Demo" data-fr="Démo">Démo</span>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateLanguage(currentLang);
}

function getLanguageIcon(language) {
    const icons = {
        'Python': 'fab fa-python',
        'JavaScript': 'fab fa-js',
        'TypeScript': 'fab fa-js',
        'Java': 'fab fa-java',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'PHP': 'fab fa-php',
        'Ruby': 'fab fa-gem',
        'Go': 'fab fa-golang',
        'Rust': 'fab fa-rust',
        'C': 'fas fa-code',
        'C++': 'fas fa-code',
        'C#': 'fas fa-code',
        'Shell': 'fas fa-terminal',
        'Jupyter Notebook': 'fas fa-book'
    };
    return icons[language] || 'fas fa-code';
}

// Contact Form
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = currentLang === 'fr' 
        ? 'Merci pour votre message ! Je vous répondrai bientôt.' 
        : 'Thank you for your message! I will get back to you soon.';
    
    alert(message);
    contactForm.reset();
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-category, .timeline-item, .project-card').forEach(el => {
    observer.observe(el);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLang);
    fetchGitHubProjects();
    animateStats();
});

// Animate Stats Counter
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target + '+';
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 30);
    });
}

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercentage + '%';
});
