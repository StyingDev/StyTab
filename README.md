# StyTab Startpage Extension

**StyTab** is a customizable startpage extension designed to give users quick access to their favorite websites, a personalized search experience, and a dynamic clock display. With settings to configure the background, search engine, time format, and visibility of elements like quick links and the search bar, StyTab makes your startpage both functional and tailored to your preferences.

## Features

- **Clock Display**: A customizable clock that shows the current time in either 12-hour or 24-hour format.
- **Search Box**: A search bar that supports various search engines, including Google, DuckDuckGo, Bing, and more.
- **Quick Links**: Easily accessible links to favorite websites, with support for adding, removing, and managing custom links.
- **Settings Sidebar**: A fully-featured settings panel that allows users to:
  - Customize the greeting.
  - Set a background image via URL.
  - Choose a search engine from a variety of options.
  - Toggle the visibility of the clock, search bar, and quick links.
- **Local Storage Persistence**: Custom settings and links are saved locally, so they persist even after the page is refreshed or the browser is closed.

## Example

Here's an example of what the interface looks like:

<div style="display: flex; gap: 20px;">
  <img src="https://addons.mozilla.org/user-media/previews/full/306/306013.png?modified=1727639141" alt="Preview of the startpage extension" width="300"/>
  <img src="https://addons.mozilla.org/user-media/previews/full/306/306014.png?modified=1727639142" alt="Example image of Startpage 2" width="300"/>
</div>

### Usage

#### Adding Quick Links
1. Click on the **Quick Links** icon.
2. Enter a name and URL for the link in the input fields provided.
3. Click **Add Link** to save the new link. It will appear in both the quick links sidebar and the main section.

#### Managing Settings
1. Click on the **Settings** icon to open the settings sidebar.
2. Customize your startpage:
   - Enter a custom greeting.
   - Change the background by providing an image URL.
   - Select your preferred search engine.
   - Toggle the visibility of the clock, search bar, and quick links.
3. Click **Save** to apply your changes. All settings will be saved in local storage for future use.

#### Clock
- The clock automatically updates with the current time. You can change the format between 12-hour and 24-hour modes in the settings.

## Files

- **startpage.html**: The main HTML file that contains the structure of the startpage.
- **styles/**: A folder containing all the CSS files for different components of the startpage.
- **scripts/**: JavaScript files that manage the clock, settings, and quick links functionalities.
- **icons/**: Icons used for the settings and quick links buttons.

## Contributing

If you'd like to contribute to StyTab, feel free to submit a pull request or open an issue to suggest improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
