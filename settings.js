// Settings Page JavaScript

const username = sessionStorage.getItem('username');
const userId = sessionStorage.getItem('userId');
const inGameName = sessionStorage.getItem('inGameName');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!username || !userId) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize dark mode
    initDarkMode();
    
    // Initialize account dropdown
    initAccountDropdown();
    
    // Load user data
    loadUserData();
    
    // Load settings from API
    loadSettingsFromAPI();
    
    // Save button handler
    document.getElementById('saveBtn').addEventListener('click', saveSettings);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-account')) {
            document.getElementById('accountDropdown').classList.remove('show');
        }
    });
});

// Load user data
function loadUserData() {
    document.getElementById('usernameDisplay').textContent = username;
    document.getElementById('inGameNameDisplay').textContent = inGameName || username;
}

// Load settings from API
async function loadSettingsFromAPI() {
    try {
        const response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.AUTH.VALIDATE, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.isValid) {
                const isPublic = data.publicProfile || false;
                document.getElementById('publicProfileToggle').checked = isPublic;
                
                // Show profile button if public profile is enabled
                const profileBtn = document.getElementById('profileBtn');
                if (profileBtn && data.publicProfile) {
                    profileBtn.style.display = 'flex';
                }
            } else {
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to localStorage for backward compatibility
        const publicProfile = localStorage.getItem(`settings_${userId}_publicProfile`) === 'true';
        document.getElementById('publicProfileToggle').checked = publicProfile;
    }
}

// Save settings
async function saveSettings() {
    const publicProfile = document.getElementById('publicProfileToggle').checked;
    const saveMessage = document.getElementById('saveMessage');
    const saveBtn = document.getElementById('saveBtn');
    
    // Disable button during save
    saveBtn.disabled = true;
    saveBtn.textContent = 'SAVING...';
    
    try {
        const response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.AUTH.UPDATE_SETTINGS, {
            method: 'POST',
            body: JSON.stringify({
                publicProfile: publicProfile
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Also save to localStorage as backup
            localStorage.setItem(`settings_${userId}_publicProfile`, publicProfile);
            
            // Update profile button visibility
            const profileBtn = document.getElementById('profileBtn');
            if (profileBtn) {
                profileBtn.style.display = publicProfile ? 'flex' : 'none';
            }
            
            // Show success message
            saveMessage.textContent = 'SETTINGS SAVED SUCCESSFULLY';
            saveMessage.className = 'save-message show success';
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || 'Failed to save settings');
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        saveMessage.textContent = `FAILED TO SAVE: ${error.message}`;
        saveMessage.className = 'save-message show error';
    } finally {
        // Re-enable button
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE CHANGES';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            saveMessage.classList.remove('show');
        }, 3000);
    }
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

// Account Dropdown
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
            if (username) {
                window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
            }
        });
    }
}
