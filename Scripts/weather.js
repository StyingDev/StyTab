// weather.js

document.addEventListener('DOMContentLoaded', function () {
    const apiKeyInput = document.getElementById('api-key');
    const cityIdInput = document.getElementById('city-id');
    const tempUnitSelect = document.getElementById('temp-unit');

    const weatherWidget = document.getElementById('weather-widget');
    const modal = document.getElementById('weather-settings-modal');
    const closeModalBtn = document.getElementById('close-weather-modal');
    const saveSettingsBtn = document.getElementById('save-weather-settings');

    // Function to open the modal with animation
    function openModal() {
        const widgetRect = weatherWidget.getBoundingClientRect();
        modal.style.top = `${widgetRect.bottom + window.scrollY}px`;
        modal.style.left = `${widgetRect.left + window.scrollX}px`;
        modal.classList.add('show'); 
        modal.style.display = 'block'; 
        apiKeyInput.value = localStorage.getItem('apiKey') || '';
        cityIdInput.value = localStorage.getItem('cityId') || '';
        tempUnitSelect.value = localStorage.getItem('tempUnit') || 'C';
    }

    // Function to close the modal with animation
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300); // Hide the modal after animation
    }

    // Attach event listeners
    weatherWidget.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Save the settings when 'Save' button is clicked
    saveSettingsBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        const cityId = cityIdInput.value;
        const tempUnit = tempUnitSelect.value;

        // Save settings to localStorage
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('cityId', cityId);
        localStorage.setItem('tempUnit', tempUnit);

        closeModal(); 
        getWeather(); 
    });

    // Fetch weather data and update the widget
    function getWeather() {
        const apiKey = localStorage.getItem('apiKey') || 'bdm2Ng1aUZELAfQIzse8VfKkvw7wLNZV'; // Default API key
        const cityId = localStorage.getItem('cityId') || '10021'; // Default city (New York City, United States of America)
        const tempUnit = localStorage.getItem('tempUnit') || 'C';

        const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${cityId}?apikey=${apiKey}&details=true`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const weatherData = data[0];
                    const temperature = tempUnit === 'C' ? weatherData.Temperature.Metric.Value : weatherData.Temperature.Imperial.Value;
                    const weatherText = weatherData.WeatherText;

                    // Update the widget with the weather information
                    document.getElementById('weather-temperature').innerText = `${temperature}°${tempUnit}`;
                    document.getElementById('weather-description').innerText = weatherText;
                }
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    // Initial call to fetch weather when the page loads
    getWeather();
});
