function generateContentArea(options = {}) {
    const {
        isMainPage = true
    } = options;

    if (isMainPage) {
        return `
            <div class="content-area">
                <div id="allView" class="view-content active"></div>
                <div id="myKillsView" class="view-content"></div>
                <div id="myDeathsView" class="view-content"></div>
            </div>
        `;
    } else {
        // Profile page uses same structure but different IDs for compatibility
        return `
            <div class="content-area">
                <div id="allView" class="view-content active"></div>
                <div id="myView" class="view-content" style="display: none;"></div>
                <div id="deathsView" class="view-content" style="display: none;"></div>
            </div>
        `;
    }
}