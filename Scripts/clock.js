function updateClock() {
    const clockElement = document.getElementById("clock");
    if (!clockElement || clockElement.style.display === 'none') return;
    
    const now = new Date();
    const timeFormat = localStorage.getItem("timeFormat") || "12";
    
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: timeFormat === "12"
    });
    
    clockElement.textContent = formatter.format(now);
}

setInterval(updateClock, 60);
updateClock();