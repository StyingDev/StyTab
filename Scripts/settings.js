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
    const searchBox = document.querySelector(".search-box");
    const toggleSearchCheckbox = document.getElementById("toggle-search");
    const toggleQuickLinksCheckbox = document.getElementById("toggle-quick-links"); 
    const quickLinksDiv = document.querySelector(".quick-links");
    const greetingElement = document.createElement("h1");
    greetingElement.id = "greeting-display"; 
    document.body.insertBefore(greetingElement, document.body.firstChild);
    const timeFormatSelect = document.getElementById("time-format");
    const clockElement = document.getElementById("clock");
    const toggleTimeCheckbox = document.getElementById("toggle-time");
    const toggleWeatherCheckbox = document.getElementById("toggle-weather");
    const weatherWidget = document.getElementById("weather-widget");

    // Variables to track changes
    let newSearchVisible = toggleSearchCheckbox.checked;
    let newQuickLinksVisible = toggleQuickLinksCheckbox.checked; 
    let newTimeVisible = toggleTimeCheckbox.checked; 
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

    // toggle sidebar on escape key press
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
        setBackground(newBackground);
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
    searchBox.style.display = searchBarVisible ? 'block' : 'none';
    toggleSearchCheckbox.checked = searchBarVisible;

    // Set quick links visibility
    quickLinksDiv.style.display = quickLinksVisible ? 'flex' : 'none';
    toggleQuickLinksCheckbox.checked = quickLinksVisible;

    // Set time visibility
    clockElement.style.display = timeVisible ? 'block' : 'none';
    toggleTimeCheckbox.checked = timeVisible;

    // Set weather visibility
    weatherWidget.style.display = weatherVisible ? 'block' : 'none';
    toggleWeatherCheckbox.checked = weatherVisible; 

    // Save Button
    saveButton.addEventListener("click", () => {
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
            removeBackground();
            document.body.classList.add("gradient-active");
            localStorage.removeItem("background"); 
        } else {
            localStorage.setItem("background", newBackground);
            setBackground(newBackground);
            document.body.classList.remove("gradient-active");
        }

        // Apply greeting settings
        if (newGreeting === "") {
            greetingElement.textContent = "Hello!";
            localStorage.setItem("greeting", "Hello!");
        } else {
            greetingElement.textContent = newGreeting;
            localStorage.setItem("greeting", newGreeting);
        }

        // Apply visibility settings
        searchBox.style.display = newSearchVisible ? 'block' : 'none';
        quickLinksDiv.style.display = newQuickLinksVisible ? 'flex' : 'none';
        clockElement.style.display = newTimeVisible ? 'block' : 'none';
        // Apply weather settings
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

        updateClock();
        closeSidebar();
    });

    // Set Background function (image or video)
    function setBackground(url) {
        removeBackground();
        
        if (url.toLowerCase().endsWith('.mp4')) {
            const video = document.createElement('video');
            video.id = 'background-video';
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.style.position = 'fixed';
            video.style.right = '0';
            video.style.bottom = '0';
            video.style.minWidth = '100%';
            video.style.minHeight = '100%';
            video.style.width = 'auto';
            video.style.height = 'auto';
            video.style.zIndex = '-1';
            video.style.objectFit = 'cover';
            
            const source = document.createElement('source');
            source.src = url;
            source.type = 'video/mp4';
            
            video.appendChild(source);
            document.body.insertBefore(video, document.body.firstChild);
        } else {
            document.body.style.backgroundImage = `url(${url})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
        }
    }

    function removeBackground() {
        const existingVideo = document.getElementById('background-video');
        if (existingVideo) {
            existingVideo.remove();
        }
        document.body.style.backgroundImage = '';
    }
});
