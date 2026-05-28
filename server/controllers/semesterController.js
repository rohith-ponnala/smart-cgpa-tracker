const Semester = require(
  "../models/Semester"
);

const Subject = require(
  "../models/Subject"
);

// ADD SEMESTER
exports.addSemester = async (
  req,
  res
) => {

  try {

    const { semesterNumber } =
      req.body;

    const existingSemester =
      await Semester.findOne({
        user: req.user.id,
        semesterNumber,
      });

    if (existingSemester) {
      return res.status(400).json({
        message:
          "Semester already exists",
      });
    }

    const semester =
      await Semester.create({
        user: req.user.id,
        semesterNumber,
      });

    res.status(201).json(
      semester
    );

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL SEMESTERS
exports.getSemesters = async (
  req,
  res
) => {

  try {

    const semesters =
      await Semester.find({
        user: req.user.id,
      })
        .populate("subjects")
        .sort({ semesterNumber: 1 });

    res.status(200).json(
      semesters
    );

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE SEMESTER
exports.deleteSemester = async (
  req,
  res
) => {

  try {

    await Subject.deleteMany({
      semester: req.params.id,
    });

    const semester =
      await Semester.findByIdAndDelete(
        req.params.id
      );

    if (!semester) {
      return res.status(404).json({
        message:
          "Semester not found",
      });
    }

    res.status(200).json({
      message:
        "Semester deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};