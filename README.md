
# StyTab!!!

StyTab is a 'minimalist' new tab page that gives you quick links, weather, and a search bar (personally not a big fan of it) and whatever else it has

![Version](https://img.shields.io/badge/version-1.2.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

| Browser | Download |
|---------|----------|
| Firefox & Gecko-based | [<img src="./Readme Assets/download-firefox.svg" height="53" alt="Firefox Download">](https://addons.mozilla.org/en-US/firefox/addon/stytab/) |

## Table of Contents

I. [Features](#i-features)  
II. [Installation](#ii-installation)  
III. [Quick Start](#iii-quick-start)  
IV. [Configuration](#iv-configuration)  
V. [Development](#v-development)  
VI. [License](#vi-license)  

<div style="display: flex; gap: 10px;">
  <img src="https://i.imgur.com/zXbxB6g.png"/>
</div>

---

## I. Features

### Core Components
- **Custom Search Bar** - Choose from 14+ search engines (Google, DuckDuckGo, Brave, etc.)
- **Quick Links System** - Organize and access favorite websites with one click
- **Weather Widget** - Real-time weather information powered by Pirate Weather API
- **Dynamic Backgrounds** - Animated gradients, custom images, videos, or solid colors
- **Time & Date Display** - Configurable 12/24-hour clock with weekday
- **Visual Customization** - Adjust text colors, overlay opacity, and background blur effects


## II. Installation

<details>
<summary><h3>A) Firefox Based</h3></summary>

### Option 1: Official Store Download
1. Visit the [Firefox Addon Store](https://addons.mozilla.org/en-US/firefox/addon/stytab/)
2. Click "Add to Firefox"

### Option 2: Manual Installation
1. Download the latest release
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select any file from the downloaded folder
</details>

<details>
<summary><h3>B) Chromium Based (Unstable)</h3></summary>

### Option 1: Official Store Download
> ⚠ Not currently available in official stores, uploading on the Chrome Webstore costs money which I am too broke to spend.

### Option 2: Manual Installation
1. Download the latest release
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the downloaded folder
</details>

## III. Quick Start

### Weather Setup
1. **Optional API Key**: Visit [Pirate Weather](https://pirate-weather.apiable.io/) for a free API key
> It is optional because I did provide a free one, but there is no guarantee it will always be available.
2. **Location**: Find coordinates at [GPS Coordinates](https://www.gps-coordinates.net/)
3. **Configuration**: Click the weather widget, enter details, and save


## IV. Configuration

### Display Settings
- Show/Hide greeting, clock, search bar, quick links, and weather widget

### Configurations
- **Custom Greeting**: Personalize the welcome message
- **Text Color**: Set custom hex color for all text elements
- **Search Engine**: Choose from privacy-focused and mainstream options
- **Time Format**: Switch between 12-hour and 24-hour formats

### Background Settings
- **Type Selection**: Choose between animated gradients or custom backgrounds
- **Gradient Themes**: 8 preset animated gradients
- **Custom Backgrounds**: Support for:
  - Image URLs (.jpg, .png, .gif, .webp)
  - Video URLs (.mp4, .webm, .ogg)
  - Solid colors (hex codes, e.g., #FF0000)
- **Visual Effects**:
  - Overlay opacity (0-0.8)
  - Background blur (0-20px)

### Quick Links Management
- Add, edit, and remove website shortcuts
- Predefined defaults (Reddit, GitHub, YouTube)
- Drag-and-drop organization (planned)
- Export/import functionality (planned)

## V. Development

### Building from Source
```bash
git clone https://github.com/StyingDev/StyTab.git
cd StyTab
```

#### Firefox Installation:
1. Navigate to `about:debugging`
2. Click "This Firefox" (or your Firefox fork)
3. Select "Load Temporary Add-on"
4. Choose the `manifest.json` file in the StyTab folder


### Project Structure
```
StyTab/
├── scripts/           # JavaScript modules
├── styles/            # CSS stylesheets
├── icons/             # Extension icons
├── fonts/             # Custom fonts
├── manifest.json      # Extension manifest
├── startpage.html     # Main interface
└── popup.html         # Extension popup
```


## VI. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgments
- Weather data provided by [Pirate Weather](https://pirateweather.net/)
- Icons sourced from [SVG Repo](https://www.svgrepo.com/)
- Inspired by [mtab](https://github.com/maxhu08/mtab)
- Font: Quicksand by Andrew Paglinawan

---

Made by [StyingDev](https://github.com/StyingDev)
