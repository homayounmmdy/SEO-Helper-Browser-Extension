document.addEventListener("DOMContentLoaded", () => {
  // Setup tab buttons
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      openTab(btn.dataset.tab, btn);
    });
  });

  // Load page data immediately
  getPageInfoAndHeadings();

  // Open default tab
  const defaultBtn = document.querySelector('.tab-button[data-tab="overview"]');
  openTab("overview", defaultBtn);
});


function openTab(tabName, buttonElement) {
  // Hide all panes
  document.querySelectorAll(".tab-pane").forEach(el => {
    el.classList.remove("active");
  });

  // Remove active class from all buttons
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.classList.remove("active");
  });

  // Activate selected elements
  document.getElementById(tabName).classList.add("active");
  if (buttonElement) buttonElement.classList.add("active");
}



async function getPageInfoAndHeadings() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getPageDataScript,
  });

  const data = results[0].result;

  // OVERVIEW TAB
  document.getElementById("pageTitle").textContent = data.title || "N/A";
  document.getElementById("pageDescription").textContent = data.description || "N/A";
  document.getElementById("pageUrl").textContent = data.url || "N/A";
  document.getElementById("canonicalUrl").textContent = data.canonicalUrl || "N/A";

  // HEADINGS TAB
  const list = document.getElementById("result");
  list.innerHTML = "";

  Object.entries(data.headingCounts).forEach(([tag, num]) => {
    const li = document.createElement("li");
    li.textContent = `${tag}: ${num}`;
    list.appendChild(li);
  });
}



function getPageDataScript() {
  const title = document.querySelector("title")?.textContent;
  const description = document.querySelector('meta[name="description"]')?.content;
  const url = window.location.href;
  const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href || null;

  const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const headingCounts = {};

  tags.forEach(tag => {
    headingCounts[tag] = document.querySelectorAll(tag).length;
  });

  return { title, description, url, canonicalUrl, headingCounts };
}
