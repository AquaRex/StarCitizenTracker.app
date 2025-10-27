const username = sessionStorage.getItem('username');
const userId = sessionStorage.getItem('userId');
const inGameName = sessionStorage.getItem('inGameName');
const PLAYER_NAME = inGameName || 'AquaRex';
let allKills = [];
let myKills = [];
let myDeaths = [];
let currentView = 'all';
let currentFilters = {
    weapon: '',
    zone: '',
    killType: '',
    sort: 'date-desc',
    search: ''
};

function initializeComponents() {
    document.getElementById('navigation-container').innerHTML = generateNavigation({
        showLogo: true,
        logoUrl: './index.html',
        currentPage: 'home'
    });
    document.getElementById('stats-section-container').innerHTML = generateStatsSection();
    document.getElementById('view-buttons-container').innerHTML = generateViewButtons({
        showKillsButton: true,
        showDeathsButton: true,
        showAllButton: true,
        activeView: 'all'
    });
    document.getElementById('filter-panel-container').innerHTML = generateFilterPanel({
        isMainPage: true
    });
    document.getElementById('content-area-container').innerHTML = generateContentArea({
        isMainPage: true
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!username || !userId) {
        // Redirect to leaderboard (public landing page) if not authenticated
        window.location.href = 'leaderboard.html';
        return;
    }
});

// Main initialization function
function initializeApp() {
    // Check if components are available
    if (typeof generateNavigation === 'undefined') {
        return;
    }
    
    // Initialize components
    initializeComponents();
    
    // Initialize dark mode
    initDarkMode();
    
    // Initialize account dropdown
    initAccountDropdown();
    
    // Check public profile status and show profile button if enabled
    checkPublicProfile();
    
    loadData();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select.open').forEach(select => {
                select.classList.remove('open');
            });
        }
        if (!e.target.closest('.nav-account')) {
            document.getElementById('accountDropdown').classList.remove('show');
        }
    });
}

// Initialize when components are ready
window.addEventListener('componentsReady', initializeApp);

// Also try to initialize immediately in case components are already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure components.js has executed
        setTimeout(initializeApp, 50);
    });
} else {
    // Document already loaded, try immediately
    setTimeout(initializeApp, 10);
}

// Load all data from API
async function loadData() {
    try {
        // Use secure API request
        const response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.KILLS);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to load kills:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        allKills = await response.json();
        
        // Filter for player
        myKills = allKills.filter(k => k.killerUser.toLowerCase() === PLAYER_NAME.toLowerCase());
        myDeaths = allKills.filter(k => k.victimUser.toLowerCase() === PLAYER_NAME.toLowerCase());
        
        // Update stats
        updateStats();
        
        // Populate filters
        populateFilters();
        
        // Show initial view
        renderView();
        
    } catch (error) {
        console.error('Error loading data:', error);
        const errorDiv = createSafeElement('div', 'FAILED TO LOAD DATA', 'error');
        const allView = document.getElementById('allView');
        if (allView) {
            allView.innerHTML = '';
            allView.appendChild(errorDiv);
        }
    }
}

// Update statistics
function updateStats() {
    document.getElementById('stat-kills').textContent = myKills.length;
    document.getElementById('stat-deaths').textContent = myDeaths.length;
    const ratio = myDeaths.length === 0 ? myKills.length : (myKills.length / myDeaths.length);
    document.getElementById('stat-kd').textContent = ratio.toFixed(2);
    
    // Calculate best killstreak (kills within 30 seconds of each other)
    let bestStreak = 0;
    let currentStreak = 0;
    
    if (myKills.length > 0) {
        // Sort kills by time
        const sortedKills = [...myKills].sort((a, b) => new Date(a.killTime) - new Date(b.killTime));
        
        currentStreak = 1;
        bestStreak = 1;
        
        for (let i = 1; i < sortedKills.length; i++) {
            const prevTime = new Date(sortedKills[i - 1].killTime);
            const currTime = new Date(sortedKills[i].killTime);
            const diffSeconds = (currTime - prevTime) / 1000;
            
            if (diffSeconds <= 30) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
    }
    
    document.getElementById('stat-streak').textContent = bestStreak;
    
    // Calculate most used weapon
    const weaponCounts = {};
    myKills.forEach(k => {
        const weapon = k.weapon || 'Unknown';
        weaponCounts[weapon] = (weaponCounts[weapon] || 0) + 1;
    });
    
    let mostUsedWeapon = 'None';
    let maxCount = 0;
    for (const [weapon, count] of Object.entries(weaponCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostUsedWeapon = weapon;
        }
    }
    
    document.getElementById('stat-weapon').textContent = formatWeapon(mostUsedWeapon);
}

// Populate filter dropdowns
function populateFilters() {
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
    
    weaponOptions.innerHTML = '';
    
    const allOption = createSafeElement('div', 'ALL WEAPONS', 'select-option');
    allOption.onclick = () => selectOption('weaponFilter', '', 'ALL WEAPONS');
    weaponOptions.appendChild(allOption);
    
    weapons.forEach(w => {
        const rawWeapons = weaponMap.get(w);
        const option = createSafeElement('div', w, 'select-option');
        option.onclick = () => selectOption('weaponFilter', JSON.stringify(rawWeapons), w);
        weaponOptions.appendChild(option);
    });
    
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
    
    zoneOptions.innerHTML = '';
    
    const allZoneOption = createSafeElement('div', 'ALL ZONES', 'select-option');
    allZoneOption.onclick = () => selectOption('zoneFilter', '', 'ALL ZONES');
    zoneOptions.appendChild(allZoneOption);
    
    zones.forEach(z => {
        const rawZones = zoneMap.get(z);
        const option = createSafeElement('div', z, 'select-option');
        option.onclick = () => selectOption('zoneFilter', JSON.stringify(rawZones), z);
        zoneOptions.appendChild(option);
    });
}

// Handle search input
function handleSearch() {
    const searchValue = document.getElementById('searchInput').value;
    currentFilters.search = searchValue;
    renderView();
}

// Toggle dropdown
function toggleDropdown(filterId) {
    const container = document.getElementById(filterId + 'Container');
    const wasOpen = container.classList.contains('open');
    
    // Close all dropdowns
    document.querySelectorAll('.custom-select.open').forEach(select => {
        select.classList.remove('open');
    });
    
    // Toggle current dropdown
    if (!wasOpen) {
        container.classList.add('open');
    }
}

// Select option from dropdown
function selectOption(filterId, value, displayText) {
    // Update display text
    document.getElementById(filterId + 'Text').textContent = displayText;
    
    // Close dropdown
    document.getElementById(filterId + 'Container').classList.remove('open');
    
    // Parse JSON string values back to arrays
    let parsedValue = value;
    if (value && typeof value === 'string' && value.startsWith('[')) {
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
            parsedValue = value;
        }
    }
    
    // Update filter value
    if (filterId === 'weaponFilter') {
        currentFilters.weapon = parsedValue;
    } else if (filterId === 'zoneFilter') {
        currentFilters.zone = parsedValue;
    } else if (filterId === 'killTypeFilter') {
        currentFilters.killType = parsedValue;
    } else if (filterId === 'sortOption') {
        currentFilters.sort = parsedValue;
    }
    
    // Apply filters
    applyFilters();
}

// Switch view
function switchView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
    
    // Filter panel is always visible now
    
    // Render view
    renderView();
}

// Render current view
function renderView() {
    // Hide all views
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    
    if (currentView === 'all') {
        document.getElementById('allView').classList.add('active');
        applyFilters();
    } else if (currentView === 'myKills') {
        document.getElementById('myKillsView').classList.add('active');
        applyFiltersGrouped(myKills, 'victimUser', 'myKillsView');
    } else if (currentView === 'myDeaths') {
        document.getElementById('myDeathsView').classList.add('active');
        applyFiltersGrouped(myDeaths, 'killerUser', 'myDeathsView');
    }
}

// Apply filters to all kills view
function applyFilters() {
    let filtered = allKills.filter(k => {
        const weaponMatch = !currentFilters.weapon || 
            (Array.isArray(currentFilters.weapon) ? 
                currentFilters.weapon.includes(k.weapon || 'Unknown') : 
                (k.weapon || 'Unknown') === currentFilters.weapon);
        const zoneMatch = !currentFilters.zone || 
            (Array.isArray(currentFilters.zone) ? 
                currentFilters.zone.includes(k.zone || 'Unknown') : 
                (k.zone || 'Unknown') === currentFilters.zone);
        const killTypeMatch = !currentFilters.killType || 
            (currentFilters.killType === 'player' && (k.isPlayer === true || k.isPlayer === 1)) ||
            (currentFilters.killType === 'npc' && (k.isPlayer === false || k.isPlayer === 0));
        const searchMatch = !currentFilters.search || 
            k.killerUser.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            k.victimUser.toLowerCase().includes(currentFilters.search.toLowerCase());
        return weaponMatch && zoneMatch && killTypeMatch && searchMatch;
    });
    
    // Sort
    switch (currentFilters.sort) {
        case 'date-desc':
            filtered.sort((a, b) => new Date(b.killTime) - new Date(a.killTime));
            break;
        case 'date-asc':
            filtered.sort((a, b) => new Date(a.killTime) - new Date(b.killTime));
            break;
        case 'killer':
            filtered.sort((a, b) => a.killerUser.localeCompare(b.killerUser));
            break;
        case 'victim':
            filtered.sort((a, b) => a.victimUser.localeCompare(b.victimUser));
            break;
    }
    
    displayAllKills(filtered);
}

// Apply filters to grouped views
function applyFiltersGrouped(kills, groupBy, containerId) {
    // Filter
    let filtered = kills.filter(k => {
        const weaponMatch = !currentFilters.weapon || 
            (Array.isArray(currentFilters.weapon) ? 
                currentFilters.weapon.includes(k.weapon || 'Unknown') : 
                (k.weapon || 'Unknown') === currentFilters.weapon);
        const zoneMatch = !currentFilters.zone || 
            (Array.isArray(currentFilters.zone) ? 
                currentFilters.zone.includes(k.zone || 'Unknown') : 
                (k.zone || 'Unknown') === currentFilters.zone);
        const killTypeMatch = !currentFilters.killType || 
            (currentFilters.killType === 'player' && (k.isPlayer === true || k.isPlayer === 1)) ||
            (currentFilters.killType === 'npc' && (k.isPlayer === false || k.isPlayer === 0));
        const searchMatch = !currentFilters.search || 
            k.killerUser.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            k.victimUser.toLowerCase().includes(currentFilters.search.toLowerCase());
        return weaponMatch && zoneMatch && killTypeMatch && searchMatch;
    });
    
    // Sort kills within each group
    switch (currentFilters.sort) {
        case 'date-desc':
            filtered.sort((a, b) => new Date(b.killTime) - new Date(a.killTime));
            break;
        case 'date-asc':
            filtered.sort((a, b) => new Date(a.killTime) - new Date(b.killTime));
            break;
        case 'killer':
            filtered.sort((a, b) => a.killerUser.localeCompare(b.killerUser));
            break;
        case 'victim':
            filtered.sort((a, b) => a.victimUser.localeCompare(b.victimUser));
            break;
    }
    
    renderGroupedView(filtered, groupBy, containerId);
}

// Reset filters
function resetFilters() {
    currentFilters = {
        weapon: '',
        zone: '',
        killType: '',
        sort: 'date-desc',
        search: ''
    };
    
    document.getElementById('weaponFilterText').textContent = 'ALL WEAPONS';
    document.getElementById('zoneFilterText').textContent = 'ALL ZONES';
    document.getElementById('killTypeFilterText').textContent = 'ALL KILLS';
    document.getElementById('sortOptionText').textContent = 'NEWEST FIRST';
    document.getElementById('searchInput').value = '';
    
    renderView();
}

function createKillEntryElement(k, idx) {
    const killerClass = k.killerUser.toLowerCase() === PLAYER_NAME.toLowerCase() ? 'me' : '';
    const victimClass = k.victimUser.toLowerCase() === PLAYER_NAME.toLowerCase() ? 'me' : '';
    
    const killEntry = document.createElement('div');
    killEntry.className = 'kill-entry';
    killEntry.id = `kill-entry-${idx}`;
    killEntry.onclick = () => toggleKillDetails(`kill-entry-${idx}`);
    
    const playersDiv = document.createElement('div');
    playersDiv.className = 'kill-players';
    
    const killerSpan = createSafeElement('span', k.killerUser, `player-name ${killerClass}`);
    const arrowSpan = createSafeElement('span', '→', 'kill-arrow');
    const victimSpan = createSafeElement('span', k.victimUser, `player-name ${victimClass}`);
    
    playersDiv.appendChild(killerSpan);
    playersDiv.appendChild(arrowSpan);
    playersDiv.appendChild(victimSpan);
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'kill-meta';
    
    const weaponSpan = createSafeElement('span', formatWeapon(k.weapon), 'meta-item weapon');
    const timeSpan = createSafeElement('span', formatDateTime(k.killTime), 'kill-time');
    
    metaDiv.appendChild(weaponSpan);
    metaDiv.appendChild(timeSpan);
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'kill-details-expanded';
    
    const zoneSpan = createSafeElement('span', `Zone: ${formatZone(k.zone)}`, 'meta-item');
    const damageSpan = createSafeElement('span', `Damage: ${k.damageType || 'Unknown'}`, 'meta-item');
    
    detailsDiv.appendChild(zoneSpan);
    detailsDiv.appendChild(damageSpan);
    
    killEntry.appendChild(playersDiv);
    killEntry.appendChild(metaDiv);
    killEntry.appendChild(detailsDiv);
    
    return killEntry;
}

// Render all kills (flat list)
function displayAllKills(kills) {
    const container = document.getElementById('allView');
    
    if (kills.length === 0) {
        const noKillsDiv = createSafeElement('div', 'NO KILLS FOUND', 'loading');
        container.innerHTML = '';
        container.appendChild(noKillsDiv);
        return;
    }
    
    container.innerHTML = '';
    kills.forEach((k, idx) => {
        const killEntryElement = createKillEntryElement(k, idx);
        container.appendChild(killEntryElement);
    });
}

function createGroupKillElement(k, groupIndex, killIndex, containerId) {
    const killEntry = document.createElement('div');
    killEntry.className = 'group-kill-entry';
    killEntry.id = `group-kill-${containerId}-${groupIndex}-${killIndex}`;
    killEntry.onclick = () => toggleKillDetails(`group-kill-${containerId}-${groupIndex}-${killIndex}`);
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'kill-meta';
    
    const weaponSpan = createSafeElement('span', formatWeapon(k.weapon), 'meta-item weapon');
    metaDiv.appendChild(weaponSpan);
    
    const timeSpan = createSafeElement('span', formatDateTime(k.killTime), 'kill-time');
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'kill-details-expanded';
    
    const zoneSpan = createSafeElement('span', `Zone: ${formatZone(k.zone)}`, 'meta-item');
    const damageSpan = createSafeElement('span', `Damage: ${k.damageType || 'Unknown'}`, 'meta-item');
    
    detailsDiv.appendChild(zoneSpan);
    detailsDiv.appendChild(damageSpan);
    
    killEntry.appendChild(metaDiv);
    killEntry.appendChild(timeSpan);
    killEntry.appendChild(detailsDiv);
    
    return killEntry;
}

function createPlayerGroupElement(group, groupIndex, containerId) {
    const playerGroup = document.createElement('div');
    playerGroup.className = 'player-group';
    playerGroup.id = `group-${containerId}-${groupIndex}`;
    
    const header = document.createElement('div');
    header.className = 'player-group-header';
    header.onclick = () => toggleGroup(`${containerId}-${groupIndex}`);
    
    const nameSpan = createSafeElement('span', group.name, 'player-group-name');
    const countSpan = createSafeElement('span', group.kills.length.toString(), 'player-group-count');
    
    header.appendChild(nameSpan);
    header.appendChild(countSpan);
    
    const killsContainer = document.createElement('div');
    killsContainer.className = 'player-group-kills';
    
    group.kills.forEach((k, killIndex) => {
        const killElement = createGroupKillElement(k, groupIndex, killIndex, containerId);
        killsContainer.appendChild(killElement);
    });
    
    playerGroup.appendChild(header);
    playerGroup.appendChild(killsContainer);
    
    return playerGroup;
}

// Render grouped view (My Kills / My Deaths)
function renderGroupedView(kills, groupBy, containerId) {
    const container = document.getElementById(containerId);
    
    if (kills.length === 0) {
        const noKillsDiv = createSafeElement('div', 'NO KILLS FOUND', 'loading');
        container.innerHTML = '';
        container.appendChild(noKillsDiv);
        return;
    }
    
    // Group by player
    const grouped = {};
    kills.forEach(k => {
        const player = k[groupBy];
        if (!grouped[player]) grouped[player] = [];
        grouped[player].push(k);
    });
    
    // Sort by count
    const sortedGroups = Object.entries(grouped)
        .map(([name, kills]) => ({ name, kills }))
        .sort((a, b) => b.kills.length - a.kills.length);
    
    container.innerHTML = '';
    sortedGroups.forEach((group, idx) => {
        const groupElement = createPlayerGroupElement(group, idx, containerId);
        container.appendChild(groupElement);
    });
}

// Toggle player group expansion
function toggleGroup(groupId) {
    const group = document.getElementById(`group-${groupId}`);
    group.classList.toggle('expanded');
}

// Toggle kill entry details
function toggleKillDetails(entryId) {
    const entry = document.getElementById(entryId);
    entry.classList.toggle('expanded');
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
    return `${dateStr} ${timeStr}`;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Dark Mode
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

// Initialize account dropdown
function initAccountDropdown() {
    const accountBtn = document.getElementById('accountBtn');
    const accountDropdown = document.getElementById('accountDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountDropdown.classList.toggle('show');
    });
    
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const username = sessionStorage.getItem('username');
            if (username) {
                window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
            }
        });
    }
}

// Check if user has public profile and show/hide profile button
async function checkPublicProfile() {
    try {
        const response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.AUTH.VALIDATE, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            const profileBtn = document.getElementById('profileBtn');
            if (profileBtn && data.isValid && data.publicProfile) {
                profileBtn.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error checking public profile:', error);
    }
}
