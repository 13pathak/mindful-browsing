// Mindful Browsing - Content Script

// Helper to Create Shadow DOM Overlay
function createOverlay(isHardBlock = false) {
    // Check if overlay already exists
    if (document.getElementById('mindful-browsing-host')) return;

    const host = document.createElement('div');
    host.id = 'mindful-browsing-host';
    // Ensure the host doesn't affect page layout but is on top
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100vw'; // Use vw/vh to cover viewport
    host.style.height = '100vh';
    host.style.zIndex = '2147483647'; // Max z-index
    host.style.pointerEvents = 'auto'; // Block clicks below

    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .overlay {
        position: fixed;
        top: 0; 
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', sans-serif;
        color: white;
        z-index: 1000;
        backdrop-filter: blur(5px);
      }
      .modal {
        background: #fff;
        color: #333;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s ease-out;
      }
      h1 { margin-top: 0; color: #2c3e50; }
      p { font-size: 18px; margin-bottom: 30px; line-height: 1.5; }
      .buttons {
        display: flex;
        gap: 20px;
        justify-content: center;
      }
      button {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.1s;
        font-weight: 600;
      }
      button:active { transform: scale(0.98); }
      .btn-work {
        background-color: #2ecc71; /* Green */
        color: white;
      }
      .btn-work:hover { background-color: #27ae60; }
      
      .btn-waste {
        background-color: #e74c3c; /* Red */
        color: white;
      }
      .btn-waste:hover { background-color: #c0392b; }
  
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    // Content depends on mode
    if (isHardBlock) {
        modal.innerHTML = `
         <h1>🚫 Blocked</h1>
         <p>Hard Block Mode is enabled. You cannot access this site right now.</p>
         <div class="buttons">
           <button id="btn-waste" class="btn-waste">Back to Safety</button>
         </div>
       `;
    } else {
        modal.innerHTML = `
         <h1>🧠 Reality Check</h1>
         <p>You've been here a while. Are you being productive or wasting time?</p>
         <div class="buttons">
           <button id="btn-work" class="btn-work">I'm Working / Studying</button>
           <button id="btn-waste" class="btn-waste">I'm Wasting Time</button>
         </div>
       `;
    }

    shadow.appendChild(style);
    shadow.appendChild(overlay);
    overlay.appendChild(modal);

    // Event Listeners
    if (!isHardBlock) {
        shadow.getElementById('btn-work').addEventListener('click', () => {
            // Dismiss and reset timer
            chrome.runtime.sendMessage({ action: 'RESET_TIMER' });
            removeOverlay();
        });
    }

    shadow.getElementById('btn-waste').addEventListener('click', () => {
        // Close Tab
        chrome.runtime.sendMessage({ action: 'CLOSE_TAB' });
    });
}

function removeOverlay() {
    const host = document.getElementById('mindful-browsing-host');
    if (host) host.remove();
}

// Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'SHOW_OVERLAY') {
        createOverlay(false);
    } else if (message.action === 'BLOCK_NOW') {
        createOverlay(true);
    }
});
