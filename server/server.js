const semesterRoutes = require("./routes/semesterRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log(error);
  });


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/subjects", subjectRoutes);

app.get("/", (req, res) => {
  res.send("CGPA Tracker API Running...");
});


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});