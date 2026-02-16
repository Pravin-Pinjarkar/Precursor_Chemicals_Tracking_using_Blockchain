// === DOM elements ===
const modal = document.getElementById('batchModal');
const addBtn = document.getElementById('addBatchBtn');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('batchForm');
const qrcodeDiv = document.getElementById('qrcode');
const details = document.getElementById('details');
const batchInfo = document.getElementById('batchInfo');
const generateQRBtn = document.getElementById('generateQRBtn');
const batchIdInput = document.getElementById('batchId');
const approvalInput = document.getElementById('approval');
const precursorSearch = document.getElementById('precursorSearch');
const precursorSelect = document.getElementById('precursor');
const originLocation = document.getElementById('originLocation');
const notesInput = document.getElementById('notes');

// === Remove all localStorage counters ===

// === Open modal ===
addBtn.onclick = () => {
  modal.style.display = 'flex';
  batchIdInput.value = "(Auto Generated)";
  approvalInput.value = "(Auto Generated)";
  qrcodeDiv.innerHTML = "";
};

// === Close modal ===
cancelBtn.onclick = () => {
  modal.style.display = 'none';
};

// === Generate QR Code ===
generateQRBtn.onclick = () => {
  qrcodeDiv.innerHTML = "";
  let data = {
    batchId: batchIdInput.value,
    precursor: precursorSelect.value,
    origin: originLocation.value,
    approval: approvalInput.value,
    notes: notesInput.value,
  };
  new QRCode(qrcodeDiv, {
    text: JSON.stringify(data),
    width: 120,
    height: 120
  });
};

// === Save form and send data to backend ===
form.onsubmit = async (e) => {
  e.preventDefault();

  // Data to send — backend will create IDs
  const batchData = {
    precursor: precursorSelect.value,
    originLocation: originLocation.value,
    notes: notesInput.value,
  };

  // Optional: include QR data if available
  const qrImage = qrcodeDiv.querySelector("img")
    ? qrcodeDiv.querySelector("img").src
    : "";
  if (qrImage) batchData.qrCodeData = qrImage;

  try {
    const res = await fetch("http://localhost:5000/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batchData),
    });

    const data = await res.json();
    console.log("Server Response:", data);

    if (data.success) {
      // Update UI with backend-confirmed values
      const b = data.data;
      batchIdInput.value = b.batchId;
      approvalInput.value = b.approvalNumber;

      batchInfo.innerHTML = `
        <p><b>Batch ID:</b> ${b.batchId}</p>
        <p><b>Precursor Type:</b> ${b.precursor}</p>
        <p><b>Origin Location:</b> ${b.originLocation}</p>
        <p><b>Regulatory Approval No.:</b> ${b.approvalNumber}</p>
        <p><b>Notes:</b> ${b.notes}</p>
      `;
      details.style.display = 'block';
      modal.style.display = 'none';
      showToast("✅ Batch saved successfully!!", "success");

    } else {
      showToast("⚠️ Failed to save batch: " + (data.message || "Unknown error"), "warning");
    }
  } catch (err) {
    console.error("❌ Error while saving:", err);
    showToast("❌ Failed to connect to backend. Please ensure server is running.", "error");

  }
};

// === Search filter for precursor list ===
precursorSearch.addEventListener("keyup", () => {
  let filter = precursorSearch.value.toLowerCase();
  Array.from(precursorSelect.options).forEach(opt => {
    opt.style.display = opt.text.toLowerCase().includes(filter) ? "" : "none";
  });
});



function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.4s forwards";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
