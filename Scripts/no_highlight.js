function disableTextSelection() {
    // Apply CSS styles to disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    // Allow text highlighting in input and textarea
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.style.userSelect = 'text';
        input.style.webkitUserSelect = 'text';
        input.style.msUserSelect = 'text';
        input.style.mozUserSelect = 'text';
    });
}

disableTextSelection();
