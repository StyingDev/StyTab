document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('open-startpage');

    button.addEventListener('click', function() {
        // Open a new tab with the extension's startpage.html
        const newTabUrl = chrome.runtime.getURL('startpage.html');
        openNewTab(newTabUrl);
    });
});

function openNewTab(url) {
    // Open the new tab with the extension's startpage.html
    chrome.tabs.create({ url: url });
}

document.getElementById('github-button').addEventListener('click', function() {
    window.open('https://github.com/StyingDev/StyTab', '_blank');
});