// Mindful Browsing - Background Script

let currentTabId = null;
let currentUrl = null;
let timerRunning = false;
let checkInInterval = 15; // default minutes

const ALARM_NAME = 'mindful_browsing_check_in';

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['checkInInterval', 'hardBlockMode', 'exceptionList'], (result) => {
        if (!result.checkInInterval) chrome.storage.local.set({ checkInInterval: 15 });
        if (result.hardBlockMode === undefined) chrome.storage.local.set({ hardBlockMode: false });
        if (!result.exceptionList) chrome.storage.local.set({ exceptionList: [] });
    });
});

// Listen for updates to settings
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes.checkInInterval) {
            checkInInterval = changes.checkInInterval.newValue;
        }
        // If exceptionList or hardBlockMode changes, we might need to re-evaluate the current tab
        checkCurrentTab();
    }
});

// Tab Activation (Switching tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
    currentTabId = activeInfo.tabId;
    chrome.tabs.get(currentTabId, (tab) => {
        // Avoid checking chrome:// or other restricted pages
        if (chrome.runtime.lastError || !tab) return;
        currentUrl = tab.url;
        checkCurrentTab();
    });
});

// Tab Updates (Navigation within a tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === currentTabId && changeInfo.url) {
        currentUrl = changeInfo.url;
        checkCurrentTab();
    }
});

// Check if the current site is in the exception list
function checkCurrentTab() {
    if (!currentUrl || !currentUrl.startsWith('http')) {
        stopTimer();
        return; // Only monitor http/https pages
    }

    chrome.storage.local.get(['exceptionList', 'checkInInterval', 'hardBlockMode'], (data) => {
        const exceptionList = data.exceptionList || [];
        // Check if the current URL matches any domain in the exception exceptionList
        const isException = exceptionList.some(site => currentUrl.includes(site));
        checkInInterval = data.checkInInterval || 15;

        if (isException) {
            // It is an exception, so we DO NOT watch it.
            // Stop any existing timer.
            console.log('Mindful Browsing: Site is in exception list, ignoring.', currentUrl);
            stopTimer();
        } else {
            // Not an exception, so we monitor it.
            console.log('Mindful Browsing: Watching (Not in exception list)', currentUrl);
            if (data.hardBlockMode) {
                // Hard Block Mode: Block Immediately
                chrome.tabs.sendMessage(currentTabId, { action: 'BLOCK_NOW' }).catch(() => { });
                stopTimer();
            } else {
                // Normal Mode: Start Timer if not running
                if (!timerRunning) {
                    startTimer();
                }
            }
        }
    });
}

function startTimer() {
    console.log(`Starting timer for ${checkInInterval} minutes`);
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: checkInInterval });
    timerRunning = true;
}

function stopTimer() {
    if (timerRunning) {
        console.log('Stopping timer');
        chrome.alarms.clear(ALARM_NAME);
        timerRunning = false;
    }
}

// Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        console.log('Alarm Triggered! Sending Reality Check.');
        if (currentTabId) {
            chrome.tabs.sendMessage(currentTabId, { action: 'SHOW_OVERLAY' }).catch((err) => {
                console.log('Could not send message to tab (maybe closed or restricted):', err);
            });
            // Optionally restart the timer immediately or wait for the user to dismiss
            // Implementing logic: Wait for user. If they click "Working", we reset.
            timerRunning = false; // Timer allows to restart after dismissal
        }
    }
});

// Listen for messages from Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'RESET_TIMER') {
        startTimer();
    } else if (message.action === 'CLOSE_TAB') {
        if (sender.tab && sender.tab.id) {
            chrome.tabs.remove(sender.tab.id);
        }
    }
});
