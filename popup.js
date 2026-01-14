document.addEventListener('DOMContentLoaded', () => {
  const checkInIntervalInput = document.getElementById('checkInInterval');
  const hardBlockModeInput = document.getElementById('hardBlockMode');
  const newSiteInput = document.getElementById('newSiteInput');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const exceptionListEl = document.getElementById('exceptionList');

  // Load settings
  chrome.storage.local.get(['checkInInterval', 'hardBlockMode', 'exceptionList'], (result) => {
    checkInIntervalInput.value = result.checkInInterval || 15;
    hardBlockModeInput.checked = result.hardBlockMode || false;
    const exceptionList = result.exceptionList || [];
    renderExceptionList(exceptionList);
  });

  // Save Interval
  checkInIntervalInput.addEventListener('change', () => {
    const interval = parseInt(checkInIntervalInput.value, 10);
    chrome.storage.local.set({ checkInInterval: interval });
  });

  // Save Hard Block Mode
  hardBlockModeInput.addEventListener('change', () => {
    const isEnabled = hardBlockModeInput.checked;
    chrome.storage.local.set({ hardBlockMode: isEnabled });
  });

  // Add Site
  addSiteBtn.addEventListener('click', addSite);
  newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite();
  });

  function addSite() {
    const site = newSiteInput.value.trim().toLowerCase();
    if (!site) return;

    chrome.storage.local.get(['exceptionList'], (result) => {
      const exceptionList = result.exceptionList || [];
      // Simple domain extraction/validation
      const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

      if (!exceptionList.includes(cleanSite)) {
        exceptionList.push(cleanSite);
        chrome.storage.local.set({ exceptionList }, () => {
          renderExceptionList(exceptionList);
          newSiteInput.value = '';
        });
      }
    });
  }

  // Render List
  function renderExceptionList(list) {
    exceptionListEl.innerHTML = '';
    list.forEach((site) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = site;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '&times;';
      removeBtn.onclick = () => removeSite(site);

      li.appendChild(span);
      li.appendChild(removeBtn);
      exceptionListEl.appendChild(li);
    });
  }

  function removeSite(siteToRemove) {
    chrome.storage.local.get(['exceptionList'], (result) => {
      let exceptionList = result.exceptionList || [];
      exceptionList = exceptionList.filter(site => site !== siteToRemove);
      chrome.storage.local.set({ exceptionList }, () => {
        renderExceptionList(exceptionList);
      });
    });
  }
});
