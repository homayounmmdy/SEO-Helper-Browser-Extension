document.addEventListener("DOMContentLoaded", () => {
  // Setup tab buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      openTab(btn.dataset.tab, btn);
    });
  });

  // Load page data immediately when popup opens
  getPageInfoAndHeadings();

  // Open the default tab ("Overview")
  const defaultBtn = document.querySelector('.tab-button[data-tab="overview"]');
  if (defaultBtn) {
    openTab("overview", defaultBtn);
  }
});

function openTab(tabName, buttonElement) {
  // Hide all tab panes
  document.querySelectorAll(".tab-pane").forEach((el) => {
    el.classList.remove("active");
  });

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show the active tab pane
  const activePane = document.getElementById(tabName);
  if (activePane) {
    activePane.classList.add("active");
  }

  // Add active class to the clicked button
  if (buttonElement) {
    buttonElement.classList.add("active");
  }
}

async function getPageInfoAndHeadings() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getPageDataScript,
  });

  if (!results || !results[0] || !results[0].result) {
    console.error("Failed to get page data.");
    return;
  }

  const data = results[0].result;

  // Populate Schema tab
  const schemaOutput = document.getElementById("schema-output");
  if (data.schemaData && data.schemaData.length > 0) {
    schemaOutput.textContent = JSON.stringify(data.schemaData, null, 2);
  } else {
    schemaOutput.textContent = "No JSON-LD schema found on this page.";
  }

  // Populate Overview tab
  document.getElementById("pageTitle").textContent = data.title || "Missing";
  document.getElementById("pageDescription").textContent =
    data.description || "Missing";
  document.getElementById("pageUrl").textContent = data.url || "Missing";
  document.getElementById("canonicalUrl").textContent =
    data.canonicalUrl || "Missing";

  // Populate Headings tab with actual content
  const headingsList = document.getElementById("result");
  headingsList.innerHTML = ""; // Clear previous results

  if (data.headings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No headings found on this page.";
    headingsList.appendChild(li);
  } else {
    data.headings.forEach(({ tag, text }) => {
      const li = document.createElement("li");
      li.classList.add(tag);

      const tagLabel = document.createElement("span");
      tagLabel.className = "tag";
      tagLabel.textContent = tag.toUpperCase();

      const textNode = document.createTextNode(text.trim());

      li.appendChild(tagLabel);
      li.appendChild(textNode);

      headingsList.appendChild(li);
    });
  }

  // Count headings by tag
  const headingCounts = {};
  data.headings.forEach((heading) => {
    headingCounts[heading.tag] = (headingCounts[heading.tag] || 0) + 1;
  });

  // Populate Headings Status
  const statusList = document.getElementById("headings-status");
  statusList.innerHTML = ""; // Clear previous status

  const sortedTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  sortedTags.forEach((tag) => {
    const count = headingCounts[tag] || 0;
    if (count > 0) {
      const li = document.createElement("li");
      li.className = "heading-status-item";

      const tagSpan = document.createElement("span");
      tagSpan.className = "tag-count-tag";
      tagSpan.textContent = tag.toUpperCase();

      const countSpan = document.createElement("span");
      countSpan.className = "tag-count-number";
      countSpan.textContent = count;

      li.appendChild(tagSpan);
      li.appendChild(countSpan);
      statusList.appendChild(li);
    }
  });

  // Add a general status message if no headings are found at all
  if (data.headings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No headings found on this page.";
    statusList.appendChild(li);
  }

  // Populate Social tab
  const socialList = document.getElementById("social-list");
  socialList.innerHTML = ""; // Clear previous results

  if (Object.keys(data.socialMetaTags).length === 0) {
    const li = document.createElement("li");
    li.textContent = "No Open Graph or Twitter meta tags found.";
    socialList.appendChild(li);
  } else {
    // Sort keys for consistent display (e.g., og:title, og:description, twitter:card, etc.)
    const sortedKeys = Object.keys(data.socialMetaTags).sort();

    sortedKeys.forEach((key) => {
      const values = data.socialMetaTags[key];
      values.forEach((value) => {
        const li = document.createElement("li");
        li.className = "social-meta-item";

        const keySpan = document.createElement("span");
        keySpan.className = "social-meta-key";
        keySpan.textContent = key;

        const valueSpan = document.createElement("span");
        valueSpan.className = "social-meta-value";
        valueSpan.textContent = value;

        li.appendChild(keySpan);
        li.appendChild(valueSpan);
        socialList.appendChild(li);
      });
    });
  }
}

// This function will be executed in the context of the current page
// This function will be executed in the context of the current page
function getPageDataScript() {
  const title = document.querySelector("title")?.textContent;
  const description = document.querySelector(
    'meta[name="description"]',
  )?.content;
  const url = window.location.href;
  const canonicalUrl =
    document.querySelector('link[rel="canonical"]')?.href || null;

  const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const headings = [];

  tags.forEach((tag) => {
    document.querySelectorAll(tag).forEach((element) => {
      const text = element.textContent.trim();
      if (text) {
        headings.push({ tag: tag, text: text });
      }
    });
  });

  // Get Open Graph and Twitter meta tags
  const socialMetaTags = {};
  const metaTags = document.querySelectorAll(
    'meta[property^="og:"], meta[name^="twitter:"]',
  );

  metaTags.forEach((tag) => {
    const key = tag.getAttribute("property") || tag.getAttribute("name");
    const value = tag.getAttribute("content");
    if (key && value) {
      // Store them, can be organized later
      if (!socialMetaTags[key]) {
        socialMetaTags[key] = [];
      }
      socialMetaTags[key].push(value);
    }
  });
  const schemaScripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  const schemaData = [];

  schemaScripts.forEach((script) => {
    try {
      const json = JSON.parse(script.textContent);
      // Handle both single objects and arrays of schemas
      if (Array.isArray(json)) {
        schemaData.push(...json);
      } else {
        schemaData.push(json);
      }
    } catch (e) {
      console.error("Error parsing JSON-LD", e);
    }
  });

  return {
    title,
    description,
    url,
    canonicalUrl,
    headings,
    socialMetaTags,
    schemaData,
  };
}
