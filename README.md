# 🔍 SEO Helper - Chrome Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/homayounmmdy/SEO-Helper-Browser-Extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow.svg)](https://chrome.google.com/webstore)

> **🚀 Coming Soon to Chrome Web Store!**  
> A powerful, modern SEO analysis tool that helps you audit any webpage directly from your browser.


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

- **Google Chrome** browser (Version 88 or later)
- No additional dependencies required

## 🛠️ Installation Instructions (Developer Mode)

Since this extension is not yet published on the Chrome Web Store, you'll need to load it manually in developer mode.

### Step 1: Download the Extension Files

Create a new folder on your computer called `seo-helper` and save these three files inside:

```
seo-helper/
├── manifest.json
├── popup.html
├── popup.js
├── style.css
└── icon.png 
```

### Step 2: Load the Extension in Chrome

1. Open **Google Chrome** browser
2. Type `chrome://extensions` in the address bar and press Enter
3. Enable **Developer mode** (toggle switch in the top-right corner)
4. Click the **Load unpacked** button (top-left)
   ![Load Unpacked Button](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/click-load-unpacked-
