document.addEventListener("DOMContentLoaded", function () {
    const checkBtn = document.getElementById("checkBtn");
    const urlInput = document.getElementById("urlInput");
    const emailInput = document.getElementById("emailInput");
    const resultText = document.getElementById("result");
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Load dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });

    checkBtn.addEventListener("click", function () {
        let url = urlInput.value.trim();
        let emailText = emailInput.value.trim();

        if (!url) {
            resultText.textContent = "❌ Please enter a URL!";
            resultText.className = "danger";
            resultText.style.opacity = "1";
            return;
        }

        let result = detectPhishing(url, emailText);

        resultText.textContent = result;
        resultText.className = result.includes("Phishing") ? "danger" : "safe";

        // Smooth animation
        resultText.style.opacity = "0";
        setTimeout(() => {
            resultText.style.opacity = "1";
        }, 300);
    });
});
