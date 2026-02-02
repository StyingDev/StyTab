document.addEventListener("DOMContentLoaded", function() {
    const timeFormatSelect = document.getElementById("time-format");
    const clockElement = document.getElementById("clock");
    const toggleTimeCheckbox = document.getElementById("toggle-time");
    const saveButton = document.getElementById("save-settings");

    const existingTimeFormat = localStorage.getItem("timeFormat") || "12";
    const timeVisible = localStorage.getItem("timeVisible") !== 'false';

    timeFormatSelect.value = existingTimeFormat;
    clockElement.style.display = timeVisible ? 'block' : 'none';
    toggleTimeCheckbox.checked = timeVisible;

    saveButton.addEventListener("click", () => {
        const newTimeFormat = timeFormatSelect.value;
        const newTimeVisible = toggleTimeCheckbox.checked;

        localStorage.setItem("timeFormat", newTimeFormat);
        localStorage.setItem("timeVisible", newTimeVisible);

        clockElement.style.display = newTimeVisible ? 'block' : 'none';
        
        if (typeof updateClock === 'function') {
            updateClock();
        }

        if (typeof closeSidebar === 'function') {
        closeSidebar();
        }
    });
});