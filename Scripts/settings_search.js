document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.getElementById("search-form");
    const searchEngineSelect = document.getElementById("search-engine");
    const saveButton = document.getElementById("save-settings");

    // Search bar visibility (toggle-search / .search-box display) is owned
    // by settings_visibility.js — this file only owns the engine choice.
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
