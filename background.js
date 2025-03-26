// Background script for the Phishing Detector extension
console.log("Background script running...");

// Listener to handle messages from popup.js or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "log") {
        console.log("Log from popup:", message.data);
    }
    sendResponse({ status: "received" });
});
