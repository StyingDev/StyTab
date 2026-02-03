document.addEventListener("DOMContentLoaded", function () {
    const textColorInput = document.getElementById("text-color");
    const weatherWidget = document.getElementById("weather-widget");
    const weatherDetails = weatherWidget ? weatherWidget.querySelectorAll("*") : [];
    const quickLinksDiv = document.getElementById("quick-links-section");
    const quickLinks = quickLinksDiv ? quickLinksDiv.querySelectorAll("a") : [];
    const clock = document.getElementById("clock");
    
    const saveSettingsButton = document.getElementById("save-settings");

    const existingTextColor = localStorage.getItem("textColor") || "#FFFFFF";
    
    applyTextColor(existingTextColor);
    textColorInput.value = existingTextColor;

    saveSettingsButton.addEventListener("click", () => {
        const newColor = textColorInput.value.trim();
        if (newColor && isValidHexColor(newColor)) {
            applyTextColor(newColor);
            localStorage.setItem("textColor", newColor);
        }
    });

    function applyTextColor(color) {
        document.querySelectorAll("svg").forEach(svg => {
            svg.style.color = color;
        });

        if (weatherWidget) {
            weatherWidget.style.color = color;
            weatherDetails.forEach(el => el.style.color = color);
        }

        if (clock) {
            clock.style.color = color;
        }

        quickLinks.forEach(link => {
            link.style.color = color;
        });

        document.querySelectorAll("h1").forEach(h1 => {
            h1.style.color = color;
        });

        const searchButton = document.querySelector("#search-form input[type='submit']");
        if (searchButton) {
            searchButton.style.color = color;
        }

        const searchInput = document.getElementById("search-query");
        if (searchInput) {
            searchInput.style.color = color;
            searchInput.style.caretColor = color;
            
            const placeholderStyle = document.getElementById("placeholder-color-style") || document.createElement("style");
            placeholderStyle.id = "placeholder-color-style";
            placeholderStyle.textContent = `#search-query::placeholder { color: ${color} !important; opacity: 0.6; }`;
            document.head.appendChild(placeholderStyle);
        }
    }

    function isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
    }
});