// Function to update the clock with the day of the week
function updateClock() {
    const clockElement = document.getElementById("clock");
    
    // Get the current time
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
  
    // Get the current day of the week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[now.getDay()];
  
    // Get the saved time format (default to 12-hour format if none)
    const timeFormat = localStorage.getItem("timeFormat") || "12";
  
    // Convert to 12-hour format if selected
    let ampm = "";
    if (timeFormat === "12") {
        ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight/noon
    }
  
    // Format the time with leading zeros if needed
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
    // Display the day of the week along with the time and AM/PM if in 12-hour format
    clockElement.innerText = `${dayOfWeek}, ${formattedTime} ${timeFormat === "12" ? ampm : ""}`;
}
  
setInterval(updateClock, 1000);
  
updateClock();
