document.addEventListener("DOMContentLoaded", function() {
    // days:[] = any day, added to that slot's pool rather than replacing it.
    // withName can be null when only one phrasing makes sense.
    const GREETING_POOL = [
        // Morning (6am - 12pm), any day
        { text: "Good morning",              withName: "Good morning, {name}",              days: [], timeranges: [6, 12] },
        { text: "Welcome",                   withName: "Welcome, {name}",                   days: [], timeranges: [6, 12] },
        { text: "Hey there",                 withName: "Hey there, {name}",                 days: [], timeranges: [6, 12] },
        { text: "Coffee time?",              withName: "Coffee time, {name}?",              days: [], timeranges: [6, 12] },
        { text: "Greetings, whoever you are", withName: null,                               days: [], timeranges: [6, 12] },

        // Weekday/weekend flavor (morning)
        { text: "Happy Monday",              withName: "Happy Monday, {name}",              days: ["Monday"],    timeranges: [6, 12] },
        { text: "Happy Tuesday",             withName: "Happy Tuesday, {name}",             days: ["Tuesday"],   timeranges: [6, 12] },
        { text: "Happy Wednesday",           withName: "Happy Wednesday, {name}",           days: ["Wednesday"], timeranges: [6, 12] },
        { text: "Happy Thursday",            withName: "Happy Thursday, {name}",            days: ["Thursday"],  timeranges: [6, 12] },
        { text: "Happy Friday",              withName: "Happy Friday, {name}",              days: ["Friday"],    timeranges: [6, 12] },
        { text: "That Friday feeling",       withName: "That Friday feeling, {name}",       days: ["Friday"],    timeranges: [6, 12] },
        { text: "Happy Saturday!",           withName: "Happy Saturday, {name}",            days: ["Saturday"],  timeranges: [6, 12] },
        { text: "Sunday session?",           withName: "Sunday session, {name}?",           days: ["Sunday"],    timeranges: [6, 12] },
        { text: "Happy Sunday",              withName: "Happy Sunday, {name}",              days: ["Sunday"],    timeranges: [6, 12] },
        { text: "Welcome to the weekend",    withName: "Welcome to the weekend, {name}",    days: ["Saturday", "Sunday"], timeranges: [6, 12] },
        { text: "What's on your mind?",      withName: "What's on your mind, {name}?",      days: ["Saturday", "Sunday"], timeranges: [6, 12] },

        // Afternoon (12pm - 5pm), any day
        { text: "Good afternoon",            withName: "Good afternoon, {name}",            days: [], timeranges: [12, 17] },
        { text: "Hi, how are you?",          withName: "Hi {name}, how are you?",           days: [], timeranges: [12, 17] },
        { text: "What's new?",               withName: "What's new, {name}?",               days: [], timeranges: [12, 17] },
        { text: "Back at it!",               withName: "Back at it, {name}",                days: [], timeranges: [12, 17] },

        // Evening (5pm - 9pm), any day
        { text: "Good evening",              withName: "Good evening, {name}",              days: [], timeranges: [17, 21] },
        { text: "Evening",                   withName: "Evening, {name}",                   days: [], timeranges: [17, 21] },
        { text: null,                        withName: "{name} returns!",                   days: [], timeranges: [17, 21] },
        { text: "How was your day?",         withName: "How was your day, {name}?",         days: [], timeranges: [17, 21] },

        // Late night (9pm - 6am), any day - wraps past midnight
        { text: "How's it going?",           withName: "How's it going, {name}?",           days: [], timeranges: [21, 6] },
        { text: "Hello, night owl",          withName: null,                                days: [], timeranges: [21, 6] },
        { text: "What's on your mind tonight?", withName: null,                             days: [], timeranges: [21, 6] },
    ];

    // Not time/day gated - matched by condition tag, see parseWeatherTags.
    const WEATHER_POOL = [
        { text: "Looks rainy out there",     withName: "Looks rainy out there, {name}",     conditions: ["rain"] },
        { text: "Stay dry out there",        withName: "Stay dry out there, {name}",        conditions: ["rain"] },
        { text: "Storm's rolling in",        withName: "Storm's rolling in, {name}",        conditions: ["storm"] },
        { text: "Snow day!",                 withName: "Snow day, {name}!",                 conditions: ["snow"] },
        { text: "Bundle up out there",       withName: "Bundle up out there, {name}",       conditions: ["snow", "cold"] },
        { text: "A bit hazy out there",      withName: "A bit hazy out there, {name}",      conditions: ["fog"] },
        { text: "It's a windy one",          withName: "It's a windy one, {name}",          conditions: ["wind"] },
        { text: "Cloudy skies today",        withName: "Cloudy skies today, {name}",        conditions: ["cloud"] },
        { text: "Clear skies ahead",         withName: "Clear skies ahead, {name}",         conditions: ["clear"] },
        { text: "Blue skies today",          withName: "Blue skies today, {name}",          conditions: ["clear"] },
        { text: "Staying cool out there?",   withName: "Staying cool out there, {name}?",   conditions: ["hot"] },
        { text: "It's a scorcher today",     withName: "It's a scorcher today, {name}",     conditions: ["hot"] },
        { text: "Chilly one today",          withName: "Chilly one today, {name}",          conditions: ["cold"] },
    ];

    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function inTimeRange(hour, [start, end]) {
        return start < end ? (hour >= start && hour < end) : (hour >= start || hour < end);
    }

    // Reads weather's own rendered text instead of fetching again. Null =
    // not set up / still loading, caller falls back to time-based.
    function parseWeatherTags() {
        const tempEl = document.getElementById("weather-temperature");
        const descEl = document.getElementById("weather-description");
        if (!tempEl || !descEl) return null;

        const tempText = tempEl.textContent;
        const desc = descEl.textContent;
        const placeholders = ["Loading...", "Setup", "Error", ""];
        if (placeholders.includes(tempText) || !desc) return null;

        const tags = [];
        const d = desc.toLowerCase();
        if (/thunderstorm|storm/.test(d))      tags.push("storm");
        else if (/rain|drizzle|shower/.test(d)) tags.push("rain");
        if (/snow|flurries|sleet|ice/.test(d)) tags.push("snow");
        if (/fog|haze|hazy|mist/.test(d))      tags.push("fog");
        if (/wind|breezy|gust/.test(d))        tags.push("wind");
        if (/cloud|overcast/.test(d))          tags.push("cloud");
        if (/clear|sunny|fair/.test(d))        tags.push("clear");

        const match = tempText.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])/i);
        if (match) {
            const value = parseFloat(match[1]);
            const celsius = match[2].toUpperCase() === "F" ? (value - 32) * 5 / 9 : value;
            if (celsius >= 30) tags.push("hot");
            if (celsius <= 2)  tags.push("cold");
        }

        return tags;
    }

    // roll is pre-drawn, not Math.random() called here directly - this can
    // run twice per load (weather arriving late re-renders), and rerolling
    // fresh each time meant the greeting would randomly swap on you a beat
    // after load. Reusing one roll = it only changes when weather actually
    // adds something new.
    function pickSmartGreeting(name, roll) {
        const now = new Date();
        const day = DAY_NAMES[now.getDay()];
        const hour = now.getHours();
        const hasName = !!name;

        const usable = g => hasName || g.text; // no name set → skip name-only lines

        let timeCandidates = GREETING_POOL.filter(g =>
            (g.days.length === 0 || g.days.includes(day)) && inTimeRange(hour, g.timeranges) && usable(g)
        );
        if (!timeCandidates.length) timeCandidates = GREETING_POOL.filter(usable);

        const weatherEnabled = localStorage.getItem("greetingIncludeWeather") !== 'false';
        const weatherTags = weatherEnabled ? parseWeatherTags() : null;
        const weatherCandidates = weatherTags && weatherTags.length
            ? WEATHER_POOL.filter(g => g.conditions.some(c => weatherTags.includes(c)) && usable(g))
            : [];

        const pool = (weatherCandidates.length && roll.coin < 0.5) ? weatherCandidates : timeCandidates;

        const chosen = pool[Math.floor(roll.pick * pool.length)];
        return hasName && chosen.withName ? chosen.withName.replace("{name}", name) : chosen.text;
    }

    const greetingElement   = document.getElementById("greeting-display");
    const modeSelect        = document.getElementById("greeting-mode");
    const nameInput         = document.getElementById("greeting-name");
    const weatherToggle     = document.getElementById("greeting-include-weather");
    const customInput       = document.getElementById("greeting");
    const smartOptions      = document.getElementById("greeting-smart-options");
    const customOptions     = document.getElementById("greeting-custom-options");
    const saveButton        = document.getElementById("save-settings");

    // Already had a custom greeting saved? Keep it, don't silently switch you to smart.
    const hasLegacyGreeting = localStorage.getItem("greeting") !== null;
    const mode            = localStorage.getItem("greetingMode") || (hasLegacyGreeting ? "custom" : "smart");
    const name             = (localStorage.getItem("greetingName") || "").trim();
    const includeWeather  = localStorage.getItem("greetingIncludeWeather") !== 'false'; // on by default
    const customText       = localStorage.getItem("greeting") || "Hello!";

    // greeting show/hide lives in settings_visibility.js, not here
    modeSelect.value        = mode;
    nameInput.value         = name;
    weatherToggle.checked   = includeWeather;
    customInput.value       = customText;

    function syncModeUI() {
        const isSmart = modeSelect.value === "smart";
        smartOptions.style.display  = isSmart ? '' : 'none';
        customOptions.style.display = isSmart ? 'none' : '';
    }
    syncModeUI();
    modeSelect.addEventListener("change", syncModeUI);

    let smartRoll = { coin: Math.random(), pick: Math.random() }; // see pickSmartGreeting

    function renderGreeting() {
        const currentMode = localStorage.getItem("greetingMode") || (hasLegacyGreeting ? "custom" : "smart");
        const currentName = (localStorage.getItem("greetingName") || "").trim();

        if (currentMode === "custom") {
            const text = localStorage.getItem("greeting") || "Hello!";
            greetingElement.textContent = currentName ? text.replaceAll("{name}", currentName) : text;
        } else {
            greetingElement.textContent = pickSmartGreeting(currentName, smartRoll);
        }
    }

    const weatherTempEl = document.getElementById("weather-temperature");
    const weatherDescEl = document.getElementById("weather-description");
    if (weatherTempEl && weatherDescEl) {
        const weatherObserver = new MutationObserver(renderGreeting);
        weatherObserver.observe(weatherTempEl, { childList: true, characterData: true, subtree: true });
        weatherObserver.observe(weatherDescEl, { childList: true, characterData: true, subtree: true });
    }

    renderGreeting();

    saveButton.addEventListener("click", () => {
        const newMode           = modeSelect.value;
        const newName           = nameInput.value.trim();
        const newIncludeWeather = weatherToggle.checked;
        const newCustomText     = customInput.value.trim() || "Hello!";

        localStorage.setItem("greetingMode", newMode);
        localStorage.setItem("greetingName", newName);
        localStorage.setItem("greetingIncludeWeather", newIncludeWeather);
        localStorage.setItem("greeting", newCustomText);
        customInput.value = newCustomText;

        smartRoll = { coin: Math.random(), pick: Math.random() };
        renderGreeting();

        if (typeof closeSidebar === 'function') {
            closeSidebar();
        }
    });
});
