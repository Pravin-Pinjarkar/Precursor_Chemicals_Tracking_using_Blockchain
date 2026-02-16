"use strict";

// =================== DOM References ===================
const sidebarItems = document.querySelectorAll(".sidebar ul li");
const uploadTitle = document.getElementById("uploadTitle");
const fileName = document.getElementById("fileName");
const fileIcon = document.getElementById("fileIcon");
const fileCard = document.getElementById("fileCard");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const fileInput = document.getElementById("fileInput");
const replaceBtn = document.querySelector(".replace-btn");
const chooseBtn = document.querySelector(".upload-btn");
const distributorSelect = document.getElementById("chem-factories");
const uploadsTableBody = document.querySelector("#uploadsTable tbody");
const confirmBtn = document.getElementById("confirmBtn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastActions = document.getElementById("toastActions");
const toastYes = document.getElementById("toastYes");
const toastNo = document.getElementById("toastNo");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// =================== Titles Map ===================
const titles = {
  msds: "Upload MSDS / SDS (Material Safety Data Sheet)",
  coa: "Upload COA (Certificate of Analysis)",
  tds: "Upload TDS (Technical Data Sheet)",
  compliance: "Upload Compliance Certificates",
  import: "Upload Import/Export Licenses",
  waste: "Upload Waste Disposal Certificates",
  transport: "Upload Transport Documents",
};

// =================== State & persistence key ===================
let activeSection = "msds";
let uploadHistory = {};
const STORAGE_KEY = "uploadHistory_v1";
let tableLoadedAfterAll = false;
window._toastTimeout = null;

// =================== localStorage Utilities ===================
function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) uploadHistory = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not parse uploadHistory from storage", e);
    uploadHistory = {};
  }
}
function saveHistoryToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadHistory));
  } catch (e) {
    console.warn("Could not save uploadHistory to storage", e);
  }
}
function clearHistoryStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

// =================== Toast Functions ===================
function showToast(message, showActions = false) {
  clearTimeout(window._toastTimeout);
  toastMessage.textContent = message;
  toast.style.display = "flex";
  toast.classList.add("show");

  if (showActions) {
    toastActions.style.display = "flex";
  } else {
    toastActions.style.display = "none";
    window._toastTimeout = setTimeout(() => {
      hideToast();
    }, 4000);
  }
}

function hideToast() {
  toast.classList.remove("show");
  toast.style.display = "none";
  toastActions.style.display = "none";
  clearTimeout(window._toastTimeout);
}

// =================== Confirm Visibility ===================
// We will *not* disable the button anymore – always clickable.
// Still keep this helper for future if needed.
function allSectionsUploadedLocal() {
  return Object.keys(titles).every(
    (sectionKey) => uploadHistory[sectionKey]?.status === "done"
  );
}

function updateConfirmVisibility() {
  // Always allow clicking, we validate on server when user clicks Confirm
  confirmBtn.disabled = false;
  confirmBtn.classList.remove("disabled");
}

// =================== Sidebar Switching ===================
sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {
    sidebarItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    activeSection = item.dataset.target;
    uploadTitle.textContent = titles[activeSection] || "Upload Document";
    restoreFileCard();
    updateConfirmVisibility();
  });
});

// =================== File Card UI ===================
function resetFileCard() {
  fileInput.value = "";
  fileName.textContent = "No file selected";
  fileIcon.textContent = "📄";
  fileCard.classList.remove("success", "warning", "error");
  progressBox.classList.add("hidden");
  progressBar.style.width = "0%";
  progressText.textContent = "0%";
  replaceBtn.classList.add("hidden");
  chooseBtn.classList.remove("hidden");
}
function restoreFileCard() {
  const history = uploadHistory[activeSection];
  if (history?.status === "done") {
    fileCard.classList.remove("warning", "error");
    fileCard.classList.add("success");
    fileName.textContent = history.name || "No file selected";
    fileIcon.textContent = getFileIcon(history.name);
    replaceBtn.classList.remove("hidden");
    chooseBtn.classList.add("hidden");
    progressBox.classList.add("hidden");
  } else if (history?.status === "uploading") {
    fileCard.classList.remove("error", "success");
    fileCard.classList.add("warning");
    fileName.textContent = history.name
      ? `Uploading: ${history.name}`
      : "Uploading...";
    fileIcon.textContent = getFileIcon(history.name);
    replaceBtn.classList.add("hidden");
    chooseBtn.classList.remove("hidden");
    progressBox.classList.remove("hidden");
    progressBar.style.width = `${history.progress || 0}%`;
    progressText.textContent = `${history.progress || 0}%`;
  } else if (history?.status === "error") {
    fileCard.classList.remove("success", "warning");
    fileCard.classList.add("error");
    fileName.textContent = history.name || "Error";
    fileIcon.textContent = getFileIcon(history.name);
    replaceBtn.classList.remove("hidden");
    chooseBtn.classList.add("hidden");
    progressBox.classList.add("hidden");
  } else resetFileCard();
}
function getFileIcon(fname = "") {
  const ext = (fname.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "📕";
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  if (["ppt", "pptx"].includes(ext)) return "📑";
  return "📄";
}

// =================== File Upload Logic ===================
chooseBtn.addEventListener("click", () => fileInput.click());
replaceBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", function () {
  if (!this.files?.length) return restoreFileCard();
  const file = this.files[0];

  fileCard.classList.remove("hidden", "success", "error");
  fileCard.classList.add("warning");
  fileName.textContent = `Selected: ${file.name}`;
  fileIcon.textContent = getFileIcon(file.name);
  progressBox.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressText.textContent = "0%";

  uploadHistory[activeSection] = {
    name: file.name,
    status: "uploading",
    progress: 0,
    distributor: distributorSelect.value,
  };
  saveHistoryToStorage();
  updateConfirmVisibility();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", activeSection);
  formData.append("distributor", distributorSelect.value);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:5000/api/upload");

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `${percent}%`;
      uploadHistory[activeSection].progress = percent;
      saveHistoryToStorage();
    }
  });

  xhr.onload = async () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText || "{}");
      progressBar.style.width = "100%";
      progressText.textContent = "✅ Uploaded!";
      fileCard.classList.remove("warning");
      fileCard.classList.add("success");
      replaceBtn.classList.remove("hidden");
      chooseBtn.classList.add("hidden");

      uploadHistory[activeSection] = {
        name: file.name,
        status: "done",
        uploadedAt: new Date().toISOString(),
        distributor: distributorSelect.value,
        filePath: data.filePath || null,
        _id: data._id || null,
      };
      saveHistoryToStorage();
      updateConfirmVisibility();

      // Optionally refresh table
      if (!tableLoadedAfterAll) {
        await loadUploadedFiles();
        tableLoadedAfterAll = true;
      }
    } else handleUploadError(file.name);
  };
  xhr.onerror = () => handleUploadError(file.name);
  xhr.send(formData);
});

function handleUploadError(fileName) {
  console.error("Upload error for", fileName);
  progressText.textContent = "❌ Error uploading!";
  fileCard.classList.remove("warning");
  fileCard.classList.add("error");
  uploadHistory[activeSection] = {
    name: fileName,
    status: "error",
    uploadedAt: new Date().toISOString(),
    distributor: distributorSelect.value,
  };
  saveHistoryToStorage();
  updateConfirmVisibility();
}

// =================== Load Uploaded Files + Delete ===================
async function loadUploadedFiles() {
  try {
    const res = await fetch("http://localhost:5000/api/uploads");
    if (!res.ok) throw new Error("Could not fetch uploads");
    const data = await res.json();

    uploadsTableBody.innerHTML = "";
    data.forEach((doc) => {
      const tr = document.createElement("tr");
      const date = doc.uploadedAt
        ? new Date(doc.uploadedAt).toLocaleString()
        : "-";
      const icon = getFileIcon(doc.fileName);
      const viewUrl = doc.filePath
        ? `http://localhost:5000/uploads/${doc.filePath}`
        : "#";

      tr.innerHTML = `
        <td>${(doc.section || "").toUpperCase()}</td>
        <td>${icon} ${doc.fileName || "-"}</td>
        <td>${doc.distributor || "-"}</td>
        <td>${date}</td>
        <td>${
          doc.filePath
            ? `<a href="${viewUrl}" target="_blank" class="view-btn">View</a>`
            : "-"
        }</td>
        <td><button class="delete-btn" data-id="${doc._id}" data-name="${
        doc.fileName
      }" title="Delete">🗑️</button></td>
      `;
      uploadsTableBody.appendChild(tr);
    });

    attachDeleteButtons();
  } catch (err) {
    console.error("Error loading uploads:", err);
  }
}

// =================== Attach Delete Handlers ===================
function attachDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      const handleYes = async () => {
        hideToast();
        try {
          const res = await fetch(
            `http://localhost:5000/api/uploads/${id}`,
            { method: "DELETE" }
          );
          if (!res.ok) throw new Error("Delete failed");

          btn.closest("tr").remove();
          Object.keys(uploadHistory).forEach((key) => {
            if (uploadHistory[key]._id === id) delete uploadHistory[key];
          });
          saveHistoryToStorage();
          showToast(`✅ "${name}" deleted successfully`, false);
          updateConfirmVisibility();
        } catch (err) {
          console.error(err);
          showToast(`❌ Failed to delete "${name}"`, false);
        }
      };

      const handleNo = () => hideToast();

      toastYes.onclick = handleYes;
      toastNo.onclick = handleNo;

      showToast(`⚠️ Delete "${name}"?`, true);
    };
  });
}

// =================== Confirm Button ===================
let confirmAction = null;

// Helper: check from SERVER if all sections exist at least once
async function checkAllSectionsOnServer() {
  const resFetch = await fetch("http://localhost:5000/api/uploads");
  if (!resFetch.ok) throw new Error("Failed to load uploads");
  const allDocs = await resFetch.json();

  const present = new Set(allDocs.map((d) => d.section)); // "msds", "coa", etc.
  const missing = Object.keys(titles).filter((key) => !present.has(key));

  return { missing, allDocs };
}

confirmBtn.addEventListener("click", async () => {
  try {
    const { missing, allDocs } = await checkAllSectionsOnServer();

    if (missing.length > 0) {
      showToast(
        "⚠️ Please upload documents for: " + missing.map(m => m.toUpperCase()).join(", "),
        false
      );
      return;
    }

    // Set final action
    confirmAction = async () => {
      hideToast();
      showToast("⏳ Sending documents, please wait...", false);

      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("❌ Login email missing — Please login again to send documents!", false);
        return;
      }

      const latest7 = allDocs
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 7);

      const res = await fetch("http://localhost:5000/api/confirm-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`  // 🔥 added
        },
        body: JSON.stringify({ docs: latest7 })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("❌ " + (data.error || "Failed to send documents"), false);
        return;
      }

      showToast("✅ Documents sent successfully via email!", false);

      uploadHistory = {};
      clearHistoryStorage();
      resetFileCard();
      tableLoadedAfterAll = false;
      await loadUploadedFiles();
    };

    showToast("⚠️ Are you sure you want to submit all documents?", true);

  } catch (err) {
    console.error(err);
    showToast("❌ Failed to verify uploads from server.", false);
  }
});

// YES button – run confirmAction if set
toastYes.addEventListener("click", async () => {
  if (confirmAction) await confirmAction();
  confirmAction = null;
});

// NO button – just close popup
toastNo.addEventListener("click", () => {
  hideToast();
  confirmAction = null;
});

// =================== Auto reload ===================
document.addEventListener("DOMContentLoaded", async () => {
  loadHistoryFromStorage();
  const selected = document.querySelector(".sidebar ul li.active");
  if (selected?.dataset.target) activeSection = selected.dataset.target;
  uploadTitle.textContent = titles[activeSection] || uploadTitle.textContent;
  restoreFileCard();
  updateConfirmVisibility();

  if (sessionStorage.getItem("autoReloaded") === "true") {
    sessionStorage.removeItem("autoReloaded");
    showToast("🔄 Page refreshed after sending documents", false);
  }

  const activeTab = document.querySelector(".tab-btn.active");
  if (activeTab?.dataset.tab === "settings") await loadUploadedFiles();
});

// =================== Tabs Switching ===================
tabButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    button.classList.add("active");
    const target = button.dataset.tab;
    document.getElementById(target).classList.add("active");
    if (target === "settings") await loadUploadedFiles();
  });
});
