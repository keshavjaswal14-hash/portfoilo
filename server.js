const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is not set. Add it to your .env file before starting the server.");
  process.exit(1);
}

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model("ContactMessage", messageSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Message stored successfully.",
      id: contactMessage._id,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      error: "Unable to save message right now.",
    });
  }
});

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    app.listen(port, () => {
      console.log(`Portfolio server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

startServer();
