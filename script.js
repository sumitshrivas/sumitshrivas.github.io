/* ========================================
   GLOBAL VARIABLES & INITIALIZATION
   ======================================== */

// Store currently selected project ID for edit/delete operations
let currentProjectId = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadProjects();
    loadExperiences();
    setupEventListeners();
    handleURLParameters();
});

/* ========================================
   INITIALIZATION
   ======================================== */

// Initialize default projects if localStorage is empty
function initializeApp() {
    if (!localStorage.getItem('projects')) {
        const defaultProjects = [
            {
                id: Date.now() + 1,
                title: 'Sales Data Analysis',
                description: 'Analyzed sales trends using Python and Pandas. Created visualizations to identify key revenue drivers and seasonal patterns. Implemented predictive models to forecast future sales.'
            },
            {
                id: Date.now() + 2,
                title: 'Customer Segmentation',
                description: 'Performed customer segmentation using SQL queries and Python clustering algorithms. Identified distinct customer groups and their purchasing behaviors to optimize marketing strategies.'
            },
            {
                id: Date.now() + 3,
                title: 'Dashboard Development',
                description: 'Built interactive dashboards using Matplotlib and SQL. Created real-time reporting tools for business metrics, enabling data-driven decision making across departments.'
            }
        ];
        localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }
    
    // Initialize default experiences if localStorage is empty
    if (!localStorage.getItem('experiences')) {
        const defaultExperiences = [
            {
                id: Date.now() + 1,
                company: 'Tech Solutions Inc.',
                role: 'Data Analyst Intern',
                duration: 'Jan 2023 – Aug 2023',
                description: 'Assisted in analyzing customer data using SQL and Python. Created reports and dashboards to track key performance indicators. Collaborated with senior analysts on data cleaning and preprocessing tasks.'
            }
        ];
        localStorage.setItem('experiences', JSON.stringify(defaultExperiences));
    }
}

/* ========================================
   EVENT LISTENERS
   ======================================== */

function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }

    // Modal close button
    const modal = document.getElementById('projectModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        
        // Close experience modal when clicking outside
        const expModal = document.getElementById('experienceModal');
        if (e.target === expModal) {
            expModal.style.display = 'none';
        }
    });
}

/* ========================================
   PROJECT MANAGEMENT - CRUD OPERATIONS
   ======================================== */

// Load and display all projects from localStorage
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    const projects = getProjects();
    projectsGrid.innerHTML = '';

    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-folder-open" style="font-size: 64px; color: var(--gray-light); margin-bottom: 20px;"></i>
                <p style="font-size: 20px; color: var(--gray-medium);">No projects yet. Click "Add Project" to get started!</p>
            </div>
        `;
        return;
    }

    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

// Create a project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(truncateText(project.description, 100))}</p>
        <div class="button-group">
            <button class="read-more-btn" onclick="openProjectModal(${project.id})">
                Read More <i class="fas fa-arrow-right"></i>
            </button>
            <a href="https://github.com/your-username" target="_blank" class="github-btn">
                <i class="fab fa-github"></i> View on GitHub
            </a>
        </div>
    `;
    return card;
}

// Get all projects from localStorage
function getProjects() {
    const projects = localStorage.getItem('projects');
    return projects ? JSON.parse(projects) : [];
}

// Save projects to localStorage
function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Get a single project by ID
function getProjectById(id) {
    const projects = getProjects();
    return projects.find(project => project.id === parseInt(id));
}

/* ========================================
   MODAL OPERATIONS
   ======================================== */

// Open modal to view project details
function openProjectModal(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    currentProjectId = projectId;

    const modal = document.getElementById('projectModal');
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    
    modal.style.display = 'block';
}

/* ========================================
   AUTHENTICATION & REDIRECTION
   ======================================== */

// Redirect to login page for CRUD operations
function redirectToLogin(action, projectId = null) {
    let url = `login.html?action=${action}`;
    if (projectId) {
        url += `&id=${projectId}`;
    }
    window.location.href = url;
}

// Check if user is authenticated
function checkAuthentication() {
    const session = sessionStorage.getItem('adminSession');
    if (!session) return false;

    const sessionData = JSON.parse(session);
    const currentTime = Date.now();
    const sessionDuration = 30 * 60 * 1000; // 30 minutes

    // Check if session has expired
    if (currentTime - sessionData.timestamp > sessionDuration) {
        sessionStorage.removeItem('adminSession');
        return false;
    }

    return sessionData.loggedIn;
}

// Handle URL parameters for authenticated actions
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle Project actions
    if (urlParams.has('openAddModal') && checkAuthentication()) {
        openAddProjectModal();
        clearSessionAndURL();
    } else if (urlParams.has('openEditModal') && urlParams.has('id') && checkAuthentication()) {
        const projectId = urlParams.get('id');
        openEditProjectModal(projectId);
        clearSessionAndURL();
    } else if (urlParams.has('openDeleteModal') && urlParams.has('id') && checkAuthentication()) {
        const projectId = urlParams.get('id');
        confirmDeleteProject(projectId);
        clearSessionAndURL();
    }
    // Handle Experience actions
    else if (urlParams.has('openAddExpModal') && checkAuthentication()) {
        openAddExperienceModal();
        clearSessionAndURL();
    } else if (urlParams.has('openEditExpModal') && urlParams.has('id') && checkAuthentication()) {
        const experienceId = urlParams.get('id');
        openEditExperienceModal(experienceId);
        clearSessionAndURL();
    } else if (urlParams.has('openDeleteExpModal') && urlParams.has('id') && checkAuthentication()) {
        const experienceId = urlParams.get('id');
        confirmDeleteExperience(experienceId);
        clearSessionAndURL();
    }
}

// Clear session and URL parameters
function clearSessionAndURL() {
    sessionStorage.removeItem('adminSession');
    window.history.replaceState({}, document.title, window.location.pathname);
}

/* ========================================
   ADD PROJECT
   ======================================== */

function openAddProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalContent = document.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Add New Project</h2>
        <form id="addProjectForm" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group">
                <label for="projectTitle">
                    <i class="fas fa-heading"></i> Project Title
                </label>
                <input type="text" id="projectTitle" placeholder="Enter project title" required 
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="projectDescription">
                    <i class="fas fa-align-left"></i> Project Description
                </label>
                <textarea id="projectDescription" rows="6" placeholder="Enter project description" required
                          style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px; font-family: 'Inter', sans-serif;"></textarea>
            </div>
            <div style="display: flex; gap: 15px;">
                <button type="submit" class="edit-btn" style="flex: 1;">
                    <i class="fas fa-save"></i> Save Project
                </button>
                <button type="button" class="delete-btn" onclick="closeModal()" style="flex: 1;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Handle form submission
    document.getElementById('addProjectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        
        if (title && description) {
            addProject(title, description);
            closeModal();
        }
    });
}

function addProject(title, description) {
    const projects = getProjects();
    const newProject = {
        id: Date.now(),
        title: title,
        description: description
    };
    
    projects.push(newProject);
    saveProjects(projects);
    loadProjects();
    
    showNotification('Project added successfully!');
}

/* ========================================
   EDIT PROJECT
   ======================================== */

function editProjectFromModal() {
    if (!currentProjectId) return;
    redirectToLogin('edit', currentProjectId);
}

function openEditProjectModal(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const modalContent = document.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Edit Project</h2>
        <form id="editProjectForm" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group">
                <label for="editProjectTitle">
                    <i class="fas fa-heading"></i> Project Title
                </label>
                <input type="text" id="editProjectTitle" value="${escapeHtml(project.title)}" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="editProjectDescription">
                    <i class="fas fa-align-left"></i> Project Description
                </label>
                <textarea id="editProjectDescription" rows="6" required
                          style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px; font-family: 'Inter', sans-serif;">${escapeHtml(project.description)}</textarea>
            </div>
            <div style="display: flex; gap: 15px;">
                <button type="submit" class="edit-btn" style="flex: 1;">
                    <i class="fas fa-save"></i> Update Project
                </button>
                <button type="button" class="delete-btn" onclick="closeModal()" style="flex: 1;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Handle form submission
    document.getElementById('editProjectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('editProjectTitle').value.trim();
        const description = document.getElementById('editProjectDescription').value.trim();
        
        if (title && description) {
            updateProject(projectId, title, description);
            closeModal();
        }
    });
}

function updateProject(projectId, title, description) {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === parseInt(projectId));
    
    if (projectIndex !== -1) {
        projects[projectIndex].title = title;
        projects[projectIndex].description = description;
        saveProjects(projects);
        loadProjects();
        
        showNotification('Project updated successfully!');
    }
}

/* ========================================
   DELETE PROJECT
   ======================================== */

function deleteProjectFromModal() {
    if (!currentProjectId) return;
    redirectToLogin('delete', currentProjectId);
}

function confirmDeleteProject(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const modalContent = document.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Delete Project</h2>
        <p style="font-size: 18px; margin-bottom: 20px;">
            Are you sure you want to delete "<strong>${escapeHtml(project.title)}</strong>"?
        </p>
        <p style="color: var(--gray-medium); margin-bottom: 30px;">
            This action cannot be undone.
        </p>
        <div style="display: flex; gap: 15px;">
            <button class="delete-btn" onclick="deleteProject(${projectId})" style="flex: 1; background-color: var(--primary-black); color: var(--primary-white);">
                <i class="fas fa-trash"></i> Yes, Delete
            </button>
            <button class="edit-btn" onclick="closeModal()" style="flex: 1; background-color: var(--primary-white); color: var(--primary-black); border: 2px solid var(--primary-black);">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function deleteProject(projectId) {
    const projects = getProjects();
    const filteredProjects = projects.filter(p => p.id !== parseInt(projectId));
    
    saveProjects(filteredProjects);
    loadProjects();
    closeModal();
    
    showNotification('Project deleted successfully!');
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Close modal
function closeModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    currentProjectId = null;
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification (simple alert for now, can be enhanced with toast)
function showNotification(message) {
    // Create a custom notification element
    const notification = document.createElement('div');
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
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
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
`;
document.head.appendChild(style);

/* ========================================
   WORK EXPERIENCE MANAGEMENT - CRUD OPERATIONS
   ======================================== */

// Store currently selected experience ID for edit/delete operations
let currentExperienceId = null;

// Load and display all experiences from localStorage
function loadExperiences() {
    const experienceGrid = document.getElementById('experienceGrid');
    if (!experienceGrid) return;

    const experiences = getExperiences();
    experienceGrid.innerHTML = '';

    if (experiences.length === 0) {
        experienceGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-briefcase" style="font-size: 64px; color: var(--gray-light); margin-bottom: 20px;"></i>
                <p style="font-size: 20px; color: var(--gray-medium);">No work experience yet. Click "Add Experience" to get started!</p>
            </div>
        `;
        return;
    }

    experiences.forEach(experience => {
        const experienceCard = createExperienceCard(experience);
        experienceGrid.appendChild(experienceCard);
    });
}

// Create an experience card element
function createExperienceCard(experience) {
    const card = document.createElement('div');
    card.className = 'experience-card';
    card.innerHTML = `
        <h3>${escapeHtml(experience.company)}</h3>
        <h4>${escapeHtml(experience.role)}</h4>
        <div class="duration">${escapeHtml(experience.duration)}</div>
        <p>${escapeHtml(truncateText(experience.description, 100))}</p>
        <button class="view-details-btn" onclick="openExperienceModal(${experience.id})">
            View Details <i class="fas fa-arrow-right"></i>
        </button>
    `;
    return card;
}

// Get all experiences from localStorage
function getExperiences() {
    const experiences = localStorage.getItem('experiences');
    return experiences ? JSON.parse(experiences) : [];
}

// Save experiences to localStorage
function saveExperiences(experiences) {
    localStorage.setItem('experiences', JSON.stringify(experiences));
}

// Get a single experience by ID
function getExperienceById(id) {
    const experiences = getExperiences();
    return experiences.find(experience => experience.id === parseInt(id));
}

// Open modal to view experience details
function openExperienceModal(experienceId) {
    const experience = getExperienceById(experienceId);
    if (!experience) return;

    currentExperienceId = experienceId;

    const modal = document.getElementById('experienceModal');
    document.getElementById('expModalCompany').textContent = experience.company;
    document.getElementById('expModalRole').textContent = experience.role;
    document.getElementById('expModalDuration').textContent = experience.duration;
    document.getElementById('expModalDescription').textContent = experience.description;
    
    modal.style.display = 'block';
}

// Close experience modal
function closeExperienceModal() {
    const modal = document.getElementById('experienceModal');
    modal.style.display = 'none';
    currentExperienceId = null;
}

// Handle URL parameters for experience authenticated actions
function handleExperienceURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('openAddExpModal') && checkAuthentication()) {
        openAddExperienceModal();
        clearSessionAndURL();
    } else if (urlParams.has('openEditExpModal') && urlParams.has('id') && checkAuthentication()) {
        const experienceId = urlParams.get('id');
        openEditExperienceModal(experienceId);
        clearSessionAndURL();
    } else if (urlParams.has('openDeleteExpModal') && urlParams.has('id') && checkAuthentication()) {
        const experienceId = urlParams.get('id');
        confirmDeleteExperience(experienceId);
        clearSessionAndURL();
    }
}

/* ========================================
   ADD EXPERIENCE
   ======================================== */

function openAddExperienceModal() {
    const modal = document.getElementById('experienceModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeExperienceModal()">&times;</span>
        <h2>Add New Experience</h2>
        <form id="addExperienceForm" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group">
                <label for="expCompany">
                    <i class="fas fa-building"></i> Company Name
                </label>
                <input type="text" id="expCompany" placeholder="Enter company name" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="expRole">
                    <i class="fas fa-user-tie"></i> Role
                </label>
                <input type="text" id="expRole" placeholder="Enter your role" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="expDuration">
                    <i class="fas fa-calendar-alt"></i> Duration
                </label>
                <input type="text" id="expDuration" placeholder="e.g., Jan 2023 – Aug 2023" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="expDescription">
                    <i class="fas fa-align-left"></i> Description
                </label>
                <textarea id="expDescription" rows="6" placeholder="Describe your responsibilities and achievements" required
                          style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px; font-family: 'Inter', sans-serif;"></textarea>
            </div>
            <div style="display: flex; gap: 15px;">
                <button type="submit" class="edit-btn" style="flex: 1;">
                    <i class="fas fa-plus"></i> Add Experience
                </button>
                <button type="button" class="delete-btn" onclick="closeExperienceModal()" style="flex: 1;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Handle form submission
    document.getElementById('addExperienceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const company = document.getElementById('expCompany').value.trim();
        const role = document.getElementById('expRole').value.trim();
        const duration = document.getElementById('expDuration').value.trim();
        const description = document.getElementById('expDescription').value.trim();
        
        if (company && role && duration && description) {
            addExperience(company, role, duration, description);
            closeExperienceModal();
        }
    });
}

function addExperience(company, role, duration, description) {
    const experiences = getExperiences();
    const newExperience = {
        id: Date.now(),
        company: company,
        role: role,
        duration: duration,
        description: description
    };
    
    experiences.push(newExperience);
    saveExperiences(experiences);
    loadExperiences();
    
    showNotification('Experience added successfully!');
}

/* ========================================
   EDIT EXPERIENCE
   ======================================== */

function editExperienceFromModal() {
    if (!currentExperienceId) return;
    redirectToLogin('editExperience', currentExperienceId);
}

function openEditExperienceModal(experienceId) {
    const experience = getExperienceById(experienceId);
    if (!experience) return;

    const modal = document.getElementById('experienceModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeExperienceModal()">&times;</span>
        <h2>Edit Experience</h2>
        <form id="editExperienceForm" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group">
                <label for="editExpCompany">
                    <i class="fas fa-building"></i> Company Name
                </label>
                <input type="text" id="editExpCompany" value="${escapeHtml(experience.company)}" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="editExpRole">
                    <i class="fas fa-user-tie"></i> Role
                </label>
                <input type="text" id="editExpRole" value="${escapeHtml(experience.role)}" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="editExpDuration">
                    <i class="fas fa-calendar-alt"></i> Duration
                </label>
                <input type="text" id="editExpDuration" value="${escapeHtml(experience.duration)}" required
                       style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px;">
            </div>
            <div class="form-group">
                <label for="editExpDescription">
                    <i class="fas fa-align-left"></i> Description
                </label>
                <textarea id="editExpDescription" rows="6" required
                          style="padding: 15px; border: 3px solid var(--primary-black); font-size: 16px; font-family: 'Inter', sans-serif;">${escapeHtml(experience.description)}</textarea>
            </div>
            <div style="display: flex; gap: 15px;">
                <button type="submit" class="edit-btn" style="flex: 1;">
                    <i class="fas fa-save"></i> Update Experience
                </button>
                <button type="button" class="delete-btn" onclick="closeExperienceModal()" style="flex: 1;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Handle form submission
    document.getElementById('editExperienceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const company = document.getElementById('editExpCompany').value.trim();
        const role = document.getElementById('editExpRole').value.trim();
        const duration = document.getElementById('editExpDuration').value.trim();
        const description = document.getElementById('editExpDescription').value.trim();
        
        if (company && role && duration && description) {
            updateExperience(experienceId, company, role, duration, description);
            closeExperienceModal();
        }
    });
}

function updateExperience(experienceId, company, role, duration, description) {
    const experiences = getExperiences();
    const experienceIndex = experiences.findIndex(e => e.id === parseInt(experienceId));
    
    if (experienceIndex !== -1) {
        experiences[experienceIndex].company = company;
        experiences[experienceIndex].role = role;
        experiences[experienceIndex].duration = duration;
        experiences[experienceIndex].description = description;
        saveExperiences(experiences);
        loadExperiences();
        
        showNotification('Experience updated successfully!');
    }
}

/* ========================================
   DELETE EXPERIENCE
   ======================================== */

function deleteExperienceFromModal() {
    if (!currentExperienceId) return;
    redirectToLogin('deleteExperience', currentExperienceId);
}

function confirmDeleteExperience(experienceId) {
    const experience = getExperienceById(experienceId);
    if (!experience) return;

    const modal = document.getElementById('experienceModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeExperienceModal()">&times;</span>
        <h2>Delete Experience</h2>
        <p style="font-size: 18px; margin-bottom: 20px;">
            Are you sure you want to delete "<strong>${escapeHtml(experience.company)}</strong> - ${escapeHtml(experience.role)}"?
        </p>
        <p style="color: var(--gray-medium); margin-bottom: 30px;">
            This action cannot be undone.
        </p>
        <div style="display: flex; gap: 15px;">
            <button class="delete-btn" onclick="deleteExperience(${experienceId})" style="flex: 1; background-color: var(--primary-black); color: var(--primary-white);">
                <i class="fas fa-trash"></i> Yes, Delete
            </button>
            <button class="edit-btn" onclick="closeExperienceModal()" style="flex: 1; background-color: var(--primary-white); color: var(--primary-black); border: 2px solid var(--primary-black);">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function deleteExperience(experienceId) {
    const experiences = getExperiences();
    const filteredExperiences = experiences.filter(e => e.id !== parseInt(experienceId));
    
    saveExperiences(filteredExperiences);
    loadExperiences();
    closeExperienceModal();
    
    showNotification('Experience deleted successfully!');
}