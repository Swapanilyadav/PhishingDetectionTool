function extractUrlFeatures(url) {
    let urlLength = url.length;
    let specialChars = (url.match(/[@\-_\.=&\/]/g) || []).length;
    let ipPresent = /(\d{1,3}\.){3}\d{1,3}/.test(url);
    let httpsUsed = url.startsWith("https") ? 1 : 0;
    
    return { urlLength, specialChars, ipPresent, httpsUsed };
}

function extractEmailFeatures(emailText) {
    const SPAM_WORDS = ["urgent", "click", "verify", "password", "account", "login", "free", "credit card", "bank", "suspended"];
    let words = emailText.toLowerCase().split(/\s+/);
    let spamCount = words.filter(word => SPAM_WORDS.includes(word)).length;
    let spamProbability = words.length > 0 ? spamCount / words.length : 0;

    return { spamProbability };
}

function detectPhishing(url, emailText) {
    let urlFeatures = extractUrlFeatures(url);
    let emailFeatures = extractEmailFeatures(emailText);

    // Simple detection logic (Scoring System)
    let phishingScore = 0;

    if (urlFeatures.urlLength > 40) phishingScore += 1;
    if (urlFeatures.specialChars > 5) phishingScore += 1;
    if (urlFeatures.ipPresent) phishingScore += 2;
    if (!urlFeatures.httpsUsed) phishingScore += 1;
    if (emailFeatures.spamProbability > 0.2) phishingScore += 2;

    return phishingScore >= 3 ? "🚨 Phishing Detected!" : "✅ Looks Safe!";
}

window.detectPhishing = detectPhishing;
