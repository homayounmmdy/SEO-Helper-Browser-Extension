document.getElementById("scanBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: countHeadings
  });

  const counts = result[0].result;
  const list = document.getElementById("result");
  list.innerHTML = "";

  Object.entries(counts).forEach(([tag, num]) => {
    const li = document.createElement("li");
    li.textContent = `${tag}: ${num}`;
    list.appendChild(li);
  });
});

function countHeadings() {
  const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const counts = {};

  tags.forEach(tag => {
    counts[tag] = document.querySelectorAll(tag).length;
  });

  return counts;
}
