function generatePlayerBar(options = {}) {
    const {
        username = '',
        inGameName = '',
        isViewingProfile = false
    } = options;

    const displayName = inGameName || username;
    const label = isViewingProfile ? 'VIEWING PROFILE' : 'CURRENT PLAYER';

    return `
        <div class="player-bar">
            <span class="label">${label}</span>
            <span class="value" id="playerName">${displayName.toUpperCase()}</span>
        </div>
    `;
}