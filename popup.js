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

  // Execute script to get both overview info and headings data
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getPageDataScript,
  });

  // Check if results were returned
  if (!results || !results[0] || !results[0].result) {
    console.error("Failed to get page data.");
    return;
  }

  const data = results[0].result;

  // Populate Overview tab
  document.getElementById("pageTitle").textContent = data.title || "Missing";
  document.getElementById("pageDescription").textContent =
    data.description || "Missing";
  document.getElementById("pageUrl").textContent = data.url || "Missing";
  document.getElementById("canonicalUrl").textContent =
    data.canonicalUrl || "Missing";

  // Populate Headings tab with actual content
  const list = document.getElementById("result");
  list.innerHTML = ""; // Clear previous results

  if (data.headings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No headings found on this page.";
    list.appendChild(li);
  } else {
    data.headings.forEach(({ tag, text }) => {
      const li = document.createElement("li");
      li.classList.add(tag); // Add class for hierarchy (padding/font)

      // Create the tag label (e.g., "H1")
      const tagLabel = document.createElement("span");
      tagLabel.className = "tag";
      tagLabel.textContent = tag.toUpperCase(); // e.g., "H1"

      // Create the text node
      const textNode = document.createTextNode(text.trim());

      // Append label and text to the list item
      li.appendChild(tagLabel);
      li.appendChild(textNode);

      list.appendChild(li);
    });
  }
}

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
      // Get text content, trim whitespace, and filter out empty strings
      const text = element.textContent.trim();
      if (text) {
        // Only add headings that have some visible text
        headings.push({ tag: tag, text: text });
      }
    });
  });

  return { title, description, url, canonicalUrl, headings };
}
