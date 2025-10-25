function generateViewButtons(options = {}) {
    const {
        showKillsButton = true,
        showDeathsButton = true,
        showAllButton = true,
        activeView = 'all',
        isProfile = false
    } = options;

    if (isProfile) {
        return `
            <div class="view-buttons">
                ${showAllButton ? `<button class="view-btn ${activeView === 'all' ? 'active' : ''}" id="allViewBtn">ALL KILLS</button>` : ''}
                ${showKillsButton ? `<button class="view-btn ${activeView === 'kills' ? 'active' : ''}" id="myViewBtn">THEIR KILLS</button>` : ''}
                ${showDeathsButton ? `<button class="view-btn ${activeView === 'deaths' ? 'active' : ''}" id="deathsViewBtn">THEIR DEATHS</button>` : ''}
            </div>
        `;
    } else {
        return `
            <div class="view-buttons">
                ${showAllButton ? `<button class="view-btn ${activeView === 'all' ? 'active' : ''}" onclick="switchView('all')" id="viewAll">ALL KILLS</button>` : ''}
                ${showKillsButton ? `<button class="view-btn ${activeView === 'myKills' ? 'active' : ''}" onclick="switchView('myKills')" id="viewMyKills">MY KILLS</button>` : ''}
                ${showDeathsButton ? `<button class="view-btn ${activeView === 'myDeaths' ? 'active' : ''}" onclick="switchView('myDeaths')" id="viewMyDeaths">MY DEATHS</button>` : ''}
            </div>
        `;
    }
}