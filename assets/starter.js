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

    // ------------------------------------
    // --- GLOBAL VARIABLES ---
    // ------------------------------------
    
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

    profileForm.addEventListener( 'submit' , (e) => {

         e.preventDefault();
         clearErrors(profileForm);

         const messages = [];

         if (profileNameInput.value.trim() === ''){
            messages.push('Name is required');
            showError(profileNameInput, 'Name is required')
         }

         if (profilePositionInput .value.trim() === ''){
            messages.push('profilePosition is required');
            showError(profilePositionInput , 'profilePosition is required')
         }

         if(profileSkillsList.children.length < 1)
         {
            messages.push('At least 1 skills required');
            showError(skillInput, 'At least 1 skill required');
         }

         if(messages.length === 0){
            console.log('form is valid');
         }

    });
    /**
     * Shows error message for a form field
     * @function showError
     * @param {HTMLElement} input - The input element
     * @param {string} message - Error message to display
     */
    const showError = (input, message) => {
      input.classList.add('input--error');
      const errorSpan = input.parentElement.querySelector('.form-error');

      if(errorSpan) errorSpan.textContent = message;
    };

    /**
     * Clears all errors from a form
     * @function clearErrors
     * @param {HTMLElement} form - The form element
     */
    const clearErrors = (form) => {
       form.querySelectorAll('.input--error').forEach(i => i.classList.remove('input--error'));
        form.querySelectorAll('.form-error').forEach(span => (span.textContent = ''));
    };

    /**
     * Validates the profile form
     * @function validateProfileForm
     * @returns {boolean} True if valid, false otherwise
     */
    const validateProfileForm = () => {
       clearErrors(profileForm);

       let isValid = true;

       if(profileNameInput.value.trim() === ''){
        showError(profileNameInput, 'Name is required');
        isValid = false;
       }


       if (profilePositionInput.value.trim() === ''){
        showError(profilePositionInput, 'Position is required');
        isValid = false;
       }

       if(profileSkillsList.children.length < 1){
        showError(skillInput, 'At least one skill required');
        isValid = false;
       }
        return isValid;
    };

    /**
     * Validates the job management form
     * @function validateJobForm
     * @returns {boolean} True if valid, false otherwise
     */
    const validateJobForm = () => {
       let isValid = true;
       clearErrors(manageJobForm);

       if(jobCompanyInput.value.trim() === '')
       {
        showError(jobCompanyInput, 'Company name is required');
        isValid = false;
       }

       if(jobPositionInput.value.trim() === '')
       {
        showError(jobPositionInput, 'Position is required');
        isValid = false;
       }

       if(jobLogoInput.value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i)){
        showError(jobLogoInput, 'Invalid logo URL');
        isValid = false;
       }
        return isValid;
    };

    // ------------------------------------
    // --- PROFILE MANAGEMENT ---
    // ------------------------------------

    /**
     * Saves user profile to localStorage
     * @function saveProfile
     */
    const saveProfile = () => {
       const prifile = {
        name: profileNameInput.value.trim(),
        position: profilePositionInput.value.trim(),
        skills: Array.form(profileSkillsList.children).map(li => li.textContent),

       };
       localStorage.setItem('userProfile', j=JSON.stringify(profile));
    };

    /**
     * Loads user profile from localStorage
     * @function loadProfile
     */
    const loadProfile = () => {
       const storedprofile = localStorage.getItem('userprofile');

       if (!storedprofile) return;

       const profile = JSON.parse(storedprofile);

       profileNameInput.value = profile.name;

       profilePositionInput.value = profile.position;

       profile.skills.forEach(skill =>{
        const li = document.creatElement('li');
        li.textContent = skill;
        profileSkillsList.appendChild(li);
       });

    };

    /**
     * Renders profile skills list
     * @function renderProfileSkills
     */
    const renderProfileSkills = () => {
     
        profileSkillsList.innerHTML = "";

        userProfile.skills.forEach(skill => {
            const li = document.creatElement('li');

            li.className = "profile-skill-tag";
            li.dataset.skill = skill;

            li.innerHTML = `
            <span>${skill}</span>
            <button class="profile-skill-remove" aria-label="Remove skill ${skill}">X</button>
            `;
              profileSkillsList.appendChild(li);
        });

        document.querySelectorAll(' .profile-skill-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const skillToremove = e.target.parentElement.dataset.skill;

                userProfile.skill = userProfile.skill.filter(s => s !== skillToremove);

                renderProfileSkills();
            });
        });
    };

    /**
     * Renders profile form with saved data
     * @function renderProfileForm
     */
    const renderProfileForm = () => {
        const storedProfile = localStorage.getItem('userProfile');

        if(!storedProfile) return;

        const profile = JSON.parse(storedProfile);

          profileNameInput.value = profile.name || '';
          profilePositionInput.value = profile.position || '';
          userProfile.skills = profile.skills || [];

          renderProfileSkills();

    };

    /**
     * Handles profile form submission
     * @function handleProfileSave
     * @param {Event} e - Form submit event
     */
    const handleProfileSave = (e) => {
       
        e.preventDefault();

        const name = profileNameInput.value.trim();

        const position = profilePositionInput.value.trim();

        if(!name || !position)
        {
            alert("Please fill in all fields.");

            return;
        }

        saveProfile();

        renderProfileForm();

    };

    /**
     * Handles adding new skills
     * @function handleSkillAdd
     * @param {KeyboardEvent} e - Keydown event
     */
    const handleSkillAdd = (e) => {
       if (e.key === 'Entre'){
        e.preventDefault();

        const newSKill = profileSkillInput.value.trim();

        if(!newSKill) return;

        if (userProfile.skill.includes(newSKill)) {
            alert("Skill already exists!");
            return;
        }


        userProfile.skill.push(newSKill);
       profileSkillInput.value = '';

       saveProfile();
       }

       
    };

    /**
     * Handles removing skills
     * @function handleSkillRemove
     * @param {Event} e - Click event
     */
    const handleSkillRemove = (e) => {
       if (e.target.classList.contains('profile-skill-remove')) {
    const skill = e.target.parentElement.dataset.skill;
    userProfile.skills = userProfile.skills.filter(s => s !== skill);
    renderProfileSkills();
    saveProfile();
  }
    };

   // ------------------------------------
    // --- FAVORITES MANAGEMENT ---
    // ------------------------------------

    /**
     * Saves favorites to localStorage
     * @function saveFavorites
     */
    const saveFavorites = () => {
        localStorage.setItem('favorites', JSON.stringify(favoriteJobIds));
    };

    /**
     * Loads favorites from localStorage
     * @function loadFavorites
     */
    const loadFavorites = () => {
        const saved = localStorage.getItem('favorites');
        favoriteJobIds = saved ? JSON.parse(saved) : [];
    };

    /**
     * Updates favorites count display
     * @function renderFavoritesCount
     */
    const renderFavoritesCount = () => {
      const countSpan = document.querySelector('#tab-favorites-count');

      if(countSpan) countSpan.textContent = favoriteJobIds.length;
    };

    /**
     * Renders favorite jobs in favorites tab
     * @function renderFavoriteJobs
     */
    const renderFavoriteJobs = () => {
         const favoriteContainer = document.getElementById('favorites-list');

        const favoriteJobs = allJobs.filter(job => favoriteJobIds.includes(job.id));

        if(favoriteJobs.length > 0){
            favoriteContainer.innerHTML = favoriteJobs.map(createJobCardHTML).joing('');

        }
        
            else{
             favoriteContainer.innerHTML =  '<p class="job-listings__empty">You have no favorite jobs yet.</p>';   
            }

             renderFavoritesCount();
    };

    /**
     * Toggles job favorite status
     * @function toggleFavorite
     * @param {number} jobId - Job ID to toggle
     */
    const toggleFavorite = (jobId) => {
       
        const index = favoriteJobIds.indexOf(jobId);

        if(index !== -1){
            favoriteJobIds.splice(index, 1);
        }else{

            favoriteJobIds.push(jobId);
        }
         saveFavorites();
         renderFavoritesCount();
         applyAllFilters();
    };

    // ------------------------------------
    // --- TAB NAVIGATION ---
    // ------------------------------------

    /**
     * Sets up tab navigation functionality
     * @function setupTabs
     */
    const setupTabs = () => {
        tabsNav.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab-item');
            if (!clickedTab) return;
            
            // Update active tab
            tabsNav.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('tab-item--active'));
            clickedTab.classList.add('tab-item--active');
            
            // Show/hide tab content
            const tabId = clickedTab.dataset.tab;
            tabContents.forEach(content => {
                content.classList.toggle('tab-content--active', content.id === `tab-${tabId}`);
            });
            
            // Load tab-specific content
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
        const job = allJobs.find(j => j.id === jobId);
        if (job) {
            document.getElementById('modal-logo').src = job.logo || `https://api.dicebear.com/8.x/initials/svg?seed=${job.company}`;
            document.getElementById('modal-position').textContent = job.position;
            document.getElementById('modal-company').textContent = job.company;
            document.getElementById('modal-description').textContent = job.description;
            document.getElementById('modal-meta').innerHTML = `<li>${job.postedAt}</li><li>${job.contract}</li><li>${job.location}</li>`;
            const tags = [job.role, job.level, ...(job.skills || [])];
            document.getElementById('modal-tags').innerHTML = tags.map(tag => `<span class="job-card__tag">${tag}</span>`).join('');
            viewModal.style.display = 'flex';
        }
    };

    /**
     * Closes job details modal
     * @function closeViewModal
     */
    const closeViewModal = () => {
        viewModal.style.display = 'none';
    };

    /**
     * Opens job management modal (add/edit)
     * @function openManageModal
     * @param {number|null} jobId - Job ID to edit, null for new job
     */
    const openManageModal = (jobId = null) => {
        clearErrors(manageJobForm);
        if (jobId) {
            // Edit mode
            const job = allJobs.find(j => j.id === jobId);
            if (!job) return;
            manageModalTitle.textContent = 'Edit Job';
            jobIdInput.value = job.id;
            jobCompanyInput.value = job.company;
            jobPositionInput.value = job.position;
            jobLogoInput.value = job.logo || '';
            jobContractInput.value = job.contract;
            jobLocationInput.value = job.location;
            jobRoleInput.value = job.role;
            jobLevelInput.value = job.level;
            jobSkillsInput.value = (job.skills || []).join(', ');
            jobDescriptionInput.value = job.description;
        } else {
            // Add mode
            manageModalTitle.textContent = 'Add New Job';
            manageJobForm.reset();
            jobIdInput.value = '';
        }
        manageModal.style.display = 'flex';
    };

    /**
     * Closes job management modal
     * @function closeManageModal
     */
    const closeManageModal = () => {
        manageModal.style.display = 'none';
    };

    // ------------------------------------
    // --- JOB MANAGEMENT (CRUD) ---
    // ------------------------------------

    /**
     * Renders job management list
     * @function renderManageList
     */
    const renderManageList = () => {
        const manageList = document.getElementById('manage-job-list');

        if(!allJobs.length){
            manageList.innerHTML = '<p class="job-listings__empty">No jobs available.</p>';
            return;
        }

          manageList.innerHTML = allJobs.map(job => `
         <li class="manage-job-item" data-job-id="${job.id}">
        <img src="${job.logo}" alt="" class="job-card__logo" 
             style="position: static; width: 48px; height: 48px; border-radius: 5px;">
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

  const jobId = document.getElementById('job-id').value;
  const jobData = {
    id: jobId ? Number(jobId) : Date.now(),
    company: document.getElementById('company').value,
    logo: document.getElementById('logo').value,
    position: document.getElementById('position').value,
    location: document.getElementById('location').value,
    postedAt: new Date().toISOString().split('T')[0],
  };

  if (jobId) {
  
    const index = allJobs.findIndex(job => job.id === Number(jobId));
    allJobs[index] = jobData;
  } else {
    
    allJobs.push(jobData);
  }

  
  localStorage.setItem('jobs', JSON.stringify(allJobs));

 
  renderManageList();
  applyAllFilters();
  closeModal('manage-job-modal');
    };

    /**
     * Handles manage list clicks (edit/delete)
     * @function handleManageListClick
     * @param {Event} e - Click event
     */
    const handleManageListClick = (e) => {
         const btn = e.target;
  const li = btn.closest('.manage-job-item');
  if (!li) return;

  const jobId = Number(li.dataset.jobId);

  
  if (btn.classList.contains('btn-edit')) {
    const job = allJobs.find(j => j.id === jobId);
    document.getElementById('job-id').value = job.id;
    document.getElementById('company').value = job.company;
    document.getElementById('logo').value = job.logo;
    document.getElementById('position').value = job.position;
    document.getElementById('location').value = job.location;
    openModal('manage-job-modal');
  }

 
  if (btn.classList.contains('btn-delete')) {
    if (confirm('Are you sure you want to delete this job?')) {
      const index = allJobs.findIndex(j => j.id === jobId);
      allJobs.splice(index, 1);
      localStorage.setItem('jobs', JSON.stringify(allJobs));
      renderManageList();
      applyAllFilters();
    }
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
        const tags = [role, level, ...(skills || [])];
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
        jobListingsContainer.innerHTML = jobsToRender.length > 0
            ? jobsToRender.map(createJobCardHTML).join('')
            : '<p class="job-listings__empty">No jobs match your search.</p>';
    };

    /**
     * Renders active filter tags
     * @function renderManualFilterTags
     */
    const renderManualFilterTags = () => {
        // TODO: Implement filter tags rendering
        // Use this HTML template for each tag:
        // `<div class="filter-bar__tag" data-tag="${tag}">
        //     <span class="filter-bar__tag-name">${tag}</span>
        //     <button class="filter-bar__tag-remove" aria-label="Remove filter ${tag}">✕</button>
        //  </div>`
    };

    /**
     * Updates statistics counter
     * @function renderStats
     * @param {number} matchCount - Number of matching jobs
     * @param {number} totalCount - Total number of jobs
     */
    const renderStats = (matchCount, totalCount) => {
        // TODO: Implement stats rendering
        // Show different messages based on active filters
    };

    // ------------------------------------
    // --- FILTERING & SEARCH ---
    // ------------------------------------

    /**
     * Applies all active filters and updates display
     * @function applyAllFilters
     */
    const applyAllFilters = () => {
        // TODO: Implement comprehensive filtering
        // 1. Get search term
        // 2. Combine profile skills and manual filters
        // 3. Filter jobs by tags and search term
        // 4. Update all UI components
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
        // TODO: Implement job list click handling
        // 1. Handle tag clicks (add to filters)
        // 2. Handle favorite button clicks
        // 3. Handle card clicks (open modal)
    };

    /**
     * Handles filter bar clicks
     * @function handleFilterBarClick
     * @param {Event} e - Click event
     */
    const handleFilterBarClick = (e) => {
        // TODO: Implement filter removal
        // Handle clicks on filter tag remove buttons
    };

    /**
     * Clears all manual filters
     * @function handleClearFilters
     */
    const handleClearFilters = () => {
        // TODO: Implement filter clearing
        // 1. Clear manual filters array
        // 2. Clear search input
        // 3. Apply filters
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
        // TODO: Implement app initialization
        // 1. Load saved data (profile, favorites)
        // 2. Load job data
        // 3. Render initial UI
        // 4. Set up event listeners
        // 5. Apply initial filters

        // Load data
        loadProfile();
        loadFavorites();
        await loadAllJobs();

        // Render initial UI
        renderProfileForm();
        renderProfileSkills();
        renderFavoritesCount();
        setupTabs();
        applyAllFilters();

        // Modal events
        viewModalCloseBtn.addEventListener('click', closeViewModal);
        viewModal.addEventListener('click', (e) => { if (e.target === viewModal) closeViewModal(); });
        manageModalCloseBtn.addEventListener('click', closeManageModal);
        manageModal.addEventListener('click', (e) => { if (e.target === manageModal) closeManageModal(); });
        
        // Management events
        addNewJobBtn.addEventListener('click', () => openManageModal());
        
        // Initial job display
        renderJobs(allJobs);
        
        // TODO: Add remaining event listeners
        // Profile events
        // Filter events  
        // Job list events
    };

    // Start the application
    initializeApp();
});
