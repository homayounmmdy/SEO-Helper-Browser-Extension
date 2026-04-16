// ============================================
// SEO HELPER CHROME EXTENSION - POPUP SCRIPT
// Clean, Modular, Production-Ready
// ============================================

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
  },
  links: {
    summary: () => document.getElementById('links-summary'),
    list: () => document.getElementById('links-list'),
    filters: () => document.querySelectorAll('.link-filter')
  }
};

// ------------------- State -------------------
let currentLinksData = [];

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

    currentLinksData = pageData.links || [];
    renderAllTabs(pageData);
    setupLinkFilters();
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
  renderLinksTab(data);
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

function renderLinksTab(data) {
  renderLinksSummary(data.links);
  renderLinksList(data.links);
}

function renderLinksSummary(links) {
  const container = DOM.links.summary();
  if (!container) return;

  const total = links.length;
  const internal = links.filter(l => l.isInternal).length;
  const external = links.filter(l => !l.isInternal).length;
  const nofollow = links.filter(l => l.hasNofollow).length;
  const noReferrer = links.filter(l => l.hasNoReferrer).length;
  const secureLinks = links.filter(l => l.isSecure).length;
  const vulnerableLinks = links.filter(l => !l.isSecure && !l.isInternal).length;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Links</div>
      </div>
      <div class="stat-card internal">
        <div class="stat-value">${internal}</div>
        <div class="stat-label">🔗 Internal</div>
      </div>
      <div class="stat-card external">
        <div class="stat-value">${external}</div>
        <div class="stat-label">🌐 External</div>
      </div>
      <div class="stat-card nofollow">
        <div class="stat-value">${nofollow}</div>
        <div class="stat-label">🚫 nofollow</div>
      </div>
      <div class="stat-card noreferrer">
        <div class="stat-value">${noReferrer}</div>
        <div class="stat-label">🔒 noreferrer</div>
      </div>
      <div class="stat-card security">
        <div class="stat-value">${secureLinks}</div>
        <div class="stat-label">✅ HTTPS</div>
      </div>
    </div>
    ${vulnerableLinks > 0 ? `<div class="warning-banner">⚠️ ${vulnerableLinks} external HTTP link(s) detected (security risk)</div>` : ''}
  `;
}

function renderLinksList(links, filter = 'all') {
  const container = DOM.links.list();
  if (!container) return;

  let filteredLinks = links;
  if (filter === 'internal') {
    filteredLinks = links.filter(l => l.isInternal);
  } else if (filter === 'external') {
    filteredLinks = links.filter(l => !l.isInternal);
  } else if (filter === 'nofollow') {
    filteredLinks = links.filter(l => l.hasNofollow);
  } else if (filter === 'noreferrer') {
    filteredLinks = links.filter(l => l.hasNoReferrer);
  } else if (filter === 'secure') {
    filteredLinks = links.filter(l => l.isSecure);
  } else if (filter === 'insecure') {
    filteredLinks = links.filter(l => !l.isSecure);
  }

  if (!filteredLinks.length) {
    container.innerHTML = '<div class="empty-state">🔍 No links match this filter</div>';
    return;
  }

  container.innerHTML = filteredLinks.map(link => `
    <div class="link-item ${link.isInternal ? 'internal-link' : 'external-link'}">
      <div class="link-url">
        <a href="${link.url}" target="_blank" rel="noopener">${truncateUrl(link.url, 70)}</a>
      </div>
      <div class="link-meta">
        ${link.isInternal ? '<span class="badge internal-badge">🔗 Internal</span>' : '<span class="badge external-badge">🌐 External</span>'}
        ${link.hasNofollow ? '<span class="badge nofollow-badge">🚫 nofollow</span>' : '<span class="badge follow-badge">✅ follow</span>'}
        ${link.hasNoReferrer ? '<span class="badge noreferrer-badge">🔒 noreferrer</span>' : '<span class="badge referrer-badge">📎 referrer</span>'}
        ${link.isSecure ? '<span class="badge secure-badge">🔒 HTTPS</span>' : '<span class="badge insecure-badge">⚠️ HTTP</span>'}
        ${link.isInternal ? '' : `<span class="badge domain-badge">${getDomain(link.url)}</span>`}
      </div>
      ${link.text ? `<div class="link-anchor">📝 ${escapeHtml(link.text)}</div>` : ''}
    </div>
  `).join('');
}

function setupLinkFilters() {
  const filters = DOM.links.filters();
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Render filtered list
      renderLinksList(currentLinksData, btn.dataset.filter);
    });
  });
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

function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
  if (DOM.links.list()) {
    DOM.links.list().innerHTML = '<div class="empty-state">❌ Could not extract links</div>';
  }
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
  const baseDomain = getBaseDomain(url);

  // Extract headings (H1-H6)
  const headings = [];
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  headingTags.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      const text = el.textContent.trim();
      if (text) headings.push({ tag, text });
    });
  });

  // Extract all links (anchor tags)
  const links = [];
  const anchors = document.querySelectorAll('a[href]');

  anchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    let fullUrl = href;
    try {
      fullUrl = new URL(href, url).href;
    } catch {
      return; // Invalid URL, skip
    }

    const isInternal = isInternalLink(fullUrl, baseDomain);
    const rel = anchor.getAttribute('rel') || '';
    const hasNofollow = rel.includes('nofollow');
    const hasNoReferrer = rel.includes('noreferrer') || rel.includes('noreferrer');
    const isSecure = fullUrl.startsWith('https:');
    const text = anchor.textContent?.trim() || anchor.querySelector('img')?.alt || '[image]';

    links.push({
      url: fullUrl,
      text: text.substring(0, 150),
      isInternal,
      hasNofollow,
      hasNoReferrer,
      isSecure
    });
  });

  // Remove duplicates (keep first occurrence)
  const uniqueLinks = [];
  const seenUrls = new Set();
  for (const link of links) {
    if (!seenUrls.has(link.url)) {
      seenUrls.add(link.url);
      uniqueLinks.push(link);
    }
  }

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

  // Helper functions
  function getBaseDomain(fullUrl) {
    try {
      const urlObj = new URL(fullUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  function isInternalLink(linkUrl, baseDomain) {
    try {
      const linkDomain = new URL(linkUrl).hostname.replace('www.', '');
      return linkDomain === baseDomain;
    } catch {
      return false;
    }
  }

  return {
    title,
    description,
    url,
    canonicalUrl,
    headings,
    socialMetaTags,
    schemaData,
    links: uniqueLinks
  };
}