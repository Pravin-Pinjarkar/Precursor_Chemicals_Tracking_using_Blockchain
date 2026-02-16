const express = require("express");
const cors = require("cors");
const contract = require("./blockchain");

const app = express();
app.use(cors());
app.use(express.json());

// Add chemical
app.post("/add", async (req, res) => {
  try {
    const { name, quantity, location } = req.body;
    const tx = await contract.addChemical(name, quantity, location);
    await tx.wait();
    res.json({ message: "Chemical added successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add chemical" });
  }
});

// Get chemical by ID
app.get("/chemical/:id", async (req, res) => {
  try {
    const data = await contract.getChemical(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chemical data" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
