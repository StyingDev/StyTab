document.addEventListener("DOMContentLoaded", function() {
    const backgroundInput = document.getElementById("background");
    const saveButton = document.getElementById("save-settings");

    const existingBackground = localStorage.getItem("background");
    if (existingBackground) {
        setBackground(existingBackground);
        backgroundInput.value = existingBackground;
        document.body.classList.remove("gradient-active");
    } else {
        document.body.classList.add("gradient-active");
    }

    saveButton.addEventListener("click", () => {
        const newBackground = backgroundInput.value.trim();
        
        if (newBackground === "") {
            removeBackground();
            document.body.classList.add("gradient-active");
            localStorage.removeItem("background");
        } else {
            localStorage.setItem("background", newBackground);
            setBackground(newBackground);
            document.body.classList.remove("gradient-active");
        }
        
        if (typeof closeSidebar === 'function') {
        closeSidebar();
        }
    });

    function setBackground(url) {
        removeBackground();
        
        if (url.toLowerCase().endsWith('.mp4')) {
            const video = document.createElement('video');
            video.id = 'background-video';
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.style.position = 'fixed';
            video.style.right = '0';
            video.style.bottom = '0';
            video.style.minWidth = '100%';
            video.style.minHeight = '100%';
            video.style.width = 'auto';
            video.style.height = 'auto';
            video.style.zIndex = '-1';
            video.style.objectFit = 'cover';
            
            const source = document.createElement('source');
            source.src = url;
            source.type = 'video/mp4';
            
            video.appendChild(source);
            document.body.insertBefore(video, document.body.firstChild);
        } else {
            document.body.style.backgroundImage = `url(${url})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
        }
    }

    function removeBackground() {
        const existingVideo = document.getElementById('background-video');
        if (existingVideo) {
            existingVideo.remove();
        }
        document.body.style.backgroundImage = '';
    }
});