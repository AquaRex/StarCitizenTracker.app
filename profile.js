// Profile page JavaScript - clean version without template literals

// Profile data
let profileData = null;
let allKills = [];
let profileKills = [];
let profileDeaths = [];
let currentView = 'all';
let PROFILE_PLAYER_NAME = '';

// Current filter values
let currentFilters = {
    weapon: '',
    zone: '',
    damage: '',
    sort: 'date-desc',
    search: ''
};

// Get profile username from URL parameter
function getProfileUsername() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user');
}

// Initialize dark mode (no authentication required)
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isNowDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isNowDarkMode.toString());
        });
    }
}

// Initialize view buttons
function initViewButtons() {
    const allViewBtn = document.getElementById('allViewBtn');
    const myViewBtn = document.getElementById('myViewBtn');
    const deathsViewBtn = document.getElementById('deathsViewBtn');

    if (allViewBtn) allViewBtn.addEventListener('click', () => switchView('all'));
    if (myViewBtn) myViewBtn.addEventListener('click', () => switchView('kills'));
    if (deathsViewBtn) deathsViewBtn.addEventListener('click', () => switchView('deaths'));
}

// Switch between views
function switchView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    
    if (view === 'all') {
        document.getElementById('allViewBtn').classList.add('active');
        if (PROFILE_PLAYER_NAME) {
            document.getElementById('myViewBtn').textContent = PROFILE_PLAYER_NAME + "'S KILLS";
            document.getElementById('deathsViewBtn').textContent = PROFILE_PLAYER_NAME + "'S DEATHS";
        }
    } else if (view === 'kills') {
        document.getElementById('myViewBtn').classList.add('active');
    } else if (view === 'deaths') {
        document.getElementById('deathsViewBtn').classList.add('active');
    }
    
    // Show/hide views
    document.getElementById('allView').style.display = view === 'all' ? 'block' : 'none';
    document.getElementById('myView').style.display = view === 'kills' ? 'block' : 'none';
    document.getElementById('deathsView').style.display = view === 'deaths' ? 'block' : 'none';
    
    renderView();
}

// Load profile data from API
async function loadProfileData(username) {
    try {
        const profileUrl = getApiUrl(API_CONFIG.ENDPOINTS.PROFILES + '/' + encodeURIComponent(username));
        
        let profileResponse;
        const currentUser = sessionStorage.getItem('username');
        const currentPassword = sessionStorage.getItem('password');
        
        if (currentUser && currentPassword) {
            try {
                profileResponse = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.PROFILES + '/' + encodeURIComponent(username));
            } catch (error) {
                profileResponse = await fetch(profileUrl);
            }
        } else {
            profileResponse = await fetch(profileUrl);
        }
        
        if (!profileResponse.ok) {
            if (profileResponse.status === 404) {
                showError('Profile Not Found', 'This user profile does not exist or is set to private.', 'info');
                return;
            } else if (profileResponse.status === 403) {
                showError('Access Denied', 'This profile is private and you do not have permission to view it.', 'warning');
                return;
            } else if (profileResponse.status === 401) {
                showError('Authentication Required', 'You need to be logged in to view this profile.', 'warning');
                return;
            }
            
            // For development: Show mock data for AquaRex if API is not available
            if (username.toLowerCase() === 'aquarex' && profileResponse.status >= 500) {
                profileData = {
                    userId: 2,
                    username: 'AquaRex',
                    inGameName: 'AquaRex',
                    totalKills: 11,
                    totalDeaths: 14,
                    favoriteWeapon: 'BEHR RIFLE BALLISTIC 01',
                    isPublic: true
                };
                
                // Mock activity data
                allKills = [
                    {
                        id: 1,
                        killerUser: 'AquaRex',
                        victimUser: 'SSG1003010',
                        killTime: new Date().toISOString(),
                        weapon: 'KSAR_RIFLE_ENERGY_01',
                        zone: 'MICROTECH',
                        damageType: 'Energy'
                    },
                    {
                        id: 2,
                        killerUser: 'I-Linkol',
                        victimUser: 'AquaRex',
                        killTime: new Date(Date.now() - 3600000).toISOString(),
                        weapon: 'BEHR_RIFLE_BALLISTIC_01',
                        zone: 'MICROTECH',
                        damageType: 'Ballistic'
                    }
                ];
                
                PROFILE_PLAYER_NAME = profileData.inGameName.toUpperCase();
                
                // Update player name in UI
                const playerNameElement = document.getElementById('playerName');
                if (playerNameElement) {
                    playerNameElement.textContent = PROFILE_PLAYER_NAME;
                }
                document.title = PROFILE_PLAYER_NAME + ' - STAR TRACKER';
                
                // Filter data
                profileKills = allKills.filter(k => k.killerUser.toLowerCase() === profileData.inGameName.toLowerCase());
                profileDeaths = allKills.filter(k => k.victimUser.toLowerCase() === profileData.inGameName.toLowerCase());
                
                // Update stats and populate filters
                updateStats();
                populateFilters();
                
                // Show initial view
                switchView('all');
                renderView();
                return;
            }
            
            if (profileResponse.status === 404) {
                showError('Profile Not Found', 'This profile either doesn\'t exist or is set to private.', 'info');
            } else if (profileResponse.status === 500) {
                showError('Server Error', 'The server encountered an error while loading this profile.', 'error');
            } else {
                showError('Connection Failed', 'Unable to load profile. Server returned status: ' + profileResponse.status, 'error');
            }
            return;
        }

        profileData = await profileResponse.json();
        PROFILE_PLAYER_NAME = (profileData.inGameName || profileData.username).toUpperCase();
        
        // Update player name in UI
        const playerNameElement = document.getElementById('playerName');
        if (playerNameElement) {
            playerNameElement.textContent = PROFILE_PLAYER_NAME;
        }
        document.title = PROFILE_PLAYER_NAME + ' - STAR TRACKER';
        
        // Now get their kill data
        const killsResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PROFILES + '/' + profileData.userId + '/activity'));
        
        if (killsResponse.ok) {
            allKills = await killsResponse.json();
        } else {
            allKills = [];
        }
        
        // Filter data
        profileKills = allKills.filter(k => k.killerUser.toLowerCase() === (profileData.inGameName || profileData.username).toLowerCase());
        profileDeaths = allKills.filter(k => k.victimUser.toLowerCase() === (profileData.inGameName || profileData.username).toLowerCase());
        
        // Update stats and populate filters
        updateStats();
        populateFilters();
        initFilters();
        
        // Show initial view
        switchView('all');
        
        // Hide error message container
        const errorContainer = document.getElementById('error-message-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        
        // Provide more specific error messaging
        let errorTitle = 'Connection Error';
        let errorMessage = 'Failed to connect to the server.';
        let iconType = 'error';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorTitle = 'Unable to Connect';
            errorMessage = 'Cannot reach the API server. This could be due to network issues or server maintenance.';
            
            // If we're on localhost trying to reach production API, suggest solutions
            if (window.location.hostname === 'localhost') {
                errorMessage += '\n\nFor local testing, try using a web server (Python HTTP server, VS Code Live Server) instead of opening files directly.';
            }
            iconType = 'warning';
        }
        
        showError(errorTitle, errorMessage, iconType);
    }
}

// Update statistics display
function updateStats() {
    const kills = profileData.totalKills || 0;
    const deaths = profileData.totalDeaths || 0;
    const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
    
    // Calculate killstreak from kills data
    let bestStreak = 0;
    let currentStreak = 0;
    
    // Sort kills by time to calculate streaks
    const sortedKills = [...profileKills].sort((a, b) => new Date(a.killTime) - new Date(b.killTime));
    
    sortedKills.forEach(kill => {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
    });
    
    document.getElementById('stat-kills').textContent = kills;
    document.getElementById('stat-deaths').textContent = deaths;
    document.getElementById('stat-kd').textContent = kdRatio;
    document.getElementById('stat-streak').textContent = bestStreak;
    document.getElementById('stat-weapon').textContent = formatWeapon(profileData.favoriteWeapon) || 'NONE';
}

// Show error message
function showError(title, message, iconType = 'warning') {
    // Hide all content containers
    document.getElementById('player-bar-container').style.display = 'none';
    document.getElementById('stats-section-container').style.display = 'none';
    document.getElementById('view-buttons-container').style.display = 'none';
    document.getElementById('filter-panel-container').style.display = 'none';
    document.getElementById('content-area-container').style.display = 'none';
    
    // Show error message using component
    document.getElementById('error-message-container').innerHTML = generateErrorMessage({
        title: title || 'Error',
        message: message || 'Something went wrong',
        iconType: iconType,
        showRetryButton: false
    });
    document.getElementById('error-message-container').style.display = 'block';
}

// Initialize components for profile page
function initializeProfileComponents(username) {
    // Generate navigation (no account dropdown for profile page)
    document.getElementById('navigation-container').innerHTML = generateNavigation({
        showBackButton: true,
        backUrl: './index.html',
        pageTitle: '',
        showLogo: false,
        showAccountDropdown: false,
        showLeaderboard: false // Don't show leaderboard button on profile page
    });
    
    // Generate player bar for profile
    document.getElementById('player-bar-container').innerHTML = generatePlayerBar({
        username: username,
        inGameName: '',
        isViewingProfile: true
    });
    
    // Generate stats section (will be populated with real data later)
    document.getElementById('stats-section-container').innerHTML = generateStatsSection();
    
    // Generate view buttons for profile
    document.getElementById('view-buttons-container').innerHTML = generateViewButtons({
        showKillsButton: true,
        showDeathsButton: true,
        showAllButton: true,
        activeView: 'all',
        isProfile: true
    });
    
    // Generate filter panel
    document.getElementById('filter-panel-container').innerHTML = generateFilterPanel({
        isMainPage: false
    });
    
    // Generate content area
    document.getElementById('content-area-container').innerHTML = generateContentArea({
        isMainPage: false
    });
}

// Handle error cases when no username is provided
function handleNoUsername() {
    if (typeof generateErrorMessage !== 'undefined') {
        document.getElementById('error-message-container').innerHTML = generateErrorMessage({
            title: 'Invalid Profile URL',
            message: 'No username specified in the URL. Please provide a valid username to view a profile.',
            iconType: 'info',
            showRetryButton: false
        });
        document.getElementById('error-message-container').style.display = 'block';
    } else {
        // Fallback if components aren't loaded
        document.getElementById('error-message-container').innerHTML = 
            '<div class="error-message-container"><div class="error-message"><h2>Invalid Profile URL</h2><p>No username specified in the URL.</p></div></div>';
    }
}



// Initialize profile page
function initializeProfile() {
    const username = getProfileUsername();
    
    if (!username) {
        handleNoUsername();
        return;
    }
    
    // Check if components are available
    if (typeof generateNavigation === 'undefined') {
        return;
    }
    
    // Initialize components
    initializeProfileComponents(username);
    
    // Initialize dark mode
    initDarkMode();
    
    // Initialize view buttons after components are created
    initViewButtons();
    
    // Initialize search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value;
            renderView();
        });
    }
    
    loadProfileData(username);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select.open').forEach(select => {
                select.classList.remove('open');
            });
        }
    });
}

// Initialize when components are ready
window.addEventListener('componentsReady', initializeProfile);

// Also try to initialize immediately in case components are already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure components.js has executed
        setTimeout(initializeProfile, 50);
    });
} else {
    // Document already loaded, try immediately
    setTimeout(initializeProfile, 10);
}

// Toggle kill entry details
function toggleKillDetails(entryId) {
    const entry = document.getElementById(entryId);
    if (entry) {
        entry.classList.toggle('expanded');
    }
}

// Dropdown toggle function
function toggleDropdown(dropdownId) {
    const container = document.getElementById(dropdownId + 'Container');
    if (container) {
        container.classList.toggle('open');
    }
}

// Select option function (same as main page)
function selectOption(dropdownId, value, text) {
    const textElement = document.getElementById(dropdownId + 'Text');
    if (textElement) {
        textElement.textContent = text;
    }
    
    const container = document.getElementById(dropdownId + 'Container');
    if (container) {
        container.classList.remove('open');
    }
    
    // Update filter and re-render
    if (dropdownId === 'weaponFilter') {
        currentFilters.weapon = value;
    } else if (dropdownId === 'zoneFilter') {
        currentFilters.zone = value;
    } else if (dropdownId === 'damageFilter') {
        currentFilters.damage = value;
    } else if (dropdownId === 'sortOption') {
        currentFilters.sort = value;
    }
    
    renderView();
}

// Reset filters function (same as main page)
function resetFilters() {
    currentFilters = {
        weapon: '',
        zone: '',
        damage: '',
        sort: 'date-desc',
        search: ''
    };
    
    // Reset UI
    document.getElementById('weaponFilterText').textContent = 'ALL WEAPONS';
    document.getElementById('zoneFilterText').textContent = 'ALL ZONES';
    document.getElementById('damageFilterText').textContent = 'ALL DAMAGE TYPES';
    document.getElementById('sortOptionText').textContent = 'NEWEST FIRST';
    document.getElementById('searchInput').value = '';
    
    renderView();
}

// Copy all the formatting and filtering functions from script.js
// Escape HTML for safe insertion
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format weapon name
function formatWeapon(weapon) {
    if (!weapon || weapon === 'Unknown') return 'UNKNOWN';
    return weapon
        .replace(/^ESPR_/, '')
        .replace(/^GLSN_/, '')
        .replace(/_\d+$/, '')
        .replace(/_/g, ' ')
        .toUpperCase();
}

// Format zone name
function formatZone(zone) {
    if (!zone || zone === 'Unknown') return 'UNKNOWN';
    return zone
        .replace(/^GLSN_/, '')
        .replace(/_\d+$/, '')
        .replace(/_/g, ' ')
        .toUpperCase();
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return dateStr + ' ' + timeStr;
}

// Populate filter options
function populateFilters() {
    populateWeaponFilter();
    populateZoneFilter();
    populateDamageFilter();
}

function populateWeaponFilter() {
    // Get unique formatted weapon names (after removing IDs)
    const weaponMap = new Map();
    allKills.forEach(k => {
        const rawWeapon = k.weapon || 'Unknown';
        const formattedWeapon = formatWeapon(rawWeapon);
        if (!weaponMap.has(formattedWeapon)) {
            weaponMap.set(formattedWeapon, []);
        }
        weaponMap.get(formattedWeapon).push(rawWeapon);
    });
    
    const weapons = [...weaponMap.keys()].sort();
    const weaponOptions = document.getElementById('weaponFilterOptions');
    
    if (weaponOptions) {
        weaponOptions.innerHTML = '<div class="select-option" onclick="selectOption(\'weaponFilter\', \'\', \'ALL WEAPONS\')">ALL WEAPONS</div>' +
            weapons.map(w => {
                const rawWeapons = weaponMap.get(w);
                const filterValue = JSON.stringify(rawWeapons).replace(/"/g, '&quot;');
                return '<div class="select-option" onclick=\'selectOption("weaponFilter", ' + filterValue + ', "' + escapeHtml(w) + '")\'>' + escapeHtml(w) + '</div>';
            }).join('');
    }
}

function populateZoneFilter() {
    // Get unique formatted zone names
    const zoneMap = new Map();
    allKills.forEach(k => {
        const rawZone = k.zone || 'Unknown';
        const formattedZone = formatZone(rawZone);
        if (!zoneMap.has(formattedZone)) {
            zoneMap.set(formattedZone, []);
        }
        zoneMap.get(formattedZone).push(rawZone);
    });
    
    const zones = [...zoneMap.keys()].sort();
    const zoneOptions = document.getElementById('zoneFilterOptions');
    
    if (zoneOptions) {
        zoneOptions.innerHTML = '<div class="select-option" onclick="selectOption(\'zoneFilter\', \'\', \'ALL ZONES\')">ALL ZONES</div>' +
            zones.map(z => {
                const rawZones = zoneMap.get(z);
                const filterValue = JSON.stringify(rawZones).replace(/"/g, '&quot;');
                return '<div class="select-option" onclick=\'selectOption("zoneFilter", ' + filterValue + ', "' + escapeHtml(z) + '")\'>' + escapeHtml(z) + '</div>';
            }).join('');
    }
}

function populateDamageFilter() {
    const damages = [...new Set(allKills.map(k => k.damageType || 'Unknown'))].sort();
    const damageOptions = document.getElementById('damageFilterOptions');
    
    if (damageOptions) {
        damageOptions.innerHTML = '<div class="select-option" onclick="selectOption(\'damageFilter\', \'\', \'ALL DAMAGE TYPES\')">ALL DAMAGE TYPES</div>' +
            damages.map(d => '<div class="select-option" onclick="selectOption(\'damageFilter\', \'' + escapeHtml(d) + '\', \'' + escapeHtml(d.toUpperCase()) + '\')">' + escapeHtml(d.toUpperCase()) + '</div>').join('');
    }
}

// Initialize filters
function initFilters() {
    // Filters are already initialized through the component system
}

// Apply filters to kills data
function applyFilters(kills) {
    return kills.filter(kill => {
        // Weapon filter - handle array of raw weapons or single weapon
        if (currentFilters.weapon) {
            if (Array.isArray(currentFilters.weapon)) {
                if (!currentFilters.weapon.includes(kill.weapon)) return false;
            } else if (kill.weapon !== currentFilters.weapon) {
                return false;
            }
        }
        
        // Zone filter - handle array of raw zones or single zone
        if (currentFilters.zone) {
            if (Array.isArray(currentFilters.zone)) {
                if (!currentFilters.zone.includes(kill.zone)) return false;
            } else if (kill.zone !== currentFilters.zone) {
                return false;
            }
        }
        
        // Damage filter
        if (currentFilters.damage && kill.damageType !== currentFilters.damage) return false;
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const searchableText = (kill.killerUser + ' ' + kill.victimUser + ' ' + formatWeapon(kill.weapon) + ' ' + formatZone(kill.zone)).toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
}

// Sort kills data
function sortKills(kills) {
    const sorted = [...kills];
    
    switch (currentFilters.sort) {
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.killTime) - new Date(b.killTime));
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.killTime) - new Date(a.killTime));
        case 'weapon':
            return sorted.sort((a, b) => formatWeapon(a.weapon).localeCompare(formatWeapon(b.weapon)));
        case 'zone':
            return sorted.sort((a, b) => formatZone(a.zone).localeCompare(formatZone(b.zone)));
        default:
            return sorted;
    }
}

// Render current view
function renderView() {
    let dataToShow = [];
    let targetElement = '';
    
    switch (currentView) {
        case 'all':
            dataToShow = allKills;
            targetElement = 'allView';
            break;
        case 'kills':
            dataToShow = profileKills;
            targetElement = 'myView';
            break;
        case 'deaths':
            dataToShow = profileDeaths;
            targetElement = 'deathsView';
            break;
    }
    
    const filteredData = applyFilters(dataToShow);
    const sortedData = sortKills(filteredData);
    
    const element = document.getElementById(targetElement);
    
    if (sortedData.length === 0) {
        element.innerHTML = '<div class="no-results">NO KILLS FOUND</div>';
        return;
    }
    
    element.innerHTML = generateKillsHTML(sortedData);
}

// Generate HTML for kills list
function generateKillsHTML(kills) {
    return kills.map((k, idx) => {
        const killerClass = k.killerUser.toLowerCase() === (profileData.inGameName || profileData.username).toLowerCase() ? 'me' : '';
        const victimClass = k.victimUser.toLowerCase() === (profileData.inGameName || profileData.username).toLowerCase() ? 'me' : '';
        
        return '<div class="kill-entry" id="kill-entry-' + idx + '" onclick="toggleKillDetails(\'kill-entry-' + idx + '\')">' +
                '<div class="kill-players">' +
                    '<span class="player-name ' + killerClass + '">' + escapeHtml(k.killerUser) + '</span>' +
                    '<span class="kill-arrow">→</span>' +
                    '<span class="player-name ' + victimClass + '">' + escapeHtml(k.victimUser) + '</span>' +
                '</div>' +
                '<div class="kill-meta">' +
                    '<span class="meta-item weapon">' + escapeHtml(formatWeapon(k.weapon)) + '</span>' +
                    '<span class="kill-time">' + formatDateTime(k.killTime) + '</span>' +
                '</div>' +
                '<div class="kill-details-expanded">' +
                    '<span class="meta-item">Zone: ' + escapeHtml(formatZone(k.zone)) + '</span>' +
                    '<span class="meta-item">Damage: ' + escapeHtml(k.damageType || 'Unknown') + '</span>' +
                '</div>' +
            '</div>';
    }).join('');
}