function generateStatsSection(options = {}) {
    const {
        kills = 0,
        deaths = 0,
        favoriteWeapon = 'None',
        favoriteZone = 'None',
        bestKillstreak = 0
    } = options;

    const kdr = deaths > 0 ? (kills / deaths).toFixed(2) : kills > 0 ? kills.toFixed(2) : '0.00';

    return `
        <div class="stats-section">
            <div class="main-stats">
                <div class="stat-box">
                    <div class="stat-label">KILLS</div>
                    <div class="stat-value" id="stat-kills">${kills}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">DEATHS</div>
                    <div class="stat-value" id="stat-deaths">${deaths}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">K/D RATIO</div>
                    <div class="stat-value" id="stat-kd">${kdr}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">BEST KILLSTREAK</div>
                    <div class="stat-value" id="stat-streak">${bestKillstreak}</div>
                </div>
            </div>
            <div class="sub-stat">
                <span class="sub-stat-label">MOST USED WEAPON:</span>
                <span class="sub-stat-value" id="stat-weapon">${favoriteWeapon}</span>
            </div>
        </div>
    `;
}