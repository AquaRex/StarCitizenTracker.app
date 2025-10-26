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
    
    // Password change handlers
    document.getElementById('changePasswordBtn').addEventListener('click', openPasswordModal);
    document.getElementById('cancelPasswordBtn').addEventListener('click', closePasswordModal);
    document.getElementById('savePasswordBtn').addEventListener('click', changePassword);
    
    // In-game name change handlers
    document.getElementById('editInGameNameBtn').addEventListener('click', openInGameNameModal);
    document.getElementById('cancelInGameNameBtn').addEventListener('click', closeInGameNameModal);
    document.getElementById('saveInGameNameBtn').addEventListener('click', updateInGameName);
    
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

// Password Modal Functions
function openPasswordModal() {
    document.getElementById('passwordModal').style.display = 'flex';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    hideMessage(document.getElementById('passwordMessage'));
}

function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const messageDiv = document.getElementById('passwordMessage');
    const saveBtn = document.getElementById('savePasswordBtn');
    
    hideMessage(messageDiv);
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage(messageDiv, 'New password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showMessage(messageDiv, 'New passwords do not match', 'error');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'CHANGING...';
    
    try {
        const response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            showMessage(messageDiv, 'Password changed successfully!', 'success');
            
            setTimeout(() => {
                closePasswordModal();
            }, 2000);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
            showMessage(messageDiv, errorData.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        showMessage(messageDiv, 'Network error. Please try again.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'CHANGE PASSWORD';
    }
}

// In-Game Name Modal Functions
function openInGameNameModal() {
    const currentInGameName = sessionStorage.getItem('inGameName') || '';
    document.getElementById('newInGameName').value = currentInGameName;
    document.getElementById('inGameNameModal').style.display = 'flex';
    hideMessage(document.getElementById('inGameNameMessage'));
}

function closeInGameNameModal() {
    document.getElementById('inGameNameModal').style.display = 'none';
}

async function updateInGameName() {
    const newInGameName = document.getElementById('newInGameName').value.trim();
    const messageDiv = document.getElementById('inGameNameMessage');
    const saveBtn = document.getElementById('saveInGameNameBtn');
    
    hideMessage(messageDiv);
    
    if (!newInGameName) {
        showMessage(messageDiv, 'In-game name cannot be empty', 'error');
        return;
    }
    
    if (newInGameName.length > 100) {
        showMessage(messageDiv, 'In-game name is too long (max 100 characters)', 'error');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'SAVING...';
    
    try {
        const response = await makeSecureApiRequest(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, {
            method: 'POST',
            body: JSON.stringify({
                inGameName: newInGameName
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update session storage and display
            sessionStorage.setItem('inGameName', data.inGameName);
            document.getElementById('inGameNameDisplay').textContent = data.inGameName;
            
            showMessage(messageDiv, 'In-game name updated successfully!', 'success');
            
            setTimeout(() => {
                closeInGameNameModal();
            }, 2000);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update in-game name' }));
            showMessage(messageDiv, errorData.message || 'Failed to update in-game name', 'error');
        }
    } catch (error) {
        showMessage(messageDiv, 'Network error. Please try again.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE';
    }
}

// Helper functions for messages
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `form-message show ${type}`;
}

function hideMessage(element) {
    element.className = 'form-message';
    element.textContent = '';
}

