/***************************************************************
 * chemical.js — Frontend form submission via Server API
 ***************************************************************/

// ----- State/City mapping -----
const stateCityMap = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik","Amravati","Yavatmal","Sangali","Shirdi","Hingoli","Kolhapur","Chhatrapati Sambhajinagar","Ratnagiri"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangalore", "Hubli", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"],
  "Delhi": ["New Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"]
};

const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");

stateSelect.addEventListener("change", function () {
  citySelect.innerHTML = '<option value="">-- Select City --</option>';
  if (stateCityMap[this.value]) {
    stateCityMap[this.value].forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
});

// ----- Toast -----
function showToast(message, bgColor = "#4caf50") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = bgColor;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ----- Form Validation + Submission -----
document.getElementById("chemicalForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  let valid = true;
  let firstInvalid = null;

  function showError(input, message) {
    const errorSpan = input.parentElement.querySelector(".error");
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 500);
    if (!firstInvalid) firstInvalid = input;
    valid = false;
  }

  function clearError(input) {
    const errorSpan = input.parentElement.querySelector(".error");
    errorSpan.textContent = "";
    errorSpan.style.display = "none";
  }

  // --- VALIDATION ---
  const company = document.getElementById("company");
  if (company.value.trim().length < 3) showError(company, "Company Name must be at least 3 characters.");
  else clearError(company);

  const name = document.getElementById("name");
  if (name.value.trim().length < 2) showError(name, "Chemical Name must be at least 2 characters.");
  else clearError(name);

  const formula = document.getElementById("formula");
  if (formula.value.trim().length < 1) showError(formula, "Chemical Formula required.");
  else clearError(formula);

  const cas = document.getElementById("cas");
const casValue = cas.value.trim();

// CAS format: XXXXXX-YY-Z, variable length digits
const casRegex = /^\d{2,7}-\d{2}-\d$/;

if (!casValue) {
  showError(cas, "CAS Number is required.");
} else if (!casRegex.test(casValue)) {
  showError(cas, "CAS Number format invalid. Example: 67-56-1");
} else {
  // Optional: validate check digit
  const parts = casValue.split('-');
  const digits = parts[0] + parts[1];
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[digits.length - 1 - i]) * (i + 1);
  }
  const checkDigit = sum % 10;
  if (parseInt(parts[2]) !== checkDigit) {
    showError(cas, `Invalid CAS check digit. Should be ${checkDigit}`);
  } else {
    clearError(cas);
  }
}

  const qty = document.getElementById("quantity");
  if (qty.value <= 0) showError(qty, "Quantity must be greater than 0.");
  else clearError(qty);

  const manuDate = document.getElementById("manuDate");
  const expDate = document.getElementById("expDate");
  if (manuDate.value && expDate.value && new Date(manuDate.value) >= new Date(expDate.value))
    showError(expDate, "Expiry Date must be after Manufacturing Date.");
  else clearError(expDate);

  if (!stateSelect.value) showError(stateSelect, "Please select a State.");
  else clearError(stateSelect);

  if (!citySelect.value) showError(citySelect, "Please select a City.");
  else clearError(citySelect);

  const storage = document.getElementById("storage");
  const storageValue = storage.value.trim();
  const textRegex = /^[A-Za-z\s]{4,}$/;
  if (!textRegex.test(storageValue)) showError(storage, "Storage Conditions must be at least 4 letters and contain only alphabets & spaces.");
  else clearError(storage);

  if (!valid && firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid.focus();
    return;
  }

  // --- SERVER API SUBMISSION ---
  try {
    showToast("Submitting chemical to server... ⏳", "#2196F3");

    const response = await fetch("http://localhost:5000/api/chemicals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basic: {
          company: company.value.trim(),
          name: name.value.trim(),
          formula: formula.value.trim(),
          casNumber: casValue,
          quantity: parseInt(qty.value)
        },
        extra: {
          batch: document.getElementById("batch").value.trim(),
          manuDate: manuDate.value.trim(),
          expDate: expDate.value.trim(),
          storageConditions: storageValue,
          country: document.getElementById("country").value.trim(),
          state: stateSelect.value,
          city: citySelect.value,
          useType: document.getElementById("useType").value.trim(),
          question: document.getElementById("question").value.trim()
        }
      })
    });

    const result = await response.json();
    if (result.success) {
      showToast(`Chemical stored! TxHash: ${result.txHash}`);
      this.reset();
    } else {
      showToast(`Failed: ${result.message}`, "#f44336");
    }
  } catch (err) {
    console.error(err);
    showToast("Server error ❌", "#f44336");
  }
});
