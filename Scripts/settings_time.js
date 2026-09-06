document.addEventListener("DOMContentLoaded", function() {
    const timeFormatSelect = document.getElementById("time-format");
    const saveButton = document.getElementById("save-settings");

    // clock visibility lives in settings_visibility.js, not here
    const existingTimeFormat = localStorage.getItem("timeFormat") || "12";
    timeFormatSelect.value = existingTimeFormat;

    saveButton.addEventListener("click", () => {
        const newTimeFormat = timeFormatSelect.value;
        localStorage.setItem("timeFormat", newTimeFormat);

        if (typeof updateClock === 'function') {
            updateClock();
        }

        if (typeof closeSidebar === 'function') {
            closeSidebar();
        }
    });
});
