console.log("Background script running...");

// ✅ Fix: Function to check if a string is a valid URL
function isValidURL(str) {
    try {
        new URL(str);
        return /^https?:\/\//.test(str); // Ensures it starts with http:// or https://
    } catch (e) {
        return false;
    }
}

// ✅ Function to sanitize URL (removes protocol, 'www.', and trailing slashes)
function sanitizeUrl(url) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
}

// ✅ Listener for messages from popup.js or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkPhishing") {
        let inputUrl = message.url.trim();

        // ✅ Fix: Validate URL before checking phishing list
        if (!isValidURL(inputUrl)) {
            sendResponse({ result: "❌ Invalid URL!" });
            return;
        }

        fetch(chrome.runtime.getURL("phishing_list.js"))
            .then(response => response.text())
            .then(data => {
                let phishingUrls = data.split("\n").map(link => sanitizeUrl(link.trim()));
                let sanitizedInput = sanitizeUrl(inputUrl);

                const result = phishingUrls.includes(sanitizedInput) 
                    ? "🚨 Phishing Detected!" 
                    : "✅ Looks Safe!";
                
                sendResponse({ result });
            })
            .catch(error => {
                console.error("Error loading phishing list:", error);
                sendResponse({ result: "❌ Error checking!" });
            });

        return true; // Keeps the message channel open for async response
    }
});
