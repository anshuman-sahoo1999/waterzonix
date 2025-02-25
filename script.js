document.getElementById("fileInput").addEventListener("change", function(event) {
    const fileName = event.target.files[0] ? event.target.files[0].name : "No file chosen";
    document.getElementById("fileName").textContent = fileName;
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const rows = e.target.result.split("\n").slice(1);
        let labels = [], pHData = [], turbidityData = [], tempData = [], oxygenData = [];
        
        rows.forEach(row => {
            const cols = row.split(",");
            if (cols.length >= 5) {
                labels.push(cols[0]);
                pHData.push(parseFloat(cols[1]));
                turbidityData.push(parseFloat(cols[2]));
                tempData.push(parseFloat(cols[3]));
                oxygenData.push(parseFloat(cols[4]));
            }
        });

        createChart("pHChart", labels, pHData, "pH Level", "rgba(75, 192, 192, 0.6)");
        createChart("turbidityChart", labels, turbidityData, "Turbidity", "rgba(255, 99, 132, 0.6)");
        createChart("temperatureChart", labels, tempData, "Temperature (°C)", "rgba(255, 159, 64, 0.6)");
        createChart("oxygenChart", labels, oxygenData, "Dissolved Oxygen (mg/L)", "rgba(54, 162, 235, 0.6)");

        updateReportTable(labels, pHData, turbidityData, tempData, oxygenData);
    };
    
    reader.readAsText(file);
});

function createChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color,
                borderColor: color,
                fill: true,
                tension: 0.3
            }]
        }
    });
}

// Update Table
function updateReportTable(labels, pH, turbidity, temp, oxygen) {
    const tbody = document.querySelector("#reportTable tbody");
    tbody.innerHTML = "";
    labels.forEach((label, i) => {
        tbody.innerHTML += `<tr><td>${label}</td><td>${pH[i]}</td><td>${turbidity[i]}</td><td>${temp[i]}</td><td>${oxygen[i]}</td></tr>`;
    });
}

// Generate PDF Report with Date & Charts
async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Report Header
    doc.setFontSize(16);
    doc.text("Water Quality Report", 20, 20);
    
    // Date of Report Generation
    const date = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.text(`Generated on: ${date}`, 20, 30);

    // Capture Charts as Images
    const pHChart = document.getElementById("pHChart");
    const turbidityChart = document.getElementById("turbidityChart");
    const temperatureChart = document.getElementById("temperatureChart");
    const oxygenChart = document.getElementById("oxygenChart");

    // Convert Charts to Data URLs (Asynchronous)
    const pHChartImg = await chartToImage(pHChart);
    const turbidityChartImg = await chartToImage(turbidityChart);
    const temperatureChartImg = await chartToImage(temperatureChart);
    const oxygenChartImg = await chartToImage(oxygenChart);

    // Add Images to PDF (Resized for Fit)
    doc.addImage(pHChartImg, "PNG", 20, 40, 80, 50);
    doc.addImage(turbidityChartImg, "PNG", 110, 40, 80, 50);
    doc.addImage(temperatureChartImg, "PNG", 20, 95, 80, 50);
    doc.addImage(oxygenChartImg, "PNG", 110, 95, 80, 50);

    // Move to New Section for Table
    doc.addPage();
    doc.text("Water Quality Data Table", 20, 20);
    doc.autoTable({ html: "#reportTable", startY: 30 });

    // Save PDF
    doc.save("Water_Quality_Report.pdf");
}

// Convert Chart to Image
function chartToImage(chartCanvas) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(chartCanvas.toDataURL("image/png", 1.0));
        }, 500);
    });
}
