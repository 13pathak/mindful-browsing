# Mindful Browsing Chrome Extension

Mindful Browsing helps you stay focused by monitoring your web activity and interrupting you with a "Reality Check" after a set interval. It encourages mindful usage of the web without being overly restrictive.

## features

- **Universal Monitoring**: Monitors all websites by default to ensure you stay on track.
- **Exception List**: Add specific websites (e.g., productivity tools, research sites) to an "Exception List" to bypass monitoring.
- **Reality Checks**: After a configurable time interval (default: 15 mins), an overlay appears asking if you are being productive.
    - **"I'm Working"**: Dismisses the check and resets the timer.
    - **"I'm Wasting Time"**: Closes the tab.
- **Hard Block Mode**: Optionally enable strictly blocking access to non-exception sites instead of just asking.
- **Privacy First**: All data (settings, lists) is stored locally in your browser (`chrome.storage.local`). No data is sent to external servers.

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the folder containing the extension files.

## Usage

1. Click the extension icon in the toolbar.
2. **Exception List**: Add domains you want to *exclude* from monitoring (e.g., `google.com`, `wikipedia.org`).
3. **Check-in Interval**: Set how many minutes you can browse monitored sites before a check-in.
4. **Hard Block Mode**: Toggle this on if you want to be completely blocked from non-exception sites.

## License

MIT License
