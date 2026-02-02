document.addEventListener("DOMContentLoaded", function() {
    const greetingElement = document.getElementById("greeting-display");
    const greetingInput = document.getElementById("greeting");
    const saveButton = document.getElementById("save-settings");

    const existingGreeting = localStorage.getItem("greeting");
    const greetingVisible = localStorage.getItem("greetingVisible") !== 'false';
    
    if (existingGreeting) {
        greetingElement.textContent = existingGreeting;
        greetingInput.value = existingGreeting;
    }
    
    greetingElement.style.display = greetingVisible ? 'block' : 'none';

    saveButton.addEventListener("click", () => {
        const newGreeting = greetingInput.value.trim();
        
        if (newGreeting === "") {
            greetingElement.textContent = "Hello!";
            localStorage.setItem("greeting", "Hello!");
        } else {
            greetingElement.textContent = newGreeting;
            localStorage.setItem("greeting", newGreeting);
        }

        if (typeof closeSidebar === 'function') {
            closeSidebar();
        }
    });
});