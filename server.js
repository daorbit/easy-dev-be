const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://svg-viewer-studio.vercel.app",
      "https://easydev.daorbit.in",
      "http://localhost:8080",
      "http://localhost:3000",
      "https://lovable.dev",
      "https://id-preview--5a0bbe0e-871f-4852-9707-824ccb4e39b5.lovable.app",
      "https://lovable.dev/projects/5a0bbe0e-871f-4852-9707-824ccb4e39b5",
    ],
  }),
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/easy-dev", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const snippetsRoutes = require("./routes/snippets");
const aiRoutes = require("./routes/ai");
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/snippets", snippetsRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
