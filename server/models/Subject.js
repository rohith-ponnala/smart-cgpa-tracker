const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },

    subjectName: String,

    credits: Number,

    grade: String,

    gradePoint: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Subject",
  subjectSchema
);