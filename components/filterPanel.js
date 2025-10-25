function generateFilterPanel(options = {}) {
    const {
        isMainPage = true,
        searchPlaceholder = "SEARCH PLAYER..."
    } = options;

    return `
        <div class="filter-panel active" id="filterPanel">
            <div class="filter-row">
                <div class="search-container">
                    <input type="text" id="searchInput" class="search-input" placeholder="${isMainPage ? 'SEARCH PLAYER...' : 'SEARCH KILLS...'}" ${isMainPage ? 'oninput="handleSearch()"' : ''}>
                </div>
            </div>
            <div class="filter-row">
                <div class="custom-select" id="weaponFilterContainer">
                    <div class="select-display" onclick="toggleDropdown('weaponFilter')">
                        <span id="weaponFilterText">ALL WEAPONS</span>
                    </div>
                    <div class="select-options" id="weaponFilterOptions"></div>
                </div>
                <div class="custom-select" id="zoneFilterContainer">
                    <div class="select-display" onclick="toggleDropdown('zoneFilter')">
                        <span id="zoneFilterText">ALL ZONES</span>
                    </div>
                    <div class="select-options" id="zoneFilterOptions"></div>
                </div>
                <div class="custom-select" id="damageFilterContainer">
                    <div class="select-display" onclick="toggleDropdown('damageFilter')">
                        <span id="damageFilterText">ALL DAMAGE TYPES</span>
                    </div>
                    <div class="select-options" id="damageFilterOptions"></div>
                </div>
            </div>
            <div class="filter-row">
                <div class="custom-select" id="sortOptionContainer">
                    <div class="select-display" onclick="toggleDropdown('sortOption')">
                        <span id="sortOptionText">NEWEST FIRST</span>
                    </div>
                    <div class="select-options" id="sortOptionOptions">
                        <div class="select-option" onclick="selectOption('sortOption', 'date-desc', 'NEWEST FIRST')">NEWEST FIRST</div>
                        <div class="select-option" onclick="selectOption('sortOption', 'date-asc', 'OLDEST FIRST')">OLDEST FIRST</div>
                        <div class="select-option" onclick="selectOption('sortOption', 'killer', 'SORT BY KILLER')">SORT BY KILLER</div>
                        <div class="select-option" onclick="selectOption('sortOption', 'victim', 'SORT BY VICTIM')">SORT BY VICTIM</div>
                    </div>
                </div>
                <button class="reset-filter-btn" onclick="resetFilters()">RESET FILTERS</button>
            </div>
        </div>
    `;
}