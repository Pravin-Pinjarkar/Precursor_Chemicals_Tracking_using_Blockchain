/***************************************************************
 * server.js — Full Chemical Tracking + Blockchain + Auth System
 * Compatible with ethers v6 and Hardhat local network
 ***************************************************************/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve general uploads (kept for existing /api/upload)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔥 Auto-create uploads folder (OPTION B placement)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// serve profile images from /profile
app.use("/profile", express.static(path.join(__dirname, "profile")));

// ================= SENDGRID SETUP =================
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// ================= MONGO CONNECTION =================
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://admin:Pravin007@cluster0.hdcvvrz.mongodb.net/chemicalDB?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================== MULTER CONFIG ==================
const uploadsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: uploadsStorage });

// === New: profile folder storage
const profileDir = path.join(__dirname, "profile");
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only image files are allowed for profile pictures"));
  },
});

// ================== MONGOOSE MODELS ==================
const Document = mongoose.model(
  "documents",
  new mongoose.Schema({
    section: String,
    distributor: String,
    fileName: String,
    filePath: String,
    uploadedAt: Date,
  })
);

const Account = mongoose.model(
  "accounts",
  new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    mobile: String,
    dob: String,
    role: { type: String, required: true },
    profilePic: { type: String, default: "" },
    otp: String,
    otpExpiresAt: Date,
    createdAt: { type: Date, default: Date.now },
  })
);

const Batch = mongoose.model(
  "batches",
  new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    precursor: { type: String, required: true },
    originLocation: { type: String, required: true },
    approvalNumber: { type: String, required: true, unique: true },
    notes: String,
    qrCodeData: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  })
);

const Counter = mongoose.model(
  "counters",
  new mongoose.Schema({
    name: { type: String, unique: true },
    value: { type: Number, default: 0 },
  })
);

const ChemicalRecord = mongoose.model(
  "chemicalRecords",
  new mongoose.Schema({
    company: String,
    name: String,
    formula: String,
    casNumber: String,
    quantity: Number,
    batch: String,
    manuDate: String,
    expDate: String,
    storageConditions: String,
    country: String,
    state: String,
    city: String,
    useType: String,
    question: String,
    transactionHash: String,
    blockNumber: Number,
    contractAddress: String,
    createdAt: { type: Date, default: Date.now },
  })
);

// ================= COUNTER HELPERS =================
async function initializeCounters() {
  try {
    if (!(await Counter.findOne({ name: "batchCounter" }))) {
      await new Counter({ name: "batchCounter", value: 101 }).save();
    }
    if (!(await Counter.findOne({ name: "approvalCounter" }))) {
      await new Counter({ name: "approvalCounter", value: 501 }).save();
    }
  } catch (err) {
    console.error("❌ Counter Init Error:", err);
  }
}

async function getNextCounter(counterName) {
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

// ==========================================================
// 🔗 BLOCKCHAIN CONFIG (Ethers v6)
// ==========================================================
let contractInstance = null;
let contractAddressInUse = process.env.CONTRACT_ADDRESS || null;

async function loadArtifactJson() {
  const artifactPath = path.join(
    __dirname,
    "artifacts/contracts/chemical.sol/ChemicalStorage.json"
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Contract artifact not found. Run `npx hardhat compile`.");
  }
  return require(artifactPath);
}

async function createOrLoadContract() {
  if (contractInstance) return contractInstance;

  const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(RPC);

  if (!process.env.PRIVATE_KEY)
    throw new Error("❌ PRIVATE_KEY missing in .env file");

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const artifact = await loadArtifactJson();
  const abi = artifact.abi;
  const bytecode = artifact.bytecode;

  if (contractAddressInUse) {
    contractInstance = new ethers.Contract(contractAddressInUse, abi, signer);
    console.log("🔗 Using existing contract:", contractAddressInUse);
    return contractInstance;
  }

  console.log("🚀 Deploying ChemicalStorage contract...");
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const deployed = await factory.deploy();
  await deployed.waitForDeployment();

  contractAddressInUse = await deployed.getAddress();
  console.log("✅ Deployed at:", contractAddressInUse);

  contractInstance = new ethers.Contract(contractAddressInUse, abi, signer);
  return contractInstance;
}

// ==========================================================
// 🧩 ROUTES
// ==========================================================
app.get("/", (req, res) =>
  res.send(`<h3>Chemical Upload Backend</h3><p>Server is running ✅</p>`)
);

// --- Blockchain routes ---
app.get("/api/blockchain/contract-address", async (req, res) => {
  try {
    if (!contractAddressInUse) await createOrLoadContract();
    res.json({ contractAddress: contractAddressInUse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chemicals", async (req, res) => {
  console.log("🔥 Received POST request to /api/chemicals");

  try {
    const { basic = {}, extra = {} } = req.body;

    if (!basic.name || !basic.company || !basic.quantity) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log("📦 Incoming chemical data:", basic, extra);

    const contract = await createOrLoadContract();
    console.log("🔗 Contract connected at:", contract.target || contract.address);

    const chemical = {
      company: String(basic.company || ""),
      name: String(basic.name || ""),
      formula: String(basic.formula || ""),
      casNumber: String(basic.casNumber || ""),
      quantity: Number(basic.quantity || 0),
      batch: String(extra.batch || ""),
      manuDate: String(extra.manuDate || ""),
      expDate: String(extra.expDate || ""),
      storageConditions: String(extra.storageConditions || ""),
      country: String(extra.country || ""),
      state: String(extra.state || ""),
      city: String(extra.city || ""),
      useType: String(extra.useType || ""),
      question: String(extra.question || ""),
      timestamp: 0,
    };

    console.log("🧪 Sending struct to blockchain:", chemical);

    const tx = await contract.addChemical(chemical);
    console.log("⏳ Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Mined in block:", receipt.blockNumber);

    const chemicalRecord = new ChemicalRecord({
      company: chemical.company,
      name: chemical.name,
      formula: chemical.formula,
      casNumber: chemical.casNumber,
      quantity: chemical.quantity,
      batch: chemical.batch,
      manuDate: chemical.manuDate,
      expDate: chemical.expDate,
      storageConditions: chemical.storageConditions,
      country: chemical.country,
      state: chemical.state,
      city: chemical.city,
      useType: chemical.useType,
      question: chemical.question,
      transactionHash: receipt.hash || receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      contractAddress: contractAddressInUse,
    });

    await chemicalRecord.save();
    console.log("💾 Saved to MongoDB:", chemicalRecord._id);

    return res.json({
      success: true,
      txHash: receipt.hash || receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      recordId: chemicalRecord._id,
    });

  } catch (error) {
    console.error("❌ FULL BLOCKCHAIN ERROR DETAILS ❌");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unknown blockchain error",
      stack: error.stack,
    });
  }
});

app.get("/api/blockchain/chemical/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0)
      return res.status(400).json({ error: "Invalid ID" });

    const contract = await createOrLoadContract();
    const data = await contract.getChemical(id);

    res.json({
      success: true,
      data: {
        id,
        name: data[0],
        formula: data[1],
        quantity: data[2].toString(),
        location: data[3],
        safetyInfo: data[4],
        timestamp: Number(data[5]),
      },
    });
  } catch (err) {
    console.error("❌ getChemical error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔍 view all chemicals on blockchain
app.get("/api/blockchain/all-chemicals", async (req, res) => {
  try {
    const contract = await createOrLoadContract();
    const chemicals = await contract.getAllChemicals();

    const formatted = chemicals.map((c, i) => ({
      id: i + 1,
      company: c.company,
      name: c.name,
      formula: c.formula,
      casNumber: c.casNumber,
      quantity: c.quantity.toString(),
      batch: c.batch,
      manuDate: c.manuDate,
      expDate: c.expDate,
      storageConditions: c.storageConditions,
      country: c.country,
      state: c.state,
      city: c.city,
      useType: c.useType,
      question: c.question,
      timestamp: c.timestamp.toString(),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error("❌ Error fetching all chemicals:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔍 view all chemicals from mongo
app.get("/api/chemicals-records", async (req, res) => {
  try {
    const records = await ChemicalRecord.find().sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error("❌ Error fetching chemical records:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// view single chemical record
app.get("/api/chemicals-records/:id", async (req, res) => {
  try {
    const record = await ChemicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, data: record });
  } catch (error) {
    console.error("❌ Error fetching chemical record:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- File Upload Routes (general files) ---
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const doc = new Document({
      section: req.body.section,
      distributor: req.body.distributor,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      uploadedAt: new Date(),
    });
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/api/uploads", async (_, res) => {
  const docs = await Document.find().sort({ uploadedAt: -1 });
  res.json(docs);
});

// 🔥 NEW — Delete uploaded document (required by upload.js)
app.delete("/api/uploads/:id", async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Delete physical file
    const filepath = path.join(__dirname, "uploads", doc.filePath);
    if (fs.existsSync(filepath)) {
      try { fs.unlinkSync(filepath); } catch (e) {}
    }

    res.json({ success: true, message: "Document deleted", id: req.params.id });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// 🔥 NEW — Confirm & Send final document set (required by upload.js)
// 🔥 NEW — Confirm & Send final document set WITH EMAIL ATTACHMENTS
app.post("/api/confirm-send", async (req, res) => {
  try {
    const { docs = [] } = req.body;
    console.log(" Confirm-send triggered with", docs.length, "documents");

    // Required categories
    const requiredSections = ["msds", "coa", "tds", "compliance", "import", "waste", "transport"];
    const uploadedSections = new Set(docs.map((d) => d.section));

    const missing = requiredSections.filter((s) => !uploadedSections.has(s));
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Please upload documents for: " +
          missing.map((m) => m.toUpperCase()).join(", "),
      });
    }

    // Authentication – extract user from token
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, error: "Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await Account.findById(decoded.id);

    if (!user || !user.email)
      return res.status(400).json({ success: false, error: "Email not found for logged-in user" });

    const userEmail = user.email;
    console.log(" Email will be sent to:", userEmail);

    // Skip mail (only for debug or development)
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("⚠️ SENDGRID_API_KEY not found. Skip sending mail.");
      return res.json({ success: true, message: "Documents submitted (email disabled)" });
    }

    // Prepare attachments
    const attachments = await Promise.all(
      docs.map(async (doc) => {
        try {
          const filePath = path.join(__dirname, "uploads", doc.filePath);
          if (!fs.existsSync(filePath)) return null;

          const buffer = await fs.promises.readFile(filePath);
          return {
            content: buffer.toString("base64"),
            filename: doc.fileName,
            type: "application/octet-stream",
            disposition: "attachment",
          };
        } catch (err) {
          return null;
        }
      })
    );

    const validAttachments = attachments.filter(Boolean);
    if (!validAttachments.length)
      return res.status(400).json({ success: false, error: "No files found for attachments" });

    const fileListText = docs
      .map((d) => `• ${String(d.section || "").toUpperCase()} — ${d.fileName}`)
      .join("\n");

    // 🔥 Send mail to USER
    await sgMail.send({
  to: userEmail,
  from: {
    email: process.env.FROM_EMAIL,     // Verified sender domain
    name: `Document Submission - ${user.email}`   // Shows user identity
  },
  replyTo: userEmail,   // replies go to the logged user
  subject: "Your Uploaded Chemical Documents — NCB Portal",
  text:
    "Dear user,\n\n" +
    "You have just submitted the following documents:\n\n" +
    fileListText +
    "\n\nAll documents are attached.\n\nRegards,\nNCB Portal",
  attachments: validAttachments,
});

    // 🔥 Send mail to NCB OFFICIAL also
    await sgMail.send({
  to: "ncb.official51@gmail.com",
  from: {
    email: process.env.FROM_EMAIL,
    name: `User: ${user.email} — Document Submission`
  },
  replyTo: user.email,
  subject: `New chemical documents submitted by ${user.email}`,
  text:
    `User Email: ${user.email}\n\n` +
    "Submitted documents:\n\n" +
    fileListText +
    "\n\nAll files attached.",
  attachments: validAttachments,
});


    console.log(" Emails sent to:", userEmail, "and ncb.official51@gmail.com");

    return res.json({ success: true, message: "Documents emailed successfully" });

  } catch (err) {
    console.error("❌ Confirm-send error:", err);
    res.status(500).json({ error: "Confirm-send failed" });
  }
});


// --- Auth (Signup + Login + OTP) ---
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, mobile, dob, role } = req.body;
    if (!name || !email || !password || !mobile || !dob || !role)
      return res.status(400).json({ message: "All fields required" });

    if (await Account.findOne({ email }))
      return res.status(400).json({ message: "User already exists" });

    await new Account({ name, email, password, mobile, dob, role }).save();
    res.json({ message: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Account.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60000);
    await user.save();

    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`,
      });
    } else console.log(`🔔 OTP for ${user.email}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Account.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiresAt < new Date())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "2h" }
    );

    res.json({ message: "OTP verified", token });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

// ========================= User Profile (includes profilePicUrl) =========================
app.get("/api/user-profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Missing auth token" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await Account.findById(decoded.id).select("-password -otp -otpExpiresAt");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user.toObject(),
      profilePicUrl: user.profilePic ? `/profile/${user.profilePic}` : null,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to load user profile" });
  }
});

// ========================= Upload Profile Picture =========================
app.post("/api/upload-profile-pic", uploadProfile.single("profilePic"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Missing auth token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await Account.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePic && fs.existsSync(path.join(profileDir, user.profilePic))) {
      try { fs.unlinkSync(path.join(profileDir, user.profilePic)); } catch (e) {}
    }

    user.profilePic = req.file.filename;
    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      profilePicUrl: `/profile/${req.file.filename}`,
    });
  } catch (err) {
    console.error("❌ Error uploading profile pic:", err);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
});



// ================= CREATE BATCH =================
app.post("/api/batches", async (req, res) => {
  try {
    const { precursor, originLocation, notes, qrCodeData } = req.body;
    if (!precursor || !originLocation)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    // auto increment counters
    const nextBatchId = await getNextCounter("batchCounter");
    const nextApproval = await getNextCounter("approvalCounter");

    const batchId = `BATCH-${nextBatchId}`;
    const approvalNumber = `APR-${nextApproval}`;

    // save to mongo
    const batch = await new Batch({
      batchId,
      precursor,
      originLocation,
      approvalNumber,
      notes,
      qrCodeData
    }).save();

    return res.json({
      success: true,
      data: batch,
    });

  } catch (error) {
    console.error("❌ Batch Save Error:", error);
    return res.status(500).json({ success: false, message: "Batch save failed" });
  }
});

// ==========================================================
// 🚀 START SERVER
// ==========================================================
(async () => {
  await initializeCounters();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(" Contract in use:", process.env.CONTRACT_ADDRESS);
  });
})();
