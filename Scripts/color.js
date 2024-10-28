document.addEventListener("DOMContentLoaded", function () {
    // Get elements
    const textColorInput = document.getElementById("text-color");
    const weatherWidget = document.getElementById("weather-widget");
    const weatherDetails = weatherWidget ? weatherWidget.querySelectorAll("*") : []; // All nested elements in weather widget
    const quickLinksDiv = document.getElementById("quick-links-section");
    const quickLinks = quickLinksDiv ? quickLinksDiv.querySelectorAll("a") : [];
    const clock = document.getElementById("clock");
    
    // Get Save button
    const saveSettingsButton = document.getElementById("save-settings");

    // Load existing text color from localStorage
    const existingTextColor = localStorage.getItem("textColor") || "#FFFFFF";
    
    // Apply the existing text color on page load
    applyTextColor(existingTextColor);
    textColorInput.value = existingTextColor;

    // Listen for Save button click to apply and save the color
    saveSettingsButton.addEventListener("click", () => {
        const newColor = textColorInput.value.trim();
        if (newColor) {
            applyTextColor(newColor);
            localStorage.setItem("textColor", newColor); // Save to localStorage
        }
    });

    /**
     * Function to apply text color to specific elements on the page
     * @param {string} color 
     */
    function applyTextColor(color) {
        if (weatherWidget) {
            weatherWidget.style.setProperty("color", color, "important");
            weatherDetails.forEach(el => el.style.setProperty("color", color, "important"));
        }

        // Apply color to clock (time)
        if (clock) {
            clock.style.setProperty("color", color, "important");
        }

        // Apply color to quick links (individual links within the section)
        quickLinks.forEach(link => {
            link.style.color = color;
        });

        // Apply color to all H1 elements
        const h1Elements = document.querySelectorAll("h1");
        h1Elements.forEach(h1 => {
            h1.style.setProperty("color", color, "important");
        });

    }
});
