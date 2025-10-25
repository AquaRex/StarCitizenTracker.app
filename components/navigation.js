function generateNavigation(options = {}) {
    const {
        showBackButton = false,
        backUrl = './index.html',
        pageTitle = '',
        showLogo = true,
        logoUrl = './index.html',
        showAccountDropdown = true,
        showLeaderboard = true
    } = options;

    return `
        <nav class="top-nav">
            ${showBackButton ? `
                <div class="nav-logo no-border">
                    <button class="btn btn-icon btn-text" onclick="window.location.href='${backUrl}'" title="Go Back">
                        ← BACK
                    </button>
                    ${pageTitle ? `<span class="page-title">${pageTitle}</span>` : ''}
                </div>
            ` : showLogo ? `
                <div class="nav-logo">
                    <img src="Assets/logo.png" alt="Star Tracker" class="logo-image" id="logoImage">
                    <span class="logo-text">STAR TRACKER</span>
                </div>
            ` : ''}
            
            <div class="nav-actions">
                ${showLeaderboard && !showBackButton ? `
                    <button class="btn btn-icon btn-text" onclick="window.location.href='leaderboard.html'" title="Leaderboard">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 3v18h18"></path>
                            <path d="M7 16h3v4H7z"></path>
                            <path d="M14 8h3v12h-3z"></path>
                            <path d="M7 11h3v2H7z"></path>
                        </svg>
                        <span>LEADERBOARD</span>
                    </button>
                ` : ''}
                
                <button class="btn btn-icon" id="darkModeToggle" title="Toggle Dark Mode">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </button>
                
                ${showAccountDropdown ? `
                    <div class="nav-account">
                        <button class="btn btn-icon" id="accountBtn" title="Account">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
                        <div class="account-dropdown" id="accountDropdown">
                            <a href="#" class="dropdown-item" id="profileBtn" style="display: none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>PROFILE</span>
                            </a>
                            <a href="leaderboard.html" class="dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M7 16h3v4H7z"></path>
                                    <path d="M14 8h3v12h-3z"></path>
                                    <path d="M7 11h3v2H7z"></path>
                                </svg>
                                <span>LEADERBOARD</span>
                            </a>
                            <a href="settings.html" class="dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6m-5.2-5.2l4.2 4.2m4.2 4.2l4.2 4.2m0-12.4l-4.2 4.2M7.8 16.6l-4.2 4.2"></path>
                                </svg>
                                <span>SETTINGS</span>
                            </a>
                            <a href="#" class="dropdown-item" id="logoutBtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>LOGOUT</span>
                            </a>
                        </div>
                    </div>
                ` : `
                    <button class="btn btn-icon" onclick="window.location.href='login.html'" title="Login">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                    </button>
                `}
            </div>
        </nav>
    `;
}