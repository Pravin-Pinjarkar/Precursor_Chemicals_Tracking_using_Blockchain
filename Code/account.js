document.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch("http://localhost:5000/api/user-profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    let user;
    if (res.ok) {
      user = await res.json();
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      user = JSON.parse(localStorage.getItem("userData"));
    }

    if (user) {
      // ✅ Fill profile info
      document.getElementById("acc-name").textContent = user.name || "N/A";
      document.getElementById("acc-email").textContent = user.email || "N/A";
      document.getElementById("acc-mobile").textContent = user.mobile || "N/A";
      document.getElementById("acc-dob").textContent = user.dob
        ? new Date(user.dob).toLocaleDateString()
        : "N/A";

      // ✅ Display name in header
      const displayNameEl = document.getElementById("displayName");
      if (displayNameEl) {
        displayNameEl.textContent = user.name || "User";
      }

      // ✅ Profile Avatar
      const avatar = document.getElementById("avatar");
      if (user.profilePicUrl) {
        avatar.style.backgroundImage = `url(http://localhost:5000${user.profilePicUrl})`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.textContent = "";
      } else {
        avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : "?";
      }

      // ✅ Start the animated scientist message
      startScientistMessage(user.name);
    } else {
      alert("User not logged in");
    }

    // ✅ Upload profile picture logic
    const fileInput = document.getElementById("profilePicInput");
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("profilePic", file);

      const uploadRes = await fetch("http://localhost:5000/api/upload-profile-pic", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const result = await uploadRes.json();
      if (uploadRes.ok) {
        alert("✅ Profile picture updated!");
        const avatar = document.getElementById("avatar");
        avatar.style.backgroundImage = `url(http://localhost:5000${result.profilePicUrl})`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.textContent = "";

        // 💡 Show happy scientist reaction after upload
        showScientistReaction("Nice! Profile updated, " + (user.name || "chemist") + " 🧪");
      } else {
        alert("❌ Failed to upload picture: " + result.message);
      }
    });
  } catch (err) {
    console.error("Error loading account:", err);
  }
});

/* ===========================================================
   👨‍🔬 SCIENTIST ANIMATED MESSAGE BUBBLE
   =========================================================== */
function startScientistMessage(userName = "there") {
  const messageText = document.getElementById("messageText");
  if (!messageText) return;

  const messages = [
    `Hello, ${userName}! 👋`,
    `Welcome to your account dashboard.`,
    `You can update your profile or upload a new photo 🧪`,
    `Keep exploring — Our Website Thank You! ⚗️`
  ];

  let messageIndex = 0;
  let charIndex = 0;

  function typeMessage() {
    if (charIndex < messages[messageIndex].length) {
      messageText.textContent += messages[messageIndex].charAt(charIndex);
      charIndex++;
      setTimeout(typeMessage, 45);
    } else {
      setTimeout(() => {
        messageText.textContent = "";
        charIndex = 0;
        messageIndex = (messageIndex + 1) % messages.length;
        typeMessage();
      }, 3000);
    }
  }

  typeMessage();
}

/* ===========================================================
   🎉 FUN REACTION WHEN ACTIONS HAPPEN
   =========================================================== */
function showScientistReaction(text) {
  const messageText = document.getElementById("messageText");
  if (!messageText) return;

  messageText.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      messageText.textContent += text.charAt(i);
      i++;
      setTimeout(type, 40);
    } else {
      setTimeout(() => startScientistMessage(localStorage.getItem("userData")
        ? JSON.parse(localStorage.getItem("userData")).name
        : "there"), 4000);
    }
  }

  type();
}
