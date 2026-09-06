function disableTextSelection() {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    // still selectable: actual content, not just chrome
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
