// ==== Yearly Chart Data (2020 → 2025) ====
const yearlyData = {
  2020: [
    { month: "Jan 2020", value: 120 },
    { month: "Feb 2020", value: 90 },
    { month: "Mar 2020", value: 200 },
    { month: "Apr 2020", value: 150 },
    { month: "May 2020", value: 300 },
    { month: "Jun 2020", value: 80 },
    { month: "Jul 2020", value: 260 },
    { month: "Aug 2020", value: 150 },
    { month: "Sep 2020", value: 200 },
    { month: "Oct 2020", value: 350 },
    { month: "Nov 2020", value: 180 },
    { month: "Dec 2020", value: 400 },
  ],
  2021: [
    { month: "Jan 2021", value: 140 },
    { month: "Feb 2021", value: 220 },
    { month: "Mar 2021", value: 180 },
    { month: "Apr 2021", value: 300 },
    { month: "May 2021", value: 260 },
    { month: "Jun 2021", value: 120 },
    { month: "Jul 2021", value: 400 },
    { month: "Aug 2021", value: 250 },
    { month: "Sep 2021", value: 180 },
    { month: "Oct 2021", value: 320 },
    { month: "Nov 2021", value: 350 },
    { month: "Dec 2021", value: 500 },
  ],
  2022: [
    { month: "Jan 2022", value: 200 },
    { month: "Feb 2022", value: 240 },
    { month: "Mar 2022", value: 280 },
    { month: "Apr 2022", value: 300 },
    { month: "May 2022", value: 200 },
    { month: "Jun 2022", value: 150 },
    { month: "Jul 2022", value: 420 },
    { month: "Aug 2022", value: 300 },
    { month: "Sep 2022", value: 240 },
    { month: "Oct 2022", value: 360 },
    { month: "Nov 2022", value: 400 },
    { month: "Dec 2022", value: 550 },
  ],
  2023: [
    { month: "Jan 2023", value: 180 },
    { month: "Feb 2023", value: 210 },
    { month: "Mar 2023", value: 300 },
    { month: "Apr 2023", value: 400 },
    { month: "May 2023", value: 320 },
    { month: "Jun 2023", value: 200 },
    { month: "Jul 2023", value: 480 },
    { month: "Aug 2023", value: 350 },
    { month: "Sep 2023", value: 260 },
    { month: "Oct 2023", value: 380 },
    { month: "Nov 2023", value: 420 },
    { month: "Dec 2023", value: 600 },
  ],
  2024: [
    { month: "Jan 2024", value: 220 },
    { month: "Feb 2024", value: 240 },
    { month: "Mar 2024", value: 350 },
    { month: "Apr 2024", value: 430 },
    { month: "May 2024", value: 300 },
    { month: "Jun 2024", value: 180 },
    { month: "Jul 2024", value: 500 },
    { month: "Aug 2024", value: 380 },
    { month: "Sep 2024", value: 270 },
    { month: "Oct 2024", value: 420 },
    { month: "Nov 2024", value: 450 },
    { month: "Dec 2024", value: 620 },
  ],
  2025: [
    { month: "Jan 2025", value: 30 },
    { month: "Feb 2025", value: 200 },
    { month: "Mar 2025", value: 350 },
    { month: "Apr 2025", value: 460 },
    { month: "May 2025", value: 300 },
    { month: "Jun 2025", value: 80 },
    { month: "Jul 2025", value: 620 },
    { month: "Aug 2025", value: 270 },
    { month: "Sep 2025", value: 90 },
    { month: "Oct 2025", value: 370 },
    { month: "Nov 2025", value: 450 },
    { month: "Dec 2025", value: 650 },
  ]
};

// ==== Yearly Batch Data (2020 → 2025) ====
const batchData = {
  2020: [
    { id: "B-201", ran: "RAN-201", chemical: "Methanol", quantity: "50 kg", date: "05 Jan 2020", note: "Solvent", status: "Active" },
    { id: "B-202", ran: "RAN-202", chemical: "Acetone", quantity: "100 kg", date: "12 Mar 2020", note: "Solvent", status: "Completed" },
  ],
  2021: [
    { id: "B-301", ran: "RAN-301", chemical: "Ethanol", quantity: "80 kg", date: "10 Feb 2021", note: "Alcohol", status: "Active" },
    { id: "B-302", ran: "RAN-302", chemical: "Acetic Acid", quantity: "120 kg", date: "15 Apr 2021", note: "Acid", status: "Completed" },
  ],
  2022: [
    { id: "B-401", ran: "RAN-401", chemical: "Hydrogen Peroxide", quantity: "60 kg", date: "20 Jan 2022", note: "Oxidizer", status: "Active" },
    { id: "B-402", ran: "RAN-402", chemical: "Nitric Acid", quantity: "90 kg", date: "25 Mar 2022", note: "Acid", status: "Completed" },
  ],
  2023: [
    { id: "B-501", ran: "RAN-501", chemical: "Ephedrine", quantity: "100 kg", date: "05 Jan 2023", note: "Crucial Chemical", status: "Active" },
    { id: "B-502", ran: "RAN-502", chemical: "Pseudoephedrine", quantity: "150 kg", date: "01 Feb 2023", note: "Mixed Chemical", status: "Completed" },
  ],
  2024: [
    { id: "B-601", ran: "RAN-601", chemical: "Methanol", quantity: "200 kg", date: "15 Mar 2024", note: "Solvent", status: "Active" },
    { id: "B-602", ran: "RAN-602", chemical: "Ethanol", quantity: "150 kg", date: "20 Apr 2024", note: "Alcohol", status: "Completed" },
  ],
  2025: [
    { id: "B-101", ran: "RAN-501", chemical: "Ephedrine", quantity: "100 kg", date: "05 Sept 2025", note: "Crucial Chemical", status: "Active" },
    { id: "B-102", ran: "RAN-502", chemical: "Nitric Acid", quantity: "150 kg", date: "01 Sept 2025", note: "Partial Harmful Chemical", status: "Completed" },
    { id: "B-103", ran: "RAN-503", chemical: "Pseudoephedrine", quantity: "200 kg", date: "03 Sept 2025", note: "Mixed Chemical", status: "Flagged Anomaly" },
    { id: "B-104", ran: "RAN-504", chemical: "Hydrogen Peroxide", quantity: "50 kg", date: "02 Sept 2025", note: "Harmful Chemical", status: "Active" },
  ]
};

const svg = document.getElementById("chart");
const tooltip = document.getElementById("tooltip");
const yearSelect = document.getElementById("yearSelect");
const width = svg.clientWidth;
const height = svg.clientHeight;
const padding = 50;
const batchTableBody = document.querySelector("table tbody");

// ===== Draw Chart Function =====
function drawChart(data) {
  svg.innerHTML = ""; // clear old chart

  const maxVal = Math.max(...data.map(d => d.value));
  const barWidth = (width - padding * 2) / data.length - 20;

  // Y-axis steps
  const ySteps = 5;
  const stepVal = Math.ceil(maxVal / ySteps);

  for (let i = 0; i <= ySteps; i++) {
    const y = height - padding - (i * (height - padding * 2)) / ySteps;
    const val = i * stepVal;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padding);
    line.setAttribute("x2", width - padding);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("class", "grid");
    svg.appendChild(line);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", padding - 10);
    label.setAttribute("y", y + 5);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("class", "text-label");
    label.textContent = val;
    svg.appendChild(label);
  }

  let points = "";
  let bars = [];
  let circles = [];

  data.forEach((d, i) => {
    const x = padding + i * ((width - padding * 2) / data.length) + 10;
    const barHeight = (d.value / maxVal) * (height - padding * 2);
    const y = height - padding - barHeight;

    // Bar
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("class", "bar");
    rect.setAttribute("data-value", d.value);
    rect.setAttribute("data-month", d.month);
    svg.appendChild(rect);
    bars.push(rect);

    // Month Label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + barWidth / 2);
    label.setAttribute("y", height - padding + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "text-label");
    label.textContent = d.month;
    svg.appendChild(label);

    // Line points
    points += `${x + barWidth / 2},${y} `;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x + barWidth / 2);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 5);
    circle.setAttribute("class", "point");
    circle.setAttribute("data-value", d.value);
    circle.setAttribute("data-month", d.month);
    svg.appendChild(circle);
    circles.push(circle);
  });

  // Line
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", points.trim());
  polyline.setAttribute("class", "line");
  svg.appendChild(polyline);

  // Animate Line
  const pathLength = polyline.getTotalLength();
  polyline.style.strokeDasharray = pathLength;
  polyline.style.strokeDashoffset = pathLength;

  setTimeout(() => {
    polyline.style.transition = "stroke-dashoffset 2s ease";
    polyline.style.strokeDashoffset = "0";
  }, 300);

  // Animate bars + points
  bars.forEach((bar, i) => {
    setTimeout(() => {
      bar.classList.add("animate");
      circles[i].classList.add("show");
    }, i * 200);
  });

  // Tooltip
  [...bars, ...circles].forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const val = el.getAttribute("data-value");
      const month = el.getAttribute("data-month");
      tooltip.textContent = `${month}: ${val}`;
      tooltip.style.left = e.pageX + "px";
      tooltip.style.top = e.pageY - 30 + "px";
      tooltip.classList.add("show");
    });
    el.addEventListener("mouseleave", () => tooltip.classList.remove("show"));
  });
}

// ===== Draw Batch Table Function =====
function drawBatchTable(year) {
  batchTableBody.innerHTML = ""; // clear previous rows
  batchData[year].forEach(batch => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${batch.id}</td>
      <td>${batch.ran}</td>
      <td>${batch.chemical}</td>
      <td>${batch.quantity}</td>
      <td>${batch.date}</td>
      <td>${batch.note}</td>
      <td><span class="status ${batch.status.toLowerCase().replace(/ /g, '-')}">${batch.status}</span></td>
    `;
    batchTableBody.appendChild(row);
  });
}

// ===== Populate Dropdown Automatically =====
yearSelect.innerHTML = Object.keys(yearlyData)
  .map(year => `<option value="${year}" ${year==="2025" ? "selected":""}>${year}</option>`)
  .join("");

// ===== Default Load (2025) =====
drawChart(yearlyData[2025]);
drawBatchTable(2025);

// ===== Update on Year Change =====
yearSelect.addEventListener("change", () => {
  const selectedYear = yearSelect.value;
  drawChart(yearlyData[selectedYear]);
  drawBatchTable(selectedYear);
});
