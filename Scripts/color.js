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
        if (newColor) {
            applyTextColor(newColor);
            localStorage.setItem("textColor", newColor);
        }
    });

    /**
     * Function to apply text color to specific elements on the page
     * @param {string} color 
     */
    function applyTextColor(color) {
        const svgElements = document.querySelectorAll("svg");
            svgElements.forEach(svg => {
                svg.style.color = color;
            });

        if (weatherWidget) {
            weatherWidget.style.setProperty("color", color, "important");
            weatherDetails.forEach(el => el.style.setProperty("color", color, "important"));
        }

        if (clock) {
            clock.style.setProperty("color", color, "important");
        }

        quickLinks.forEach(link => {
            link.style.color = color;
        });

        const h1Elements = document.querySelectorAll("h1");
        h1Elements.forEach(h1 => {
            h1.style.setProperty("color", color, "important");
        });

        const searchButton = document.querySelector("#search-form input[type='submit']");
        if (searchButton) {
            searchButton.style.setProperty("color", color, "important");
        }

        const searchInput = document.getElementById("search-query");
        if (searchInput) {
            searchInput.style.setProperty("color", color, "important"); 
            searchInput.style.setProperty("caret-color", color, "important");

            const styleTag = document.getElementById("dynamic-placeholder-style") || document.createElement("style");
            styleTag.id = "dynamic-placeholder-style";
            styleTag.innerHTML = `
                #search-query::placeholder {
                    color: ${color} !important;
                    opacity: 0.6;
                }
            `;
            document.head.appendChild(styleTag);
        }
        
        const toggleSliders = document.querySelectorAll(".slider");
        toggleSliders.forEach(slider => {
            slider.style.backgroundColor = color;
        });
        
        const ballColor = isLightColor(color) ? "#000000" : "#FFFFFF";
        let styleTag = document.getElementById("slider-ball-style");
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "slider-ball-style";
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            .slider:before {
                background-color: ${ballColor} !important;
            }
        `;
        
        const formElements = document.querySelectorAll("input, select");
        formElements.forEach(element => {
            element.style.color = color;
            element.style.borderColor = color;
        });
    }

    function isLightColor(color) {
        color = color.replace('#', '');
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }
});
