/**
 * Job Listings Application - Starter Code
 * 
 * This is a starter template for building a complete job listings management application.
 * You need to implement the functionality for each function marked with TODO.
 * 
 * Features to implement:
 * - Load and display job listings from data.json
 * - Search and filter functionality
 * - Tab navigation (Profile, Favorites, Manage)
 * - CRUD operations for job management
 * - Favorites system with localStorage
 * - Form validation
 * - Modal dialogs
 * - User profile management
 */

document.addEventListener('DOMContentLoaded', () => {

      
    /** @type {Array} All job listings loaded from data.json */
    let allJobs = [];
    
    /** @type {Array} Currently active manual filters */
    let manualFilters = [];
    
    /** @type {Object} User profile data */
    let userProfile = { name: '', position: '', skills: [] };
    
    /** @type {Array} Array of favorite job IDs */
    let favoriteJobIds = [];
    
    // LocalStorage keys
    const PROFILE_STORAGE_KEY = 'jobAppUserProfile';
    const FAVORITES_STORAGE_KEY = 'jobAppFavorites';
    const ALL_JOBS_KEY = 'jobAppAllJobs';

    // DOM Elements - Main containers
    const jobListingsContainer = document.getElementById('job-listings-container');
    const filterTagsContainer = document.getElementById('filter-tags-container');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const searchInput = document.getElementById('search-input');
    const statsCounter = document.getElementById('stats-counter');
    const filterBar = document.getElementById('filter-bar');

    // DOM Elements - Profile
    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name');
    const profilePositionInput = document.getElementById('profile-position');
    const skillInput = document.getElementById('skill-input');
    const profileSkillsList = document.getElementById('profile-skills-list');
    
    // DOM Elements - Tabs
    const tabsNav = document.querySelector('.tabs-nav');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // DOM Elements - Favorites
    const favoriteJobsContainer = document.getElementById('favorite-jobs-container');
    const favoritesCount = document.getElementById('favorites-count');

    // DOM Elements - Job Management
    const manageJobsList = document.getElementById('manage-jobs-list');
    const addNewJobBtn = document.getElementById('add-new-job-btn');

    // DOM Elements - View Modal
    const viewModal = document.getElementById('job-modal');
    const viewModalCloseBtn = document.getElementById('modal-close-btn-view');

    // DOM Elements - Manage Modal
    const manageModal = document.getElementById('manage-job-modal');
    const manageModalCloseBtn = document.getElementById('modal-close-btn-manage');
    const manageModalTitle = document.getElementById('manage-modal-title');
    const manageJobForm = document.getElementById('manage-job-form');
    
    // DOM Elements - Manage Form Fields
    const jobIdInput = document.getElementById('job-id-input');
    const jobCompanyInput = document.getElementById('job-company');
    const jobPositionInput = document.getElementById('job-position');
    const jobLogoInput = document.getElementById('job-logo');
    const jobContractInput = document.getElementById('job-contract');
    const jobLocationInput = document.getElementById('job-location');
    const jobRoleInput = document.getElementById('job-role');
    const jobLevelInput = document.getElementById('job-level');
    const jobSkillsInput = document.getElementById('job-skills');
    const jobDescriptionInput = document.getElementById('job-description');

    // ------------------------------------
    // --- DATA MANAGEMENT ---
    // ------------------------------------

    /**
     * Loads job listings from data.json file
     * If localStorage has saved jobs, use those instead for persistence
     * @async
     * @function loadAllJobs
     * @returns {Promise<void>}
     */
    const loadAllJobs = async () => {
    try {
        // 1. Check if jobs exist in localStorage
        const storedJobs = localStorage.getItem("allJobs");
        if (storedJobs) {
            allJobs = JSON.parse(storedJobs);
            console.log("Loaded jobs from localStorage");
        } else {
            // 2. Fetch from data.json
            const response = await fetch('./assets/data/data.json');
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            allJobs = await response.json();
            console.log("Loaded jobs from data.json");

            // 3. Save to localStorage for persistence
            localStorage.setItem("allJobs", JSON.stringify(allJobs));
        }

        // 4. Render jobs to the page
        renderJobs(allJobs);

    } catch (error) {
        // 5. Handle errors
        console.error("Error loading jobs:", error);
        jobListingsContainer.innerHTML = '<p class="job-listings__empty">Error loading job data.</p>';
    }
};


    /**
     * Saves all jobs to localStorage
     * @function saveAllJobs
     */
const saveAllJobs = () => {
    try {
        localStorage.setItem("allJobs", JSON.stringify(allJobs));
        console.log("Jobs saved to localStorage");
    } catch (error) {
        console.error("Error saving jobs to localStorage:", error);
    }
};
    // ------------------------------------
    // --- FORM VALIDATION ---
    // ------------------------------------

     /**
     * Shows error message for a form field
     * @function showError
     * @param {HTMLElement} input - The input element
     * @param {string} message - Error message to display
     */
    const showError = (input, message) => {
        if (!input) return;
        input.classList.add('input--error');
        let err = input.parentElement && input.parentElement.querySelector('.error-message');
        if (!err) {
            err = document.createElement('div');
            err.className = 'error-message';
            input.parentElement.appendChild(err);
        }
        err.textContent = message || 'Invalid';
    };

     /**
     * Clears all errors from a form
     * @function clearErrors
     * @param {HTMLElement} form - The form element
     */

    const clearErrors = (form) => {
        if (!form) return;
        form.querySelectorAll('.input--error').forEach(el => el.classList.remove('input--error'));
        form.querySelectorAll('.error-message').forEach(el => el.remove());
    };

    /**
     * Validates the profile form
     * @function validateProfileForm
     * @returns {boolean} 
     */
    const validateProfileForm = () => {
        clearErrors(profileForm);
        let valid = true;
        const name = profileNameInput?.value?.trim();
        if (!name) {
            showError(profileNameInput, 'Name is required');
            valid = false;
        }
       
        return valid;
    };

     /**
     * Validates the job management form
     * @function validateJobForm
     * @returns {boolean} True if valid, false otherwise
     */

    const validateJobForm = () => {
        clearErrors(manageJobForm);
        let valid = true;
        if (!jobCompanyInput.value.trim()) {
            showError(jobCompanyInput, 'Company is required');
            valid = false;
        }
        if (!jobPositionInput.value.trim()) {
            showError(jobPositionInput, 'Position is required');
            valid = false;
        }
      
        const logo = jobLogoInput.value.trim();
        if (logo) {
            try {
                new URL(logo);
            } catch (err) {
                showError(jobLogoInput, 'Logo must be a valid URL');
                valid = false;
            }
        }
        return valid;
    };

    // ------------------------------------
    // --- PROFILE MANAGEMENT ---
    // ------------------------------------

    /**
     * Saves user profile to localStorage
     * @function saveProfile
     */
    const saveProfile = () => {
        try {
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
        } catch (err) {
            console.error("Error saving profile:", err);
        }
    };

    /**
     * Loads user profile from localStorage
     * @function loadProfile
     */
    const loadProfile = () => {
        try {
            const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
            if (stored) {
                userProfile = JSON.parse(stored);
            } else {
                userProfile = { name: '', position: '', skills: [] };
            }
        } catch (err) {
            console.error("Error loading profile:", err);
            userProfile = { name: '', position: '', skills: [] };
        }
    };

    /**
     * Renders profile skills list
     * @function renderProfileSkills
     */

    const renderProfileSkills = () => {
        if (!profileSkillsList) return;
        profileSkillsList.innerHTML = '';
        (userProfile.skills || []).forEach(skill => {
            const li = document.createElement('li');
            li.className = 'profile-skill-tag';
            li.dataset.skill = skill;
            li.innerHTML = `<span>${skill}</span><button class="profile-skill-remove" aria-label="Remove skill ${skill}">✕</button>`;
            profileSkillsList.appendChild(li);
        });
    };

    /**
     * Renders profile form with saved data
     * @function renderProfileForm
     */

    const renderProfileForm = () => {
        if (!profileForm) return;
        profileNameInput.value = userProfile.name || '';
        profilePositionInput.value = userProfile.position || '';
        renderProfileSkills();
    };

    /**
     * Handles profile form submission
     * @function handleProfileSave
     * @param {Event} e - Form submit event
     */

    const handleProfileSave = (e) => {
        e?.preventDefault();
        if (!validateProfileForm()) return;
        userProfile.name = profileNameInput.value.trim();
        userProfile.position = profilePositionInput.value.trim();
       
        saveProfile();
        renderProfileForm();
        applyAllFilters();
    };

    /**
     * Handles adding new skills
     * @function handleSkillAdd
     * @param {KeyboardEvent} e - Keydown event
     */

    const handleSkillAdd = (e) => {
        if (!skillInput) return;
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const val = skillInput.value.trim();
        if (!val) return;
        if (!userProfile.skills.includes(val)) {
            userProfile.skills.push(val);
            saveProfile();
            renderProfileSkills();
            applyAllFilters();
        }
        skillInput.value = '';
    };

     /**
     * Handles removing skills
     * @function handleSkillRemove
     * @param {Event} e - Click event
     */
    const handleSkillRemove = (e) => {
        const btn = e.target.closest('.profile-skill-remove');
        if (!btn) return;
        const li = btn.closest('.profile-skill-tag');
        if (!li) return;
        const skill = li.dataset.skill;
        userProfile.skills = (userProfile.skills || []).filter(s => s !== skill);
        saveProfile();
        renderProfileSkills();
        applyAllFilters();
    };

    // ------------------------------------
    // --- FAVORITES MANAGEMENT ---
    // ------------------------------------

    /**
     * Saves favorites to localStorage
     * @function saveFavorites
     */
    const saveFavorites = () => {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteJobIds));
        } catch (err) {
            console.error("Error saving favorites:", err);
        }
    };
     /**
     * Loads favorites from localStorage
     * @function loadFavorites
     */

    const loadFavorites = () => {
        try {
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
            favoriteJobIds = stored ? JSON.parse(stored) : [];
        } catch (err) {
            console.error("Error loading favorites:", err);
            favoriteJobIds = [];
        }
    };

    
    /**
     * Updates favorites count display
     * @function renderFavoritesCount
     */

    const renderFavoritesCount = () => {
        if (!favoritesCount) return;
        favoritesCount.textContent = String(favoriteJobIds.length || 0);
    };

      /**
     * Renders favorite jobs in favorites tab
     * @function renderFavoriteJobs
     */
    const renderFavoriteJobs = () => {
        if (!favoriteJobsContainer) return;
        const favoriteJobs = allJobs.filter(job => favoriteJobIds.includes(job.id));
        if (favoriteJobs.length === 0) {
            favoriteJobsContainer.innerHTML = '<p class="job-listings__empty">No favorite jobs yet.</p>';
        } else {
            favoriteJobsContainer.innerHTML = favoriteJobs.map(createJobCardHTML).join('');
        }
    };

     /**
     * Toggles job favorite status
     * @function toggleFavorite
     * @param {number} jobId - Job ID to toggle
     */
    const toggleFavorite = (jobId) => {
        jobId = Number(jobId);
        const idx = favoriteJobIds.indexOf(jobId);
        if (idx === -1) favoriteJobIds.push(jobId);
        else favoriteJobIds.splice(idx, 1);
        saveFavorites();
        renderFavoritesCount();
        // Update every job card favorite icons visible
        document.querySelectorAll(`.job-card__favorite-btn[data-job-id="${jobId}"]`).forEach(btn => {
            btn.textContent = favoriteJobIds.includes(jobId) ? '★' : '☆';
            btn.classList.toggle('job-card__favorite-btn--active', favoriteJobIds.includes(jobId));
        });
        // Re-render favorites tab if active
        const activeTab = tabsNav?.querySelector('.tab-item--active')?.dataset?.tab;
        if (activeTab === 'favorites') renderFavoriteJobs();
    };

    // ------------------------------------
    // --- TAB NAVIGATION ---
    // ------------------------------------

     /**
     * Sets up tab navigation functionality
     * @function setupTabs
     */
    const setupTabs = () => {
        if (!tabsNav) return;
        tabsNav.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab-item');
            if (!clickedTab) return;
            tabsNav.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('tab-item--active'));
            clickedTab.classList.add('tab-item--active');
            const tabId = clickedTab.dataset.tab;
            tabContents.forEach(content => {
                content.classList.toggle('tab-content--active', content.id === `tab-${tabId}`);
            });
            if (tabId === 'favorites') renderFavoriteJobs();
            if (tabId === 'manage') renderManageList();
        });
    };

    // ------------------------------------
    // --- MODAL MANAGEMENT ---
    // ------------------------------------

    
    /**
     * Opens job details modal
     * @function openViewModal
     * @param {number} jobId - Job ID to display
     */
    const openViewModal = (jobId) => {
        const job = allJobs.find(j => j.id === Number(jobId));
        if (!job) return;
        const logoEl = document.getElementById('modal-logo');
        if (logoEl) logoEl.src = job.logo || `https://api.dicebear.com/8.x/initials/svg?seed=${job.company}`;
        const pos = document.getElementById('modal-position'); if (pos) pos.textContent = job.position;
        const comp = document.getElementById('modal-company'); if (comp) comp.textContent = job.company;
        const desc = document.getElementById('modal-description'); if (desc) desc.textContent = job.description;
        const meta = document.getElementById('modal-meta'); if (meta) meta.innerHTML = `<li>${job.postedAt}</li><li>${job.contract}</li><li>${job.location}</li>`;
        const tagsEl = document.getElementById('modal-tags'); if (tagsEl) {
            const tags = [job.role, job.level, ...(job.skills || [])];
            tagsEl.innerHTML = tags.map(tag => `<span class="job-card__tag">${tag}</span>`).join('');
        }
        if (viewModal) viewModal.style.display = 'flex';
    };

     /**
     * Closes job details modal
     * @function closeViewModal
     */

    const closeViewModal = () => { 
    
        if (viewModal) viewModal.style.display = 'none'; };
        /**
     * Opens job management modal (add/edit)
     * @function openManageModal
     * @param {number|null} jobId - Job ID to edit, null for new job
     */

    const openManageModal = (jobId = null) => {
        clearErrors(manageJobForm);
        if (jobId) {
            const job = allJobs.find(j => j.id === Number(jobId));
            if (!job) return;
            manageModalTitle.textContent = 'Edit Job';
            jobIdInput.value = job.id;
            jobCompanyInput.value = job.company || '';
            jobPositionInput.value = job.position || '';
            jobLogoInput.value = job.logo || '';
            jobContractInput.value = job.contract || '';
            jobLocationInput.value = job.location || '';
            jobRoleInput.value = job.role || '';
            jobLevelInput.value = job.level || '';
            jobSkillsInput.value = (job.skills || []).join(', ');
            jobDescriptionInput.value = job.description || '';
        } else {
            manageModalTitle.textContent = 'Add New Job';
            manageJobForm.reset();
            jobIdInput.value = '';
        }
        if (manageModal) manageModal.style.display = 'flex';
    };

    
    /**
     * Closes job management modal
     * @function closeManageModal
     */

    const closeManageModal = () => {
         if (manageModal) manageModal.style.display = 'none'; 
        };

    // ------------------------------------
    // --- JOB MANAGEMENT (CRUD) ---
    // ------------------------------------

     /**
     * Renders job management list
     * @function renderManageList
     */
    const renderManageList = () => {
        if (!manageJobsList) return;
        if (!allJobs.length) {
            manageJobsList.innerHTML = '<p class="job-listings__empty">No jobs to manage.</p>';
            return;
        }
        manageJobsList.innerHTML = allJobs.map(job => `
            <li class="manage-job-item" data-job-id="${job.id}">
                <img src="${job.logo || `https://api.dicebear.com/8.x/initials/svg?seed=${job.company}`}" alt="" class="job-card__logo" style="position: static; width: 48px; height: 48px; border-radius: 5px;">
                <div class="manage-job-item__info">
                    <h4>${job.position}</h4>
                    <p>${job.company} - ${job.location}</p>
                </div>
                <div class="manage-job-item__actions">
                    <button class="btn btn--secondary btn-edit">Edit</button>
                    <button class="btn btn--danger btn-delete">Delete</button>
                </div>
            </li>
        `).join('');
    };

     /**
     * Handles job form submission (add/edit)
     * @function handleManageFormSubmit
     * @param {Event} e - Form submit event
     */

    const handleManageFormSubmit = (e) => {
        e.preventDefault();
        if (!validateJobForm()) return;
        const idVal = jobIdInput.value.trim();
        let jobId = idVal ? Number(idVal) : null;
        const newJob = {
            id: jobId || (allJobs.length ? Math.max(...allJobs.map(j => j.id)) + 1 : 1),
            company: jobCompanyInput.value.trim(),
            position: jobPositionInput.value.trim(),
            logo: jobLogoInput.value.trim(),
            contract: jobContractInput.value.trim(),
            location: jobLocationInput.value.trim(),
            role: jobRoleInput.value.trim(),
            level: jobLevelInput.value.trim(),
            skills: jobSkillsInput.value.split(',').map(s => s.trim()).filter(Boolean),
            description: jobDescriptionInput.value.trim(),
            postedAt: new Date().toLocaleDateString(),
            featured: false,
            new: false
        };
        if (jobId) {
            // update
            allJobs = allJobs.map(j => j.id === jobId ? { ...j, ...newJob } : j);
        } else {
            // add
            allJobs.push(newJob);
        }
        saveAllJobs();
        renderJobs(allJobs);
        renderManageList();
        closeManageModal();
    };


     /**
     * Handles manage list clicks (edit/delete)
     * @function handleManageListClick
     * @param {Event} e - Click event
     */
    const handleManageListClick = (e) => {
        const item = e.target.closest('.manage-job-item');
        if (!item) return;
        const jobId = Number(item.dataset.jobId);
        if (e.target.matches('.btn-edit')) {
            openManageModal(jobId);
        } else if (e.target.matches('.btn-delete')) {
            if (!confirm('Delete this job?')) return;
            allJobs = allJobs.filter(j => j.id !== jobId);
         
            favoriteJobIds = favoriteJobIds.filter(id => id !== jobId);
            saveAllJobs();
            saveFavorites();
            renderManageList();
            renderJobs(allJobs);
            renderFavoritesCount();
        }
    };

    // ------------------------------------
    // --- JOB RENDERING ---
    // ------------------------------------

    /**
     * Creates HTML for a single job card
     * @function createJobCardHTML
     * @param {Object} job - Job object
     * @returns {string} HTML string for job card
     */
    const createJobCardHTML = (job) => {
        const { id, company, logo, new: isNew, featured, position, role, level, postedAt, contract, location, skills } = job;
        const tags = [role, level, ...(skills || [])].filter(Boolean);
        const tagsHTML = tags.map(tag => `<span class="job-card__tag" data-tag="${tag}">${tag}</span>`).join('');
        const newBadge = isNew ? '<span class="job-card__badge job-card__badge--new">NEW!</span>' : '';
        const featuredBadge = featured ? '<span class="job-card__badge job-card__badge--featured">FEATURED</span>' : '';
        const featuredClass = featured ? 'job-card--featured' : '';
        const isFavorite = favoriteJobIds.includes(id);
        const favoriteClass = isFavorite ? 'job-card__favorite-btn--active' : '';
        const favoriteIcon = isFavorite ? '★' : '☆';

        return `
            <article class="job-card ${featuredClass}" data-job-id="${id}" data-tags="${tags.join(',')}">
                <button class="job-card__favorite-btn ${favoriteClass}" data-job-id="${id}" aria-label="Add to favorites">
                    ${favoriteIcon}
                </button>
                <img src="${logo || `https://api.dicebear.com/8.x/initials/svg?seed=${company}`}" alt="${company} logo" class="job-card__logo">
                <div class="job-card__info">
                    <div class="job-card__company"><span>${company}</span>${newBadge}${featuredBadge}</div>
                    <h2 class="job-card__position">${position}</h2>
                    <ul class="job-card__meta"><li>${postedAt}</li><li>${contract}</li><li>${location}</li></ul>
                </div>
                <div class="job-card__tags">${tagsHTML}</div>
            </article>
        `;
    };

     /**
     * Renders filtered jobs to main container
     * @function renderJobs
     * @param {Array} jobsToRender - Array of job objects to display
     */
    const renderJobs = (jobsToRender) => {
        if (!jobListingsContainer) return;
        jobListingsContainer.innerHTML = jobsToRender.length > 0
            ? jobsToRender.map(createJobCardHTML).join('')
            : '<p class="job-listings__empty">No jobs match your search.</p>';
    };

     /**
     * Renders active filter tags
     * @function renderManualFilterTags
     */

    const renderManualFilterTags = () => {
        if (!filterTagsContainer) return;
        filterTagsContainer.innerHTML = '';
        manualFilters.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'filter-bar__tag';
            div.dataset.tag = tag;
            div.innerHTML = `<span class="filter-bar__tag-name">${tag}</span><button class="filter-bar__tag-remove" aria-label="Remove filter ${tag}">✕</button>`;
            filterTagsContainer.appendChild(div);
        });
        filterBar?.classList.toggle('filter-bar--active', manualFilters.length > 0 || (userProfile.skills && userProfile.skills.length > 0));
    };

    const renderStats = (matchCount, totalCount) => {
        if (!statsCounter) return;
        if ((manualFilters.length || (userProfile.skills && userProfile.skills.length))) {
            statsCounter.textContent = `${matchCount} of ${totalCount} jobs match your filters`;
        } else {
            statsCounter.textContent = `${totalCount} jobs available`;
        }
    };

    // ------------------------------------
    // --- FILTERING & SEARCH ---
    // ------------------------------------

    /**
     * Applies all active filters and updates display
     * @function applyAllFilters
     */
    const applyAllFilters = () => {
        const term = (searchInput?.value || '').trim().toLowerCase();
        // combined filters: manualFilters + user skills
        const combinedFilters = [...new Set([...(manualFilters || []), ...(userProfile.skills || [])])].map(f => f.toLowerCase());

        const filtered = allJobs.filter(job => {
            // text search: company, position, description, location, tags
            const hay = [
                job.company || '',
                job.position || '',
                job.description || '',
                job.location || '',
                job.role || '',
                job.level || '',
                ...(job.skills || [])
            ].join(' ').toLowerCase();

            if (term && !hay.includes(term)) return false;

            // filters: every filter must appear in hay (as word)
            for (const f of combinedFilters) {
                if (!hay.includes(f)) return false;
            }
            return true;
        });

        renderManualFilterTags();
        renderJobs(filtered);
        renderStats(filtered.length, allJobs.length);
    };

    // ------------------------------------
    // --- EVENT HANDLERS ---
    // ------------------------------------

     /**
     * Handles clicks on job listings
     * @function handleJobListClick
     * @param {Event} e - Click event
     */
    const handleJobListClick = (e) => {
        // tag clicks -> add manual filter
        const tag = e.target.closest('.job-card__tag')?.dataset?.tag;
        if (tag) {
            if (!manualFilters.includes(tag)) manualFilters.push(tag);
            applyAllFilters();
            return;
        }

        // favorite button
        const favBtn = e.target.closest('.job-card__favorite-btn');
        if (favBtn) {
            const id = Number(favBtn.dataset.jobId);
            toggleFavorite(id);
            return;
        }

        // open modal on card click (avoid clicks on buttons)
        const card = e.target.closest('.job-card');
        if (card && !e.target.closest('button')) {
            const id = Number(card.dataset.jobId);
            openViewModal(id);
        }
    };

      /**
     * Handles filter bar clicks
     * @function handleFilterBarClick
     * @param {Event} e - Click event
     */

    const handleFilterBarClick = (e) => {
        const removeBtn = e.target.closest('.filter-bar__tag-remove');
        if (removeBtn) {
            const tagDiv = removeBtn.closest('.filter-bar__tag');
            const tag = tagDiv?.dataset?.tag;
            manualFilters = manualFilters.filter(t => t !== tag);
            applyAllFilters();
        }
        if (e.target === clearFiltersBtn) {
            handleClearFilters();
        }
    };

     /**
     * Clears all manual filters
     * @function handleClearFilters
     */

    const handleClearFilters = () => {
        manualFilters = [];
        if (searchInput) searchInput.value = '';
        applyAllFilters();
    };

    // ------------------------------------
    // --- INITIALIZATION ---
    // ------------------------------------

     /**
     * Initializes the application
     * @async
     * @function initializeApp
     */
    const initializeApp = async () => {
        // load saved data
        loadProfile();
        loadFavorites();
        await loadAllJobs();

        // render initial UI
        renderProfileForm();
        renderProfileSkills();
        renderFavoritesCount();
        setupTabs();
        applyAllFilters();

        // modal events
        viewModalCloseBtn?.addEventListener('click', closeViewModal);
        viewModal?.addEventListener('click', (e) => { if (e.target === viewModal) closeViewModal(); });
        manageModalCloseBtn?.addEventListener('click', closeManageModal);
        manageModal?.addEventListener('click', (e) => { if (e.target === manageModal) closeManageModal(); });

        // management events
        addNewJobBtn?.addEventListener('click', () => openManageModal());
        manageJobsList?.addEventListener('click', handleManageListClick);
        manageJobForm?.addEventListener('submit', handleManageFormSubmit);

        // profile events
        profileForm?.addEventListener('submit', handleProfileSave);
        skillInput?.addEventListener('keydown', handleSkillAdd);
        profileSkillsList?.addEventListener('click', handleSkillRemove);

        // job list & filter events
        jobListingsContainer?.addEventListener('click', handleJobListClick);
        filterBar?.addEventListener('click', handleFilterBarClick);
        clearFiltersBtn?.addEventListener('click', handleClearFilters);
        searchInput?.addEventListener('input', () => applyAllFilters());

        // initial render manage list
        renderManageList();
    };

    // Start
    initializeApp();

});
