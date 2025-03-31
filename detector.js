document.addEventListener("DOMContentLoaded", function () {
    const checkBtn = document.getElementById("checkBtn");
    const urlInput = document.getElementById("urlInput");
    const resultText = document.getElementById("result");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const chartCanvas = document.getElementById("hitMissChart");

    let chartInstance;
    let hitCount = parseInt(localStorage.getItem("hitCount")) || 0;
    let missCount = parseInt(localStorage.getItem("missCount")) || 0;

    // NEED TO CORRECT MY DARK MODE TOGGLE BECAUSE IT IS NOT WORKING
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        if (darkModeToggle) darkModeToggle.checked = true;
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", function () {
            if (this.checked) {
                document.body.classList.add("dark-mode");
                localStorage.setItem("darkMode", "enabled");
            } else {
                document.body.classList.remove("dark-mode");
                localStorage.setItem("darkMode", "disabled");
            }
        });
    }

    // ✅ Chart Initialization
    function initializeChart() {
        if (!chartCanvas) return console.error("❌ No chart found!");

        chartInstance = new Chart(chartCanvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Phishing Detected", "Missed Cases"],
                datasets: [{
                    label: "Detection Stats",
                    data: [hitCount, missCount],
                    backgroundColor: ["green", "red"]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // ✅ Function to Update Chart
    function updateChart() {
        if (chartInstance) {
            chartInstance.data.datasets[0].data = [hitCount, missCount];
            chartInstance.update();
        }
    }

    // ✅ Normalize the URL to avoid partial matching issues
    function normalizeUrl(url) {
        return url.trim().toLowerCase().replace(/\/$/, '');
    }

    // ✅ Function to Check Against Local `phishing_list.js`
    function checkWithPhishingList(url) {
        if (typeof phishingUrls === "undefined") {
            console.error("❌ phishingUrls is not loaded! Check phishing_list.js");
            return "❌ Error: Phishing list not loaded!";
        }

        // Normalize URL for comparison
        const normalizedUrl = normalizeUrl(url);

        // Check if the URL exists in the phishing list
        const isPhishing = phishingUrls.some(phishingUrl => {
            const normalizedPhishingUrl = normalizeUrl(phishingUrl);
            return normalizedUrl.includes(normalizedPhishingUrl);
        });

        return isPhishing ? "🚨 Phishing Detected!" : "✅ Looks Safe!";
    }

    // ✅ Single Event Listener for Checking URLs
    checkBtn.addEventListener("click", function () {
        let url = urlInput.value.trim();
        if (!url) {
            resultText.textContent = "❌ Please enter a URL!";
            resultText.className = "danger";
            resultText.style.opacity = "1";
            return;
        }

        resultText.textContent = "🔄 Checking...";
        resultText.style.opacity = "1";

        // Check against phishing_list.js
        let phishingResult = checkWithPhishingList(url);
        resultText.textContent = phishingResult;
        resultText.className = phishingResult.includes("Phishing") ? "danger" : "safe";

        if (phishingResult.includes("Phishing")) {
            hitCount++;
        } else {
            missCount++;
        }

        localStorage.setItem("hitCount", hitCount);
        localStorage.setItem("missCount", missCount);
        updateChart();
    });

    // ✅ Initialize the chart when the page loads
    initializeChart();
});
