document.addEventListener("DOMContentLoaded", function() {
    const toggleSearchCheckbox = document.getElementById("toggle-search");
    const toggleQuickLinksCheckbox = document.getElementById("toggle-quick-links");
    const toggleTimeCheckbox = document.getElementById("toggle-time");
    const toggleWeatherCheckbox = document.getElementById("toggle-weather");
    const toggleGreetingCheckbox = document.getElementById("toggle-greeting");
    
    const searchBox = document.querySelector(".search-box");
    const quickLinksDiv = document.querySelector(".quick-links");
    const clockElement = document.getElementById("clock");
    const weatherWidget = document.getElementById("weather-widget");
    const greetingElement = document.getElementById("greeting-display");
    
    const saveButton = document.getElementById("save-settings");

    // Load existing visibility settings
    const searchBarVisible = localStorage.getItem("searchBarVisible") !== 'false';
    const quickLinksVisible = localStorage.getItem("quickLinksVisible") !== 'false';
    const timeVisible = localStorage.getItem("timeVisible") !== 'false';
    const weatherVisible = localStorage.getItem("weatherVisible") !== 'false';
    const greetingVisible = localStorage.getItem("greetingVisible") !== 'false';

    searchBox.style.display = searchBarVisible ? 'block' : 'none';
    quickLinksDiv.style.display = quickLinksVisible ? 'flex' : 'none';
    clockElement.style.display = timeVisible ? 'block' : 'none';
    weatherWidget.style.display = weatherVisible ? 'block' : 'none';
    greetingElement.style.display = greetingVisible ? 'block' : 'none';

    toggleSearchCheckbox.checked = searchBarVisible;
    toggleQuickLinksCheckbox.checked = quickLinksVisible;
    toggleTimeCheckbox.checked = timeVisible;
    toggleWeatherCheckbox.checked = weatherVisible;
    toggleGreetingCheckbox.checked = greetingVisible;

    // Save visibility settings
    saveButton.addEventListener("click", () => {
        const newSearchVisible = toggleSearchCheckbox.checked;
        const newQuickLinksVisible = toggleQuickLinksCheckbox.checked;
        const newTimeVisible = toggleTimeCheckbox.checked;
        const newWeatherVisible = toggleWeatherCheckbox.checked;
        const newGreetingVisible = toggleGreetingCheckbox.checked;

        localStorage.setItem("searchBarVisible", newSearchVisible);
        localStorage.setItem("quickLinksVisible", newQuickLinksVisible);
        localStorage.setItem("timeVisible", newTimeVisible);
        localStorage.setItem("weatherVisible", newWeatherVisible);
        localStorage.setItem("greetingVisible", newGreetingVisible);

        searchBox.style.display = newSearchVisible ? 'block' : 'none';
        quickLinksDiv.style.display = newQuickLinksVisible ? 'flex' : 'none';
        clockElement.style.display = newTimeVisible ? 'block' : 'none';
        weatherWidget.style.display = newWeatherVisible ? 'block' : 'none';
        greetingElement.style.display = newGreetingVisible ? 'block' : 'none';
        
        if (newWeatherVisible && typeof getWeather === 'function') {
            getWeather();
        }
        
        if (typeof closeSidebar === 'function') {
            closeSidebar();
        }
    });
});