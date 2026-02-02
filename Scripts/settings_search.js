document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.getElementById("search-form");
    const searchEngineSelect = document.getElementById("search-engine");
    const searchBox = document.querySelector(".search-box");
    const toggleSearchCheckbox = document.getElementById("toggle-search");
    const saveButton = document.getElementById("save-settings");

    const existingSearchEngine = localStorage.getItem("searchEngine");
    const searchBarVisible = localStorage.getItem("searchBarVisible") !== 'false';

    if (existingSearchEngine) {
        searchEngineSelect.value = existingSearchEngine;
        searchForm.action = existingSearchEngine;
    }

    searchBox.style.display = searchBarVisible ? 'block' : 'none';
    toggleSearchCheckbox.checked = searchBarVisible;

    saveButton.addEventListener("click", () => {
        const newSearchEngine = searchEngineSelect.value;
        const newSearchVisible = toggleSearchCheckbox.checked;

        localStorage.setItem("searchEngine", newSearchEngine);
        localStorage.setItem("searchBarVisible", newSearchVisible);

        searchForm.action = newSearchEngine;
        searchBox.style.display = newSearchVisible ? 'block' : 'none';
    });
});