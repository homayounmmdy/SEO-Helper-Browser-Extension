# 🔍 SEO Helper - Browser Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/homayounmmdy/SEO-Helper)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Firefox](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://addons.mozilla.org/en-US/firefox/addon/seo-helper/)

> **✅ Available Now on Firefox Add-ons!**  
> A powerful, modern SEO analysis tool that helps you audit any webpage directly from your browser.

## 📥 Installation

### 🦊 Firefox (Recommended)
**Install directly from the Firefox Add-ons Store:**
👉 **[SEO Helper on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/seo-helper/)**

### 🌐 Chrome/Chromium
Due to international payment restrictions, the extension is not currently available on the Chrome Web Store. You can load it manually:

1. Download the source code from [GitHub](https://github.com/homayounmmdy/SEO-Helper)
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select the extension folder

## ✨ Features

### 📄 Page Overview
- **Title & Meta Description** - Check if they're properly optimized
- **Canonical URL** - Detect duplicate content issues
- **Language Detection** - Verify language attributes
- **Robots Meta Tags** - Check indexing directives
- **X-Robots-Tag** - HTTP header level directives
- **Meta Keywords** - Legacy keyword tracking
- **Publisher Information** - Identify content authority
- **Word Count** - Content length analysis with color-coded feedback

### 🔗 Link Analysis
- **Internal vs External Links** - Understand your link profile
- **Nofollow/Noreferrer Detection** - Track link attributes
- **HTTPS Security Check** - Identify insecure external links
- **Link Filters** - Filter by type (internal, external, nofollow, noreferrer, secure, insecure)
- **Domain Extraction** - See external domains at a glance

### 📊 Heading Structure
- **H1-H6 Hierarchy** - Visual indentation showing structure
- **Heading Counts** - Quick stats on heading distribution
- **Empty Heading Detection** - Identify missing or empty headings

### 📱 Social Meta Tags
- **Open Graph Tags** - og:title, og:description, og:image, etc.
- **Twitter Cards** - twitter:card, twitter:title, twitter:description
- **Complete Social Preview** - All social meta tags in one view

### 📐 Structured Data
- **JSON-LD Schema Detection** - Extract all structured data
- **Pretty JSON Formatting** - Easy to read and analyze
- **Multiple Schema Support** - Handles arrays and multiple scripts

## 📋 Requirements

- **Firefox** (Version 88 or later) - Recommended
- **Chrome/Chromium** (Version 88 or later) - Manual installation only
- No additional dependencies required

## 🛠️ Manual Installation (For Chrome & Other Browsers)

### Step 1: Download the Extension Files

Download or clone this repository:
```bash
git clone https://github.com/homayounmmdy/SEO-Helper.git
```

Or download the ZIP and extract it.

### Step 2: Load the Extension in Chrome

1. Open **Google Chrome** browser
2. Type `chrome://extensions` in the address bar and press Enter
3. Enable **Developer mode** (toggle switch in the top-right corner)
4. Click the **Load unpacked** button
5. Select the extension folder

### Step 3: Load in Firefox (Development)

1. Open **Firefox** browser
2. Type `about:debugging` in the address bar
3. Click **This Firefox** in the left sidebar
4. Click **Load Temporary Add-on**
5. Navigate to the extension folder and select the `manifest.json` file

## 🔒 Privacy & Permissions

This extension requires the following permissions:
- **activeTab**: To analyze the current webpage
- **scripting**: To inject the content script for analysis
- **host_permissions**: To access `<all_urls>` for extracting page data

**No data is collected, stored, or transmitted.** All analysis happens locally in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Homayoun MMDY - [@homayounmmdy](https://github.com/homayounmmdy)

Project Link: [https://github.com/homayounmmdy/SEO-Helper](https://github.com/homayounmmdy/SEO-Helper)
