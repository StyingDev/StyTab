document.addEventListener("DOMContentLoaded", function() {
    // Get elements
    const settingsIcon = document.getElementById("settings-icon");
    const settingsSidebar = document.getElementById("settings-sidebar");
    const closeSettingsButton = document.getElementById("close-settings");
    const saveButton = document.getElementById("save-settings");
    const modalOverlay = document.getElementById("modal-overlay");
    const searchForm = document.getElementById("search-form");
    const searchEngineSelect = document.getElementById("search-engine");
    const backgroundInput = document.getElementById("background");
    const searchBox = document.querySelector(".search-box"); // Search box element
    const toggleSearchCheckbox = document.getElementById("toggle-search"); // Checkbox for toggling search
    const toggleQuickLinksCheckbox = document.getElementById("toggle-quick-links"); // Checkbox for toggling quick links
    const quickLinksDiv = document.querySelector(".quick-links"); // Quick links element
    const greetingElement = document.createElement("h1");
    greetingElement.id = "greeting-display"; // Create a new element to display the greeting
    document.body.insertBefore(greetingElement, document.body.firstChild); // Insert it at the top
    const timeFormatSelect = document.getElementById("time-format"); // Get time format select element
    const clockElement = document.getElementById("clock"); // The clock display element
    const toggleTimeCheckbox = document.getElementById("toggle-time"); // Checkbox for toggling time visibility

    // New elements for weather functionality
    const toggleWeatherCheckbox = document.getElementById("toggle-weather"); // Checkbox for toggling weather
    const weatherWidget = document.getElementById("weather-widget"); // Weather widget element

    // Variables to track changes
    let newBackground = '';
    let newSearchEngine = searchEngineSelect.value;
    let newGreeting = "Hello!";
    let newSearchVisible = toggleSearchCheckbox.checked;
    let newQuickLinksVisible = toggleQuickLinksCheckbox.checked; 
    let newTimeVisible = toggleTimeCheckbox.checked; 
    let newTimeFormat = timeFormatSelect.value;
    let newWeatherVisible = toggleWeatherCheckbox.checked; 

    // Toggle sidebar visibility
    settingsIcon.addEventListener("click", () => {
        settingsSidebar.classList.toggle("active");
        modalOverlay.classList.toggle("active");
        document.body.classList.toggle("modal-active");
    });

    // Close sidebar
    closeSettingsButton.addEventListener("click", closeSidebar);

    // Close sidebar when clicking outside of it (on the overlay)
    modalOverlay.addEventListener("click", closeSidebar);

    // Function to close sidebar
    function closeSidebar() {
        settingsSidebar.classList.remove("active");
        modalOverlay.classList.remove("active");
        document.body.classList.remove("modal-active");
    }

    // Optionally toggle sidebar on escape key press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (settingsSidebar.classList.contains("active")) {
                closeSidebar();
            } else {
                settingsSidebar.classList.add("active");
                modalOverlay.classList.add("active");
                document.body.classList.add("modal-active");
            }
        }
    });

    // Load existing settings from localStorage
    const existingBackground = localStorage.getItem("background");
    const existingSearchEngine = localStorage.getItem("searchEngine");
    const existingGreeting = localStorage.getItem("greeting");
    const existingTimeFormat = localStorage.getItem("timeFormat") || "12"; 
    const searchBarVisible = localStorage.getItem("searchBarVisible") !== 'false'; 
    const quickLinksVisible = localStorage.getItem("quickLinksVisible") !== 'false'; 
    const timeVisible = localStorage.getItem("timeVisible") !== 'false'; 
    const weatherVisible = localStorage.getItem("weatherVisible") !== 'false'; 

    // Display existing greeting if available
    if (existingGreeting) {
        newGreeting = existingGreeting;
        greetingElement.textContent = newGreeting;
        document.getElementById("greeting").value = newGreeting; 
    } else {
        greetingElement.textContent = "Hello!";
    }

    // Set time format select to existing value
    timeFormatSelect.value = existingTimeFormat;

    // Handle background loading
    if (existingBackground) {
        newBackground = existingBackground;
        document.body.style.backgroundImage = `url(${newBackground})`;
        backgroundInput.value = newBackground;
        document.body.classList.remove("gradient-active"); 
    } else {
        document.body.classList.add("gradient-active"); 
    }

    // Set existing search engine
    if (existingSearchEngine) {
        newSearchEngine = existingSearchEngine;
        searchEngineSelect.value = newSearchEngine;
        searchForm.action = newSearchEngine;
    }

    // Set search box visibility
    searchBox.style.display = searchBarVisible ? 'block' : 'none'; // Hide or show search box
    toggleSearchCheckbox.checked = searchBarVisible;

    // Set quick links visibility
    quickLinksDiv.style.display = quickLinksVisible ? 'block' : 'none'; // Hide or show quick links
    toggleQuickLinksCheckbox.checked = quickLinksVisible;

    // Set time visibility
    clockElement.style.display = timeVisible ? 'block' : 'none'; // Hide or show clock
    toggleTimeCheckbox.checked = timeVisible;

    // Set weather visibility
    weatherWidget.style.display = weatherVisible ? 'block' : 'none'; // Set initial visibility
    toggleWeatherCheckbox.checked = weatherVisible; // Set checkbox state

    // Only apply changes after pressing the save button
    saveButton.addEventListener("click", () => {
        // Get values from inputs
        newBackground = backgroundInput.value.trim(); 
        newGreeting = document.getElementById("greeting").value.trim();
        newSearchEngine = searchEngineSelect.value; 
        newSearchVisible = toggleSearchCheckbox.checked; 
        newQuickLinksVisible = toggleQuickLinksCheckbox.checked; 
        newTimeVisible = toggleTimeCheckbox.checked; 
        newTimeFormat = timeFormatSelect.value; 
        newWeatherVisible = toggleWeatherCheckbox.checked;

        // Apply background settings
        if (newBackground === "") {
            document.body.style.backgroundImage = ''; 
            document.body.classList.add("gradient-active");
            localStorage.removeItem("background"); 
        } else {
            localStorage.setItem("background", newBackground);
            document.body.style.backgroundImage = `url(${newBackground})`;
            document.body.classList.remove("gradient-active");
        }

        // Apply greeting settings
        if (newGreeting === "") {
            greetingElement.textContent = "Hello!"; // Default greeting
            localStorage.setItem("greeting", "Hello!");
        } else {
            greetingElement.textContent = newGreeting;
            localStorage.setItem("greeting", newGreeting);
        }

        // Apply visibility settings
        searchBox.style.display = newSearchVisible ? 'block' : 'none';
        quickLinksDiv.style.display = newQuickLinksVisible ? 'block' : 'none';
        clockElement.style.display = newTimeVisible ? 'block' : 'none';

        // Set weather visibility based on newWeatherVisible
        weatherWidget.style.display = newWeatherVisible ? 'block' : 'none';
        localStorage.setItem("weatherVisible", newWeatherVisible);

        // Save settings to localStorage
        localStorage.setItem("searchEngine", newSearchEngine);
        localStorage.setItem("searchBarVisible", newSearchVisible);
        localStorage.setItem("quickLinksVisible", newQuickLinksVisible);
        localStorage.setItem("timeVisible", newTimeVisible);
        localStorage.setItem("timeFormat", newTimeFormat);

        // Update search form action
        searchForm.action = newSearchEngine;

        // Call updateClock to reflect the new format immediately
        updateClock();

        // Close settings sidebar after saving
        closeSidebar();
    });
});
