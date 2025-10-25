function generateActivityItem(activity, options = {}) {
    const {
        showFullDetails = true,
        timeFormat = 'full'
    } = options;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        if (timeFormat === 'short') {
            return date.toLocaleTimeString();
        }
        return date.toLocaleString();
    };

    const formatWeapon = (weapon) => {
        if (!weapon) return 'Unknown';
        return weapon.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatZone = (zone) => {
        if (!zone) return 'Unknown';
        return zone.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const isKill = activity.victimName && activity.victimName !== activity.playerName;
    const isDeath = activity.victimName && activity.victimName === activity.playerName;

    return `
        <div class="activity-item ${isKill ? 'kill' : isDeath ? 'death' : 'unknown'}">
            <div class="activity-header">
                <div class="activity-type">${isKill ? 'KILL' : isDeath ? 'DEATH' : 'EVENT'}</div>
                <div class="activity-time">${formatDateTime(activity.timestamp)}</div>
            </div>
            
            ${showFullDetails ? `
                <div class="activity-details">
                    <div class="activity-participants">
                        ${isKill ? `
                            <span class="killer">${activity.playerName}</span>
                            <span class="action">eliminated</span>
                            <span class="victim">${activity.victimName}</span>
                        ` : isDeath ? `
                            <span class="killer">${activity.killerName || 'Unknown'}</span>
                            <span class="action">eliminated</span>
                            <span class="victim">${activity.playerName}</span>
                        ` : `
                            <span class="participant">${activity.playerName}</span>
                        `}
                    </div>
                    
                    <div class="activity-metadata">
                        <div class="metadata-item">
                            <span class="metadata-label">Weapon:</span>
                            <span class="metadata-value">${formatWeapon(activity.weapon)}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Zone:</span>
                            <span class="metadata-value">${formatZone(activity.zone)}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}