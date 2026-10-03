LogParse
A lightweight Chrome extension for parsing, cleaning, filtering, and
copying application logs directly from the active browser tab.

Overview
LogParse is a React + TypeScript Chrome Extension that extracts visible
text from the active webpage, identifies supported application log
entries, and presents them in a structured interface.
The project demonstrates Chrome Extension APIs, React state management,
TypeScript, regular expressions, text parsing, array methods, clipboard
integration, Tailwind CSS, and Vite.
The project uses synthetic log data for testing and does not contain
proprietary company logs, credentials, or internal data.
Problem Statement
Application logs can be difficult to scan when they are mixed into large
amounts of raw text. Developers may need to quickly identify timestamps,
severity, messages, errors, warnings, and key-value metadata.
LogParse provides a small browser utility that turns supported raw log
lines into a cleaner, filterable interface.
Solution
Active Webpage
      ↓
Read webpage text
      ↓
Chrome Scripting API
      ↓
Raw text
      ↓
Log parsing
      ↓
Structured log objects
      ↓
React state
      ↓
Filter + Display + Copy
Example input:
2026-10-03 10:30:12 ERROR Authentication service unavailable service=auth
is converted into timestamp, level, message, and metadata.
Features
- Read visible text from the active webpage
- Parse supported application log lines
- Extract timestamps
- Extract INFO, WARNING, and ERROR levels
- Extract log messages
- Extract key=value metadata
- Display parsed logs
- Show total, INFO, WARNING, and ERROR counts
- Filter logs by severity
- Copy filtered logs to the clipboard
- Show page character and line counts
- Handle pages without supported logs
- Display basic error states
- Tailwind CSS interface
Tech Stack
  Technology                       Purpose
  React                            Popup UI and state management
  TypeScript                       Static typing
  Chrome Extension Manifest V3     Extension architecture
  Chrome Scripting API             Reading the active webpage
  Tailwind CSS                     UI styling
  Vite                             Development and production build
  JavaScript Regular Expressions   Log parsing
  Clipboard API                    Copying results
Architecture
┌──────────────────────────────┐
│        Browser Webpage       │
│        Visible text          │
└──────────────┬───────────────┘
               │
               │ Chrome Scripting API
               ▼
┌──────────────────────────────┐
│          App.tsx             │
│                              │
│  Read webpage                │
│  Parse logs                  │
│  Manage state                │
│  Filter logs                 │
│  Copy results                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          React UI            │
│ Statistics / Filters / Logs  │
└──────────────────────────────┘
The architecture is intentionally small. The goal is to keep the
complete workflow understandable without unnecessary abstractions.
Project Structure
logparse/
│
├── public/
│   ├── manifest.json
│   ├── content.js
│   └── test-logs.html
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
File Responsibilities
public/manifest.json defines the Chrome extension, its Manifest V3
configuration, permissions, and popup entry point.
src/App.tsx contains the main application logic: reading the
active tab, parsing logs, managing React state, filtering results,
calculating statistics, and copying output.
src/main.tsx mounts the React application.
src/index.css loads Tailwind CSS.
public/test-logs.html contains synthetic application logs for
testing.
public/content.js is an earlier content-script implementation
retained during development. The current active data flow uses the
Chrome Scripting API directly.
How It Works
1. Read the active tab
The extension finds the active browser tab using:
chrome.tabs.query({
  active: true,
  currentWindow: true
});
2. Read webpage text
The extension uses chrome.scripting.executeScript() to execute a small
function in the active page:
document.body?.innerText || ""
The result is stored in React state.
3. Split the raw text
The text is separated into individual lines:
const lines = pageText.split("
");
4. Identify log lines
Each line is checked against a regular expression that recognizes the
supported timestamp and log levels.
5. Extract metadata
Key-value pairs such as:
service=auth
status=200
userId=1023
are extracted into a JavaScript object.
6. Store parsed logs
Each result has this shape:
{
  timestamp: "...",
  level: "ERROR",
  message: "...",
  metadata: {
    service: "auth"
  }
}
7. Filter and display
React state controls the selected filter, and JavaScript filter()
produces the displayed results.
8. Copy results
The filtered logs are converted to text and copied using the Clipboard
API.
Supported Log Format
Current supported format:
YYYY-MM-DD HH:mm:ss LEVEL message
Supported levels:
INFO
WARNING
ERROR
Example:
2026-10-03 10:30:03 INFO User authenticated userId=1023
Installation
Prerequisites
- Node.js
- npm
- Google Chrome
Install
git clone <your-repository-url>
cd logparse
npm install
Development
npm run dev
The development server is used primarily for the synthetic test page.
Build the Extension
npm run build
Vite generates a dist/ directory containing the built extension.
Load in Chrome
1. Open chrome://extensions
2. Enable Developer mode
3. Click Load unpacked
4. Select the project's dist/ directory
5. Open the LogParse extension
Testing
The repository includes:
public/test-logs.html
Run:
npm run dev
Then open:
http://localhost:5173/test-logs.html
Open LogParse and click:
1. Read Page
2. Parse Logs
3. Test the severity filters
4. Test Copy
Expected sample results:
Total: 9
INFO: 5
WARNING: 2
ERROR: 2
Example
Raw Input
2026-10-03 10:30:01 INFO Application started
2026-10-03 10:30:03 INFO User authenticated userId=1023
2026-10-03 10:30:05 WARNING API response slow endpoint=/users
2026-10-03 10:30:07 ERROR Database connection timeout
Parsed Representation
INFO
2026-10-03 10:30:01
Application started

INFO
2026-10-03 10:30:03
User authenticated
userId=1023

WARNING
2026-10-03 10:30:05
API response slow
endpoint=/users

ERROR
2026-10-03 10:30:07
Database connection timeout
Permissions
The extension currently uses:
"permissions": [
  "activeTab",
  "scripting"
]
activeTab allows interaction with the tab the user is actively working
with after invoking the extension.
scripting allows the extension to execute the small page-reading
function in the active tab.
The current implementation processes the captured text locally in the
browser.
Privacy
LogParse does not currently send webpage content to a backend, use an
external database, require an account, or transmit parsed logs to a
remote service.
All included test logs are synthetic.
Users should still avoid processing confidential information in
environments where they do not have permission to do so.
Limitations
The current V1 intentionally has a small scope.
It does not currently support:
- JSON logs
- Multi-line stack traces
- Complex nested log formats
- DEBUG/FATAL/custom levels
- Advanced log correlation
- Server-side log sources
- Chrome internal pages such as chrome:// pages
These limitations are deliberate so the core project remains small and
understandable.
Future Improvements
Possible future versions could add:
- Additional log formats
- DEBUG and FATAL levels
- JSON parsing
- Multi-line stack trace detection
- Search within parsed logs
- JSON/CSV export
- Dark mode
- Parsing history
- Automated parser tests
- Chrome Web Store publication
Interview Summary
A concise project explanation:
LogParse is a Chrome extension I built using React, TypeScript, and
Chrome Extension APIs. It reads visible text from the active browser
tab, identifies supported application log entries, extracts
timestamps, severity, messages, and key-value metadata, and displays
the results in a filterable interface. Users can filter logs by
severity and copy cleaned results. The processing happens locally in
the browser.

Architecture
User
 ↓
Chrome Extension Popup
 ↓
Chrome Tabs API
 ↓
Chrome Scripting API
 ↓
Active Webpage
 ↓
Raw Text
 ↓
Parsing Logic
 ↓
React State
 ↓
Filter / Display / Copy
Project Status
Version: 1.0.0
Status: Functional V1 / Portfolio Project
The project is intentionally lightweight so the complete implementation
can be understood and explained clearly.
Disclaimer
LogParse is a portfolio and educational project.
All sample logs included in the project are synthetic and created solely
for development and testing.
No proprietary company code, internal logs, credentials, or confidential
information should be included in the repository.
License
For a public portfolio repository, an MIT License is a common option.
Add the appropriate license file if you decide to open-source the
project.
