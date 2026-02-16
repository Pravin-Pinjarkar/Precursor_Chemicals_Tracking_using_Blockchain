const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
  },
  distributor: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String, // Example: "/uploads/filename.pdf"
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
