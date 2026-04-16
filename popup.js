// ------------------- DOM Elements -------------------
const DOM = {
  tabs: {
    buttons: () => document.querySelectorAll('.tab-button'),
    panes: () => document.querySelectorAll('.tab-pane')
  },
  overview: {
    title: () => document.getElementById('pageTitle'),
    description: () => document.getElementById('pageDescription'),
    url: () => document.getElementById('pageUrl'),
    canonical: () => document.getElementById('canonicalUrl')
  },
  headings: {
    list: () => document.getElementById('result'),
    statsContainer: () => document.getElementById('stats-chips-container')
  },
  social: {
    list: () => document.getElementById('social-list')
  },
  schema: {
    output: () => document.getElementById('schema-output')
  }
};

// ------------------- Initialization -------------------
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupTabListeners();
  loadPageData();
  openDefaultTab();
}

// ------------------- Tab Management -------------------
function setupTabListeners() {
  DOM.tabs.buttons().forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab, btn));
  });
}

function switchTab(tabName, activeButton) {
  // Hide all panes
  DOM.tabs.panes().forEach(pane => pane.classList.remove('active'));
  // Deactivate all buttons
  DOM.tabs.buttons().forEach(btn => btn.classList.remove('active'));
  // Activate selected pane
  const targetPane = document.getElementById(tabName);
  if (targetPane) targetPane.classList.add('active');
  // Activate clicked button
  if (activeButton) activeButton.classList.add('active');
}

function openDefaultTab() {
  const defaultBtn = document.querySelector('.tab-button[data-tab="overview"]');
  if (defaultBtn) switchTab('overview', defaultBtn);
}

// ------------------- Main Data Loading -------------------
async function loadPageData() {
  try {
    const activeTab = await getCurrentTab();
    if (!activeTab) throw new Error('No active tab found');

    const pageData = await executeContentScript(activeTab.id);
    if (!pageData) throw new Error('Failed to extract page data');

    renderAllTabs(pageData);
  } catch (error) {
    console.error('SEO Helper Error:', error);
    renderErrorState();
  }
}

// ------------------- Chrome Extension Helpers -------------------
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function executeContentScript(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    function: extractPageDataScript
  });
  return results?.[0]?.result || null;
}

// ------------------- Rendering Functions -------------------
function renderAllTabs(data) {
  renderOverviewTab(data);
  renderHeadingsTab(data);
  renderSocialTab(data);
  renderSchemaTab(data);
}

function renderOverviewTab(data) {
  setTextContent(DOM.overview.title(), data.title?.trim() || '❌ Missing title');
  setTextContent(DOM.overview.description(), data.description?.trim() || 'Not specified');
  setTextContent(DOM.overview.url(), data.url || '—');
  setTextContent(DOM.overview.canonical(), data.canonicalUrl || '❌ Not set (SEO risk)');
}

function renderHeadingsTab(data) {
  renderHeadingsList(data.headings);
  renderHeadingStats(data.headings);
}

function renderHeadingsList(headings) {
  const container = DOM.headings.list();
  if (!container) return;
  container.innerHTML = '';

  if (!headings.length) {
    container.innerHTML = '<li class="empty-heading">📭 No heading tags (H1-H6) found.</li>';
    return;
  }

  headings.forEach(({ tag, text }) => {
    const li = document.createElement('li');
    li.className = tag;

    const badge = createElement('span', 'heading-badge', tag.toUpperCase());
    const textSpan = createElement('span', 'heading-text', text.trim());
    textSpan.style.flex = '1';
    textSpan.style.wordBreak = 'break-word';

    li.append(badge, textSpan);
    container.appendChild(li);
  });
}

function renderHeadingStats(headings) {
  const container = DOM.headings.statsContainer();
  if (!container) return;
  container.innerHTML = '';

  const counts = countHeadingsByTag(headings);
  const order = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  let hasAny = false;

  order.forEach(tag => {
    const count = counts[tag] || 0;
    if (count > 0) {
      hasAny = true;
      const chip = createElement('div', 'chip');
      chip.innerHTML = `<span>${tag.toUpperCase()}</span> ${count}`;
      container.appendChild(chip);
    }
  });

  if (!hasAny && !headings.length) {
    container.innerHTML = '<div class="chip">⚡ No headings found</div>';
  }
}

function renderSocialTab(data) {
  const container = DOM.social.list();
  if (!container) return;
  container.innerHTML = '';

  const socialTags = data.socialMetaTags || {};
  const keys = Object.keys(socialTags).sort();

  if (!keys.length) {
    container.innerHTML = '<li class="empty-state">🌱 No Open Graph / Twitter meta tags</li>';
    return;
  }

  keys.forEach(key => {
    const values = socialTags[key];
    values.forEach(value => {
      const item = createElement('li', 'social-item');
      const keySpan = createElement('div', 'social-key', key);
      const valSpan = createElement('div', 'social-value', value || '—');
      item.append(keySpan, valSpan);
      container.appendChild(item);
    });
  });
}

function renderSchemaTab(data) {
  const container = DOM.schema.output();
  if (!container) return;

  if (data.schemaData?.length) {
    container.textContent = JSON.stringify(data.schemaData, null, 2);
  } else {
    container.textContent = '✨ No JSON-LD structured data detected.';
  }
}

function renderErrorState() {
  setTextContent(DOM.overview.title(), '⚠️ Unable to load');
  setTextContent(DOM.overview.description(), 'Try refreshing the page');
  setTextContent(DOM.overview.url(), '—');
  setTextContent(DOM.overview.canonical(), '—');

  if (DOM.headings.list()) {
    DOM.headings.list().innerHTML = '<li>❌ Could not extract headings</li>';
  }
  if (DOM.social.list()) {
    DOM.social.list().innerHTML = '<li class="empty-state">❌ No social data available</li>';
  }
  if (DOM.schema.output()) {
    DOM.schema.output().textContent = '❌ Unable to fetch schema data';
  }
}

// ------------------- Utility Functions -------------------
function setTextContent(element, text) {
  if (element) element.textContent = text;
}

function createElement(tag, className, textContent = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

function countHeadingsByTag(headings) {
  return headings.reduce((counts, { tag }) => {
    counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }, {});
}

// ------------------- Content Script (Injected into Page) -------------------
// This function runs in the context of the web page, NOT the extension popup
function extractPageDataScript() {
  // Helper: safe text extraction
  const getText = (selector) => document.querySelector(selector)?.textContent || '';
  const getContent = (selector, attribute = 'content') =>
      document.querySelector(selector)?.getAttribute(attribute) || '';

  // Basic SEO data
  const title = getText('title');
  const description = getContent('meta[name="description"]');
  const url = window.location.href;
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href || null;

  // Extract headings (H1-H6)
  const headings = [];
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  headingTags.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      const text = el.textContent.trim();
      if (text) headings.push({ tag, text });
    });
  });

  // Extract social meta tags (Open Graph & Twitter)
  const socialMetaTags = {};
  const socialSelectors = 'meta[property^="og:"], meta[name^="twitter:"]';

  document.querySelectorAll(socialSelectors).forEach(tag => {
    const key = tag.getAttribute('property') || tag.getAttribute('name');
    const value = tag.getAttribute('content');
    if (key && value) {
      if (!socialMetaTags[key]) socialMetaTags[key] = [];
      if (!socialMetaTags[key].includes(value)) socialMetaTags[key].push(value);
    }
  });

  // Extract JSON-LD Schema
  const schemaData = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const parsed = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) schemaData.push(...parsed);
      else schemaData.push(parsed);
    } catch (e) {
      // Silently skip invalid JSON
      console.debug('Invalid JSON-LD skipped');
    }
  });

  return {
    title,
    description,
    url,
    canonicalUrl,
    headings,
    socialMetaTags,
    schemaData
  };
}