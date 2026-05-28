const mongoose = require("mongoose");

const semesterSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      semesterNumber: {
        type: Number,
        required: true,
      },

      sgpa: {
        type: Number,
        default: 0,
      },

      totalCredits: {
        type: Number,
        default: 0,
      },

      subjects: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "Subject",
        },
      ],
    },

    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Semester",
  semesterSchema
);