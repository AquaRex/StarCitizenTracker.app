
let leaderboardData = [];
let globalStats = {
    totalKills: 0,
    totalDeaths: 0
};

function initializeLeaderboard() {
    if (typeof generateNavigation === 'undefined') {
        return;
    }
    
    initializeLeaderboardComponents();
    initDarkMode();
    initAccountDropdown();
    checkPublicProfile();
    loadLeaderboardData();
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-account')) {
            const dropdown = document.getElementById('accountDropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    });
}

function initializeLeaderboardComponents() {
    const isLoggedIn = sessionStorage.getItem('username') && sessionStorage.getItem('userId');
    
    document.getElementById('navigation-container').innerHTML = generateNavigation({
        showBackButton: false,
        backUrl: './index.html',
        pageTitle: '',
        showLogo: true,
        logoUrl: './index.html',
        showAccountDropdown: isLoggedIn,
        showLeaderboard: false,
        currentPage: 'leaderboard'
    });
}

async function loadLeaderboardData() {
    try {
        showLoading();
        let response;
        const currentUser = sessionStorage.getItem('username');
        const currentPassword = sessionStorage.getItem('password');
        
        if (currentUser && currentPassword) {
            try {
                response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.LEADERBOARD);
            } catch (error) {
                response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LEADERBOARD));
            }
        } else {
            response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LEADERBOARD));
        }
        
        if (!response.ok) {
            if (response.status === 404) {
                const mockData = generateMockLeaderboardData();
                processLeaderboardData(mockData);
                showLeaderboard();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        processLeaderboardData(data);
        showLeaderboard();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('Failed to Load Leaderboard', 'Unable to fetch leaderboard data. Please try again later.', 'error');
    }
}

function processLeaderboardData(data) {
    globalStats = {
        totalKills: 0,
        totalDeaths: 0
    };
    
    // Process each player's data
    leaderboardData = data.map(player => {
        const kills = player.totalKills || 0;
        const deaths = player.totalDeaths || 0;
        const kdRatio = deaths > 0 ? (kills / deaths) : kills;
        const bestStreak = player.bestKillstreak || calculateBestStreak(player.kills || []);
        globalStats.totalKills += kills;
        globalStats.totalDeaths += deaths;
        
        return {
            username: player.username,
            inGameName: player.inGameName || player.username,
            kills: kills,
            deaths: deaths,
            kdRatio: kdRatio,
            bestStreak: bestStreak
        };
    });
    leaderboardData.sort((a, b) => b.kdRatio - a.kdRatio);
}

function calculateBestStreak(kills) {
    if (!kills || kills.length === 0) return 0;
    
    let bestStreak = 0;
    let currentStreak = 0;
    const sortedKills = [...kills].sort((a, b) => new Date(a.killTime) - new Date(b.killTime));
    
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
    
    return bestStreak;
}

function showLoading() {
    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('leaderboardContainer').style.display = 'none';
    document.getElementById('emptyContainer').style.display = 'none';
    document.getElementById('error-container').style.display = 'none';
}

function showLeaderboard() {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('error-container').style.display = 'none';
    
    if (leaderboardData.length === 0) {
        document.getElementById('emptyContainer').style.display = 'flex';
        document.getElementById('leaderboardContainer').style.display = 'none';
        return;
    }
    
    updateGlobalStats();
    generateLeaderboardEntries();
    
    document.getElementById('emptyContainer').style.display = 'none';
    document.getElementById('leaderboardContainer').style.display = 'block';
}

function updateGlobalStats() {
    document.getElementById('globalKills').textContent = globalStats.totalKills.toLocaleString();
    document.getElementById('globalDeaths').textContent = globalStats.totalDeaths.toLocaleString();
}

function generateLeaderboardEntries() {
    const container = document.getElementById('leaderboardContainer');
    
    const entriesHTML = leaderboardData.map((player, index) => {
        const rank = index + 1;
        const rankClass = getRankClass(rank);
        const kdClass = getKDClass(player.kdRatio);
        
        return `
            <div class="leaderboard-entry" onclick="goToProfile('${escapeHtml(player.username)}')">
                <div class="leaderboard-rank ${rankClass}">${rank}</div>
                <div class="leaderboard-name">${escapeHtml(player.inGameName)}</div>
                <div class="leaderboard-stat">
                    <div class="leaderboard-stat-value">${player.kills}</div>
                    <div class="leaderboard-stat-label">Kills</div>
                </div>
                <div class="leaderboard-stat">
                    <div class="leaderboard-stat-value">${player.deaths}</div>
                    <div class="leaderboard-stat-label">Deaths</div>
                </div>
                <div class="leaderboard-kd ${kdClass}">${player.kdRatio.toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = entriesHTML;
}

function getRankClass(rank) {
    switch (rank) {
        case 1: return 'rank-1';
        case 2: return 'rank-2';
        case 3: return 'rank-3';
        default: return '';
    }
}

function getKDClass(kdRatio) {
    if (kdRatio >= 3.0) return 'kd-excellent';
    if (kdRatio >= 2.0) return 'kd-good';
    if (kdRatio >= 1.0) return 'kd-average';
    return 'kd-below';
}

function goToProfile(username) {
    window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
}

function showError(title, message, iconType = 'error') {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('leaderboardContainer').style.display = 'none';
    document.getElementById('emptyContainer').style.display = 'none';

    document.getElementById('error-container').innerHTML = generateErrorMessage({
        title: title,
        message: message,
        iconType: iconType,
        showRetryButton: true,
        retryAction: 'loadLeaderboardData()'
    });
    document.getElementById('error-container').style.display = 'block';
}

function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
}

function initAccountDropdown() {
    const accountBtn = document.getElementById('accountBtn');
    const accountDropdown = document.getElementById('accountDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    if (!accountBtn) return;
    
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountDropdown.classList.toggle('show');
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function refreshLeaderboard() {
    loadLeaderboardData();
}

function generateMockLeaderboardData() {
    return [
        {
            username: 'AquaRex',
            inGameName: 'AquaRex',
            totalKills: 47,
            totalDeaths: 12,
            bestKillstreak: 8,
            kills: []
        },
        {
            username: 'SpaceWolf',
            inGameName: 'SpaceWolf-Alpha',
            totalKills: 89,
            totalDeaths: 31,
            bestKillstreak: 12,
            kills: []
        },
        {
            username: 'VoidHunter',
            inGameName: 'VoidHunter',
            totalKills: 156,
            totalDeaths: 67,
            bestKillstreak: 15,
            kills: []
        },
        {
            username: 'StellarPilot',
            inGameName: 'StellarPilot',
            totalKills: 23,
            totalDeaths: 45,
            bestKillstreak: 4,
            kills: []
        },
        {
            username: 'CrimsonAce',
            inGameName: 'CrimsonAce',
            totalKills: 78,
            totalDeaths: 22,
            bestKillstreak: 18,
            kills: []
        },
        {
            username: 'NebulaRider',
            inGameName: 'NebulaRider',
            totalKills: 34,
            totalDeaths: 56,
            bestKillstreak: 6,
            kills: []
        },
        {
            username: 'QuantumStrike',
            inGameName: 'QuantumStrike',
            totalKills: 124,
            totalDeaths: 38,
            bestKillstreak: 22,
            kills: []
        },
        {
            username: 'CosmicReaper',
            inGameName: 'CosmicReaper',
            totalKills: 67,
            totalDeaths: 29,
            bestKillstreak: 11,
            kills: []
        }
    ];
}

window.refreshLeaderboard = refreshLeaderboard;

window.addEventListener('componentsReady', initializeLeaderboard);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeLeaderboard, 50);
    });
} else {
    setTimeout(initializeLeaderboard, 10);
}