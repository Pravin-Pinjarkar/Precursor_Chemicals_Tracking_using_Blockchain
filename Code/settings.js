function saveSettings() {
  const settings = {
    twoFA: document.getElementById("twoFA").checked,
    themeMode: document.getElementById("themeMode").value,
    notifyMode: document.getElementById("notifyMode").value,
    language: document.getElementById("languageSet").value,
    sound: document.getElementById("soundAlert").checked,
    refresh: document.getElementById("refreshRate").value
  };

  localStorage.setItem("ncbSettings", JSON.stringify(settings));
  alert("✔ Settings Saved");
}

// Load saved values when page opens
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("ncbSettings"));
  if (!saved) return;

  document.getElementById("twoFA").checked = saved.twoFA;
  document.getElementById("themeMode").value = saved.themeMode;
  document.getElementById("notifyMode").value = saved.notifyMode;
  document.getElementById("languageSet").value = saved.language;
  document.getElementById("soundAlert").checked = saved.sound;
  document.getElementById("refreshRate").value = saved.refresh;
};

document.getElementById("saveBtn").addEventListener("click", saveSettings);
