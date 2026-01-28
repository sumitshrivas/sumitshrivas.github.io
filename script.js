// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupContactForm();
    setupSmoothScroll();
});

/* ========================================
   EXPERIENCE DESCRIPTION TOGGLE
   ======================================== */
function toggleDescription(button) {
    const card = button.closest('.experience-card');
    const shortDesc = card.querySelector('.description');
    const fullDesc = card.querySelector('.full-description');
    const icon = button.querySelector('i');
    
    if (fullDesc.style.display === 'none' || fullDesc.style.display === '') {
        // Show full description
        shortDesc.style.display = 'none';
        fullDesc.style.display = 'block';
        button.innerHTML = 'View Less <i class="fas fa-chevron-up"></i>';
        button.classList.add('active');
    } else {
        // Show short description
        shortDesc.style.display = 'block';
        fullDesc.style.display = 'none';
        button.innerHTML = 'View More <i class="fas fa-chevron-down"></i>';
        button.classList.remove('active');
    }
}

/* ========================================
   MOBILE MENU TOGGLE
   ======================================== */
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

/* ========================================
   CONTACT FORM HANDLING
   ======================================== */
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = contactForm.querySelector('input[name="name"]').value;
            const email = contactForm.querySelector('input[name="email"]').value;
            const message = contactForm.querySelector('textarea[name="message"]').value;
            
            // Show success message
            showNotification('Thank you for your message! I will get back to you soon.');
            
            // Reset form
            contactForm.reset();
            
            // In a real implementation, you would send this data to a backend service
            // For example: sendEmail(name, email, message);
        });
    }
}

/* ========================================
   SMOOTH SCROLL (BACKUP)
   ======================================== */
function setupSmoothScroll() {
    // Modern browsers support CSS scroll-behavior: smooth
    // This is a fallback for older browsers
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ========================================
   NOTIFICATION SYSTEM
   ======================================== */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: var(--primary-black);
        color: var(--primary-white);
        padding: 20px 30px;
        border: 3px solid var(--primary-black);
        box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.2);
        z-index: 3000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 90%;
        word-wrap: break-word;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

/* ========================================
   NOTIFICATION ANIMATIONS
   ======================================== */
// Add notification animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .notification {
            top: 80px !important;
            right: 10px !important;
            left: 10px !important;
            max-width: calc(100% - 20px) !important;
        }
    }
`;
document.head.appendChild(style);

/* ========================================
   SCROLL ANIMATIONS (OPTIONAL)
   Add fade-in effect when elements come into view
   ======================================== */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    const cards = document.querySelectorAll('.project-card, .experience-card, .skill-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Optionally enable scroll animations
// Uncomment the line below to enable fade-in animations on scroll
// setupScrollAnimations();
