// Global State
let totalReviews = 0;
let aiReviews = 0;
let humanReviews = 0;

// Navigation
function showPage(pageId) {
    // Update nav items
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });
    
    // The clicked element might be an icon or span, so we need to find the closest li
    const activeItem = Array.from(document.querySelectorAll(".nav-item")).find(item => 
        item.getAttribute("onclick").includes(pageId)
    );
    if(activeItem) activeItem.classList.add("active");

    // Update pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    document.getElementById(pageId).classList.add("active");
}

// Animate Counters
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateStatsCounters() {
    const totalEl = document.getElementById("totalReviews");
    const aiEl = document.getElementById("aiReviews");
    const humanEl = document.getElementById("humanReviews");
    
    // Get current values to animate from
    const currentTotal = parseInt(totalEl.innerText) || 0;
    const currentAi = parseInt(aiEl.innerText) || 0;
    const currentHuman = parseInt(humanEl.innerText) || 0;

    animateValue(totalEl, currentTotal, totalReviews, 500);
    animateValue(aiEl, currentAi, aiReviews, 500);
    animateValue(humanEl, currentHuman, humanReviews, 500);
}

// API Call and UI Update
async function detectReview() {
    const review_text = document.getElementById("review_text").value.trim();
    const overall = Number(document.getElementById("overall").value);
    const helpful_ratio = Number(document.getElementById("helpful_ratio").value);
    
    const resultContainer = document.getElementById("result-container");
    const analyzeBtn = document.getElementById("analyzeBtn");

    if (!review_text) {
        alert("Please enter review text to analyze.");
        return;
    }

    // Set loading state
    analyzeBtn.classList.add("loading");
    analyzeBtn.innerHTML = `<i class="ph-bold ph-spinner"></i><span>Analyzing...</span>`;
    resultContainer.style.display = "none";
    resultContainer.className = "result-box"; // reset classes

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                review_text,
                overall,
                helpful_ratio
            })
        });

        const data = await response.json();

        // Remove loading state
        analyzeBtn.classList.remove("loading");
        analyzeBtn.innerHTML = `<i class="ph-bold ph-scan"></i><span>Analyze Text</span>`;

        if (data.error) {
            resultContainer.style.display = "block";
            resultContainer.innerHTML = `<div class="result-header" style="color: var(--accent-red)"><i class="ph-fill ph-warning"></i> Error</div><p>${data.error}</p>`;
            return;
        }

        // Update Global Stats
        totalReviews++;
        const isAI = data.prediction === "AI-generated";
        
        if (isAI) {
            aiReviews++;
            resultContainer.classList.add("ai-detected");
        } else {
            humanReviews++;
            resultContainer.classList.add("human-detected");
        }
        
        updateStatsCounters();

        // Build Result HTML
        const icon = isAI ? "ph-warning" : "ph-check-circle";
        const title = isAI ? "AI Generated Text Detected" : "Human Written Text Confirmed";
        const confidenceStr = data.confidence ? `${(data.confidence * 100).toFixed(1)}%` : "N/A";

        resultContainer.innerHTML = `
            <div class="result-header">
                <i class="ph-fill ${icon}"></i>
                ${title}
            </div>
            <div class="result-details">
                <div class="detail-item">
                    <span>Confidence Score</span>
                    <strong>${confidenceStr}</strong>
                </div>
                <div class="detail-item">
                    <span>Rating Alignment</span>
                    <strong>${data.rating_value}/5 - ${data.rating_description}</strong>
                </div>
                <div class="detail-item">
                    <span>Helpfulness</span>
                    <strong>${data.helpful_description}</strong>
                </div>
                <div class="detail-item">
                    <span>Text Length</span>
                    <strong>${review_text.length} chars</strong>
                </div>
            </div>
        `;
        
        resultContainer.style.display = "block";

    } catch (error) {
        analyzeBtn.classList.remove("loading");
        analyzeBtn.innerHTML = `<i class="ph-bold ph-scan"></i><span>Analyze Text</span>`;
        
        resultContainer.style.display = "block";
        resultContainer.innerHTML = `<div class="result-header" style="color: var(--accent-red)"><i class="ph-fill ph-warning"></i> Connection Error</div><p>Failed to connect to the server.</p>`;
    }
}