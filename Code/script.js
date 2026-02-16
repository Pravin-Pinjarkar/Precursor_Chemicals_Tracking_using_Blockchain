// ========================= Password Toggle =========================
function togglePassword(fieldId, icon) {
    const input = document.getElementById(fieldId);
    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "👁️‍🗨️";
    } else {
        input.type = "password";
        icon.textContent = "👁";
    }
}


// ========================= Toast Helpers =========================
function showToast(message, type = "success") {
    document.querySelectorAll(".toast").forEach(t => t.remove());

    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

function showConfirmToast(message, onYes, onNo) {
    document.querySelectorAll(".toast").forEach(t => t.remove());

    const toast = document.createElement("div");
    toast.className = "toast confirm";

    const msg = document.createElement("span");
    msg.textContent = message;

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes";
    yesBtn.className = "confirm-yes";
    yesBtn.onclick = () => {
        toast.remove();
        if (typeof onYes === "function") onYes();
    };

    const noBtn = document.createElement("button");
    noBtn.textContent = "No";
    noBtn.className = "confirm-no";
    noBtn.onclick = () => {
        toast.remove();
        if (typeof onNo === "function") onNo();
    };

    toast.append(msg, yesBtn, noBtn);
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
}


// ========================= OTP Modal Setup =========================
const otpModal = document.getElementById("otpModal");
const otpInputs = document.querySelectorAll(".otp-digit");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const cancelOtpBtn = document.getElementById("cancelOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const otpError = document.getElementById("otpError");
let loginEmail = "";
let otpTimer = null;

// 🔒 Only wire up OTP behaviour on pages that actually have the modal
if (otpModal && verifyOtpBtn && cancelOtpBtn && resendOtpBtn && otpInputs.length) {
    // auto move to next box
    otpInputs.forEach((box, index) => {
        box.addEventListener("input", () => {
            if (box.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        box.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && index > 0 && !box.value) {
                otpInputs[index - 1].focus();
            }
        });
    });

    
    // ========================= OTP Verification =========================
    verifyOtpBtn.addEventListener("click", async () => {
        const otp = Array.from(otpInputs).map(b => b.value).join("");

        if (otp.length !== 6) {
            otpError.textContent = "Invalid OTP";
            otpError.classList.remove("hidden");
            document.querySelector(".otp-inputs").classList.add("shake");
            setTimeout(() => {
                document.querySelector(".otp-inputs").classList.remove("shake");
            }, 300);
            return;
        }

        try {
            const otpResponse = await fetch("http://localhost:5000/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, otp })
            });

            const otpData = await otpResponse.json();
            if (otpResponse.ok) {
                localStorage.setItem("authToken", otpData.token);
                otpModal.classList.add("hidden");
                showToast("✅ Login successful!", "success");
                setTimeout(() => window.location.href = "dashboard.html", 1000);
            } else {
                otpError.textContent = otpData.message || "Invalid OTP";
                otpError.classList.remove("hidden");
                document.querySelector(".otp-inputs").classList.add("shake");
                setTimeout(() => {
                    document.querySelector(".otp-inputs").classList.remove("shake");
                }, 300);
            }
        } catch {
            otpError.textContent = "Server error";
            otpError.classList.remove("hidden");
        }
    });

    // Cancel OTP
    cancelOtpBtn.addEventListener("click", () => otpModal.classList.add("hidden"));

    // Resend OTP
    resendOtpBtn.addEventListener("click", async () => {
        const password = document.getElementById("password").value.trim();
        await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, password })
        });

        showToast("🔁 OTP resent!", "success");
        otpInputs.forEach(box => box.value = "");
        otpInputs[0].focus();
    });
}

// ========================= Login Validation (RESTORED) =========================
async function validateLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    emailError.textContent = "";
    passwordError.textContent = "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailError.textContent = "Please enter a valid email.";
        return;
    }
    if (password.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters.";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            loginEmail = email;
            showToast("📩 OTP sent to your email!", "success");
            otpModal.classList.remove("hidden");
            otpInputs.forEach(i => i.value = "");
            otpInputs[0].focus();
        } else {
            showToast(`❌ ${data.message}`, "error");
        }
    } catch (err) {
        console.error("Login Error:", err);
        showToast("❌ Unable to connect to server", "error");
    }
}



// ========================= Logout (UNCHANGED) =========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        showConfirmToast("Are you sure you want to log out?", () => {
            showToast("✅ Logged out successfully!", "success");
            setTimeout(() => window.location.href = "login.html", 1500);
        }, () => showToast("❌ Logout cancelled", "error"));
    });
}





// ========================= Create Account Validation =========================
// ========================= Create Account Validation =========================
async function validateCreate(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("create-email").value.trim();
    const password = document.getElementById("password").value.trim();
    const dob = document.getElementById("dob").value;
    const role = document.getElementById("role").value;
    const mobileEl = document.getElementById("mobile");
    const mobile = mobileEl ? mobileEl.value.trim() : "";

    const emailError = document.getElementById("create-email-error");
    const passwordError = document.getElementById("create-password-error");

    let nameError = document.getElementById("name-error") || createErrorElement("name", "name-error");
    let dobError = document.getElementById("dob-error") || createErrorElement("dob", "dob-error");
    let roleError = document.getElementById("role-error") || createErrorElement("role", "role-error");
    let mobileError = mobileEl && (document.getElementById("mobile-error") || createErrorElement("mobile", "mobile-error", mobileEl));

    nameError.textContent = emailError.textContent = passwordError.textContent = dobError.textContent = roleError.textContent = "";
    if (mobileError) mobileError.textContent = "";

    let valid = true;

    if (!name) { nameError.textContent = "Please enter your name."; valid = false; }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { emailError.textContent = "Please enter your email."; valid = false; }
    else if (!emailPattern.test(email)) { emailError.textContent = "Enter valid email."; valid = false; }
    if (!password) { passwordError.textContent = "Please enter a password."; valid = false; }
    else if (password.length < 6) { passwordError.textContent = "Password must be at least 6 characters."; valid = false; }
    if (!dob) { dobError.textContent = "Please select your date of birth."; valid = false; }
    if (!role) { roleError.textContent = "Please select your role."; valid = false; }

    if (mobileEl) {
        if (!mobile) { mobileError.textContent = "Enter mobile number."; valid = false; }
        else if (!/^\d+$/.test(mobile)) { mobileError.textContent = "Numbers only."; valid = false; }
        else if (mobile.length !== 10) { mobileError.textContent = "Must be 10 digits."; valid = false; }
    }

    if (!valid) return;

    try {
        const response = await fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, mobile, dob, role })
        });

        const data = await response.json();
        if (response.ok) {
            showToast("✅ Account Created Successfully!", "success");
            setTimeout(() => window.location.href = "login.html", 1500);
        } else {
            showToast(`❌ ${data.message || "Signup failed"}`, "error");
        }
    } catch (error) {
        console.error("Signup Error:", error);
        showToast("❌ Could not connect to server", "error");
    }
}

function createErrorElement(afterId, id, parent=null) {
    const el = document.createElement("small");
    el.id = id;
    el.classList.add("error");
    const target = parent || document.getElementById(afterId);
    target.insertAdjacentElement("afterend", el);
    return el;
}

// ========================= Forgot Password Validation =========================
async function validateForgot(event) {
  event.preventDefault();

  const oldInput = document.getElementById("old-password");
  const newInput = document.getElementById("new-password");
  const emailInput = document.getElementById("forgot-email");

  const emailError = document.getElementById("forgot-email-error");
  let oldError = document.getElementById("old-password-error") || createErrorElement("old-password", "old-password-error");
  const newError = document.getElementById("forgot-password-error");

  emailError.textContent = oldError.textContent = newError.textContent = "";

  let isValid = true;
  const emailVal = emailInput.value.trim();
  const oldVal = oldInput.value.trim();
  const newVal = newInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailVal) { emailError.textContent = "Please enter your email."; isValid = false; }
  else if (!emailPattern.test(emailVal)) { emailError.textContent = "Please enter a valid email address."; isValid = false; }
  if (!oldVal) { oldError.textContent = "Please enter your old password."; isValid = false; }
  if (!newVal) { newError.textContent = "Please enter your new password."; isValid = false; }
  if (oldVal && newVal && oldVal === newVal) { newError.textContent = "New password cannot be the same as old password."; isValid = false; }

  if (!isValid) return;

  try {
    // Step 1: Request OTP
    const response = await fetch("http://localhost:5000/api/reset-password-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailVal, oldPassword: oldVal, newPassword: newVal })
    });

    const data = await response.json();

    if (response.ok) {
      showToast("✅ OTP sent to your email. Please verify.", "success");

      // Step 2: Ask for OTP
      const otp = prompt("Enter the 6-digit OTP sent to your email:");
      if (!otp) return;

      const otpResponse = await fetch("http://localhost:5000/api/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal, otp })
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        showToast("✅ Password reset successful!", "success");
        setTimeout(() => window.location.href = "login.html", 1500);
      } else {
        showToast(`❌ ${otpData.message}`, "error");
      }
    } else {
      showToast(`❌ ${data.message}`, "error");
    }
  } catch (err) {
    console.error("Password Reset Error:", err);
    showToast("❌ Unable to connect to server.", "error");
  }
}


// ========================= Dashboard Buttons =========================
// ========================= Dashboard Buttons =========================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = [
    { id: "proBtn", url: "produce.html" },
    { id: "uploadbtn", url: "upload.html" },
    { id: "settingbtn", url: "settings.html" },
    { id: "accbtn", url: "account.html" },
    { id: "helpbtn", url: "help.html" }
  ];

  buttons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el) el.addEventListener("click", () => window.location.href = btn.url);
  });

  // Track Batches is already <a href="track.html"> so no JS needed

  // Learn more toggle
  const learnBtn = document.getElementById('learnMoreBtn');
  const learnList = document.getElementById('learn-more-list');
  if (learnBtn && learnList) {
    learnBtn.addEventListener('click', () => {
      const isHidden = learnList.classList.contains('hidden');
      learnList.classList.toggle('hidden', !isHidden);
      learnBtn.textContent = isHidden ? 'Hide Details' : 'Learn More';
      learnBtn.setAttribute('aria-expanded', String(isHidden));
      learnList.setAttribute('aria-hidden', String(!isHidden));
    });
  }

  // Search highlight
  const searchInput = document.querySelector('.search-box input');
  const searchIcon = document.querySelector('.search-box i');
  if (searchInput && searchIcon) {
    const highlightSearch = () => {
      const inputValue = searchInput.value.trim().toLowerCase();
      const content = document.querySelector('.main-content');
      content.querySelectorAll('.highlight').forEach(span => span.outerHTML = span.innerText);

      if (!inputValue) return;

      const walk = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
      let found = false;
      while (walk.nextNode()) {
        const node = walk.currentNode;
        const text = node.nodeValue;
        if (text.toLowerCase().includes(inputValue)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(new RegExp(inputValue, 'gi'), match => `<mark class="highlight">${match}</mark>`);
          node.replaceWith(span);
          found = true;
        }
      }

      if (!found) {
        const oldValue = searchInput.value;
        searchInput.value = "Search not found";
        searchInput.classList.add("not-found", "shake");
        setTimeout(() => {
          searchInput.value = oldValue;
          searchInput.classList.remove("not-found", "shake");
        }, 1200);
      }

      setTimeout(() => content.querySelectorAll('.highlight').forEach(el => el.outerHTML = el.innerText), 1000);
    };

    searchIcon.addEventListener('click', highlightSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') highlightSearch(); });
  }
});

// ========================= Dashboard Roles =========================
const roles = {
    "Chemical Industry Owner": "They manufacture chemicals, update the backend database with product details, and request NOC clearance from the government portal before dispatch. They ensure packaging, labeling, legal compliance, and trigger GPS-enabled transport to the distributor.",
    "Distributor": "They verify the NOC and product details in the backend system, arrange GPS-enabled transport, and handle temporary warehousing. They deliver chemicals to the lab, update delivery status in the database, and maintain compliance records.",
    "Lab Assistant": "They receive the chemicals after OTP verification, log the details into the lab’s inventory, and follow strict safety protocols. They send consumption reports to the government portal and provide data for ML models that detect usage anomalies."
};

const roleModal = document.getElementById("roleModal");
const roleDescModal = document.getElementById("roleDescModal");
const roleTitle = document.getElementById("roleTitle");
const roleDescription = document.getElementById("roleDescription");

document.querySelector(".priority")?.addEventListener("click", () => roleModal.style.display = "block");
document.querySelector("#roleModal .close")?.addEventListener("click", () => roleModal.style.display = "none");
document.querySelector(".desc-close")?.addEventListener("click", () => roleDescModal.style.display = "none");
window.addEventListener("click", e => {
    if (e.target === roleModal) roleModal.style.display = "none";
    if (e.target === roleDescModal) roleDescModal.style.display = "none";
});
document.querySelectorAll("#roleModal .role-list li").forEach(item => {
    item.addEventListener("click", () => {
        const roleName = item.textContent.trim();
        roleTitle.textContent = roleName;
        roleDescription.textContent = roles[roleName] || "Description not available.";
        roleModal.style.display = "none";
        roleDescModal.style.display = "block";
    });
});

// ========================= Update Card Dates =========================
function updateCardDates() {
    const now = new Date();
    const options = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", hour12: true, minute: "2-digit" };
    const formatted = now.toLocaleDateString("en-GB", options).replace(",", " -");
    document.querySelectorAll(".card-date").forEach(el => el.textContent = formatted);
}
setInterval(updateCardDates, 1000);
updateCardDates();



// ========================= Account Button Redirect =========================
document.getElementById("accbtn")?.addEventListener("click", () => {
  window.location.href = "account.html";
});


