function disableTextSelection() {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.style.userSelect = 'text';
        input.style.webkitUserSelect = 'text';
        input.style.msUserSelect = 'text';
        input.style.mozUserSelect = 'text';
    });
}

disableTextSelection();
