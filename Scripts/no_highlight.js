function disableTextSelection() {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    // Keep the "no accidental drag-highlight" behavior for chrome (icons,
    // labels, buttons) but let people still select/copy actual widget
    // content — the clock, weather summary, greeting, and quick link text.
    const selectable = document.querySelectorAll(
        'input, textarea, #clock, #greeting-display, #weather-widget, .quick-links a, .quick-links-sidebar a'
    );
    selectable.forEach(el => {
        el.style.userSelect = 'text';
        el.style.webkitUserSelect = 'text';
        el.style.msUserSelect = 'text';
        el.style.mozUserSelect = 'text';
    });
}

disableTextSelection();
