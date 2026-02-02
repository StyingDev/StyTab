document.addEventListener("DOMContentLoaded", function() {
    const settingsIcon = document.getElementById("settings-icon");
    const settingsSidebar = document.getElementById("settings-sidebar");
    const closeSettingsButton = document.getElementById("close-settings");
    const modalOverlay = document.getElementById("modal-overlay");

    window.closeSidebar = function() {
        settingsSidebar.classList.remove("active");
        modalOverlay.classList.remove("active");
        document.body.classList.remove("modal-active");
    };

    settingsIcon.addEventListener("click", () => {
        settingsSidebar.classList.toggle("active");
        modalOverlay.classList.toggle("active");
        document.body.classList.toggle("modal-active");
    });

    closeSettingsButton.addEventListener("click", window.closeSidebar);
    modalOverlay.addEventListener("click", window.closeSidebar);


    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (settingsSidebar.classList.contains("active")) {
                window.closeSidebar();
            } else {
                settingsSidebar.classList.add("active");
                modalOverlay.classList.add("active");
                document.body.classList.add("modal-active");
            }
        }
    });
});