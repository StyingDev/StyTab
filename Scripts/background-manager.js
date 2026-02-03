class BackgroundManager {
  constructor() {
    this.backgroundInput = document.getElementById('background');
    this.gradientSelect = document.getElementById('gradient-select');
    this.backgroundType = document.getElementById('background-type');
    this.overlayOpacity = document.getElementById('overlay-opacity');
    this.blurIntensity = document.getElementById('blur-intensity');
    this.saveButton = document.getElementById('save-settings');
    
    this.videoContainer = null;
    this.overlayElement = null;
    
    this.init();
  }
  
  init() {
    this.createOverlayElement();
    this.loadSavedSettings();
    this.setupEventListeners();
    this.setupTypeToggle();
  }
  
  createOverlayElement() {
    if (!document.querySelector('.background-overlay')) {
      this.overlayElement = document.createElement('div');
      this.overlayElement.className = 'background-overlay';
      document.body.appendChild(this.overlayElement);
    }
  }
  
  loadSavedSettings() {
    const settings = this.getSavedSettings();
    this.applyBackground(settings);
    
    // Update form inputs
    if (this.backgroundInput && settings.url) {
      this.backgroundInput.value = settings.url;
    }
    
    if (this.gradientSelect && settings.gradient) {
      this.gradientSelect.value = settings.gradient;
    }
    
    if (this.backgroundType && settings.type) {
      this.backgroundType.value = settings.type;
    }
    
    if (this.overlayOpacity && settings.overlayOpacity !== undefined) {
      this.overlayOpacity.value = settings.overlayOpacity;
      this.updateOpacityLabel();
    }
    
    if (this.blurIntensity && settings.blurIntensity !== undefined) {
      this.blurIntensity.value = settings.blurIntensity;
      this.updateBlurLabel();
    }
  }
  
  getSavedSettings() {
    return {
      url: localStorage.getItem('background') || '',
      gradient: localStorage.getItem('gradient') || 'default',
      overlayOpacity: localStorage.getItem('overlayOpacity') || '0.3',
      blurIntensity: localStorage.getItem('blurIntensity') || '0',
      type: localStorage.getItem('backgroundType') || 'gradient'
    };
  }
  
  setupEventListeners() {
    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => this.saveSettings());
    }
    
    if (this.overlayOpacity) {
      this.overlayOpacity.addEventListener('input', () => this.updateOpacityLabel());
    }
    
    if (this.blurIntensity) {
      this.blurIntensity.addEventListener('input', () => this.updateBlurLabel());
    }
  }
  
  setupTypeToggle() {
    if (this.backgroundType) {
      this.backgroundType.addEventListener('change', () => this.toggleCustomInput());
      this.toggleCustomInput(); // Initial toggle
    }
  }
  
  toggleCustomInput() {
    const isCustom = this.backgroundType.value === 'custom';
    const customInput = document.getElementById('custom-input-container');
    
    if (customInput) {
      customInput.style.display = isCustom ? 'block' : 'none';
    }
    
    // Also show/hide gradient select
    if (this.gradientSelect && this.gradientSelect.parentElement) {
      this.gradientSelect.parentElement.style.display = isCustom ? 'none' : 'block';
    }
  }
  
  updateOpacityLabel() {
    const valueDisplay = document.getElementById('overlay-value');
    if (valueDisplay && this.overlayOpacity) {
      valueDisplay.textContent = this.overlayOpacity.value;
    }
  }
  
  updateBlurLabel() {
    const valueDisplay = document.getElementById('blur-value');
    if (valueDisplay && this.blurIntensity) {
      valueDisplay.textContent = `${this.blurIntensity.value}px`;
    }
  }
  
  saveSettings() {
    const settings = {
      url: this.backgroundInput ? this.backgroundInput.value.trim() : '',
      gradient: this.gradientSelect ? this.gradientSelect.value : 'default',
      overlayOpacity: this.overlayOpacity ? this.overlayOpacity.value : '0.3',
      blurIntensity: this.blurIntensity ? this.blurIntensity.value : '0',
      type: this.backgroundType ? this.backgroundType.value : 'gradient'
    };
    
    // Save to localStorage
    localStorage.setItem('background', settings.url);
    localStorage.setItem('gradient', settings.gradient);
    localStorage.setItem('overlayOpacity', settings.overlayOpacity);
    localStorage.setItem('blurIntensity', settings.blurIntensity);
    localStorage.setItem('backgroundType', settings.type);
    
    // Apply settings
    this.applyBackground(settings);
    
    if (typeof closeSidebar === 'function') {
      closeSidebar();
    }
  }
  
  applyBackground(settings) {
    this.removeBackground();
    
    // Apply the main background
    if (settings.type === 'gradient') {
      this.applyGradient(settings.gradient);
    } else if (settings.type === 'custom') {
      this.applyCustom(settings.url);
    }
    
    // Apply overlay and blur effects
    this.applyOverlay(settings.overlayOpacity);
    this.applyBlur(settings.blurIntensity);
  }
  
  applyGradient(gradientName) {
    document.body.style.backgroundImage = '';
    document.body.classList.add('gradient-active');
    document.body.classList.add(`gradient-${gradientName}`);
  }
  
  applyCustom(url) {
    if (!url) {
      this.applyGradient('default');
      return;
    }
    
    // Check if it's a color
    if (url.startsWith('#')) {
      document.body.classList.remove('gradient-active');
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = url;
      return;
    }
    
    // Check if it's a video
    if (url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)) {
      this.applyVideo(url);
      return;
    }
    
    // Default to image
    this.applyImage(url);
  }
  
  applyImage(url) {
    const img = new Image();
    img.onload = () => {
      document.body.classList.remove('gradient-active');
      document.body.style.backgroundImage = `url("${url}")`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    };
    
    img.onerror = () => {
      console.error('Failed to load image, using default gradient');
      this.applyGradient('default');
    };
    
    img.src = url;
  }
  
  applyVideo(url) {
    if (!this.videoContainer) {
      this.videoContainer = document.createElement('div');
      this.videoContainer.className = 'background-video-container';
      document.body.insertBefore(this.videoContainer, document.body.firstChild);
    }
    
    this.videoContainer.innerHTML = '';
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    
    const source = document.createElement('source');
    source.src = url;
    source.type = url.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
    
    video.appendChild(source);
    this.videoContainer.appendChild(video);
    
    video.onerror = () => {
      console.error('Failed to load video, using default gradient');
      this.applyGradient('default');
    };
    
    video.onloadeddata = () => {
      document.body.classList.remove('gradient-active');
    };
  }
  
  applyOverlay(opacity) {
    if (!this.overlayElement) {
      this.createOverlayElement();
    }
    
    if (this.overlayElement) {
      this.overlayElement.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    }
  }
  
  applyBlur(intensity) {
    if (this.overlayElement && parseFloat(intensity) > 0) {
      this.overlayElement.style.backdropFilter = `blur(${intensity}px)`;
      this.overlayElement.style.webkitBackdropFilter = `blur(${intensity}px)`;
    } else if (this.overlayElement) {
      // Remove blur if intensity is 0
      this.overlayElement.style.backdropFilter = 'none';
      this.overlayElement.style.webkitBackdropFilter = 'none';
    }
  }
  
  removeBackground() {
    // Remove gradient classes
    document.body.classList.remove('gradient-active');
    const gradientClasses = Array.from(document.body.classList).filter(cls => 
      cls.startsWith('gradient-')
    );
    gradientClasses.forEach(cls => document.body.classList.remove(cls));
    
    // Remove background image/color
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
    
    // Remove video
    if (this.videoContainer) {
      this.videoContainer.remove();
      this.videoContainer = null;
    }
  }
  
  getRandomGradient() {
    const gradients = ['ocean', 'sunset', 'nordic', 'purple-haze', 'default'];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.backgroundManager = new BackgroundManager();
});