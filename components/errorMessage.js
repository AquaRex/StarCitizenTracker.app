function generateErrorMessage(options = {}) {
    const {
        title = 'Error',
        message = 'Something went wrong',
        showRetryButton = true,
        retryAction = 'retry()',
        iconType = 'warning' // 'warning', 'error', 'info'
    } = options;

    // Choose icon based on type
    let icon;
    let iconClass = '';
    
    switch (iconType) {
        case 'error':
            icon = '⚠️';
            iconClass = 'error-icon-error';
            break;
        case 'info':
            icon = 'ℹ️';
            iconClass = 'error-icon-info';
            break;
        case 'warning':
        default:
            icon = '⚠️';
            iconClass = 'error-icon-warning';
            break;
    }

    return `
        <div class="error-message-container">
            <div class="error-message">
                <div class="error-header">
                    <div class="error-icon ${iconClass}">${icon}</div>
                    <h2 class="error-title">${title}</h2>
                </div>
                <div class="error-content">
                    <p class="error-text">${message}</p>
                    ${showRetryButton ? `
                        <div class="error-actions">
                            <button onclick="${retryAction}" class="btn btn-icon btn-text retry-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                                <span>TRY AGAIN</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}