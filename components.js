
const componentFiles = [
    './components/navigation.js',
    './components/playerBar.js',
    './components/statsSection.js',
    './components/viewButtons.js',
    './components/filterPanel.js',
    './components/contentArea.js',
    './components/errorMessage.js',
    './components/activityItem.js'
];
function loadComponents() {
    return Promise.all(
        componentFiles.map(file => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = file;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        })
    );
}
if (typeof window !== 'undefined') {
    loadComponents().then(() => {
        console.log('All components loaded successfully');
        // Dispatch a custom event when components are ready
        window.dispatchEvent(new CustomEvent('componentsReady'));
    }).catch(error => {
        console.error('Error loading components:', error);
    });
}