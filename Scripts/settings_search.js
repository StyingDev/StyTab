document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.getElementById("search-form");
    const searchEngineSelect = document.getElementById("search-engine");
    const saveButton = document.getElementById("save-settings");

    // search bar visibility lives in settings_visibility.js, not here
    const existingSearchEngine = localStorage.getItem("searchEngine");
    if (existingSearchEngine) {
        searchEngineSelect.value = existingSearchEngine;
        searchForm.action = existingSearchEngine;
    }

    saveButton.addEventListener("click", () => {
        const newSearchEngine = searchEngineSelect.value;
        localStorage.setItem("searchEngine", newSearchEngine);
        searchForm.action = newSearchEngine;
    });
});
