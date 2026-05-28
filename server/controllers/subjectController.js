const Subject = require("../models/Subject");
const Semester = require("../models/Semester");
const calculateSGPA = require("../utils/cgpaCalculator");

// ================= ADD SUBJECT =================
exports.addSubject = async (req, res) => {
  try {
    const { subjectName, credits, grade, gradePoint } = req.body;

    // FIND SEMESTER
    const semester = await Semester.findById(
      req.params.semesterId
    );

    if (!semester) {
      return res.status(404).json({
        message: "Semester not found",
      });
    }

    // CREATE SUBJECT
    const subject = await Subject.create({
      semester: semester._id,
      subjectName,
      credits,
      grade,
      gradePoint,
    });

    // PUSH SUBJECT
    semester.subjects.push(subject._id);

    // GET ALL SUBJECTS
    const allSubjects = await Subject.find({
      semester: semester._id,
    });

    // CALCULATE SGPA
    const { sgpa, totalCredits } = calculateSGPA([
      ...allSubjects,
      subject,
    ]);

    semester.sgpa = sgpa;
    semester.totalCredits = totalCredits;

    await semester.save();

    res.status(201).json(subject);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET SUBJECTS =================
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      semester: req.params.semesterId,
    });

    res.status(200).json(subjects);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE SUBJECT =================
exports.deleteSubject = async (req, res) => {
  try {
    // FIND SUBJECT
    const subject = await Subject.findById(
      req.params.id
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // FIND SEMESTER
    const semester = await Semester.findById(
      subject.semester
    );

    // DELETE SUBJECT
    await Subject.findByIdAndDelete(
      req.params.id
    );

    // GET REMAINING SUBJECTS
    const remainingSubjects = await Subject.find({
      semester: semester._id,
    });

    // RECALCULATE
    let totalCredits = 0;
    let totalPoints = 0;

    remainingSubjects.forEach((sub) => {
      totalCredits += Number(sub.credits);

      totalPoints +=
        Number(sub.credits) *
        Number(sub.gradePoint);
    });

    semester.totalCredits = totalCredits;

    semester.sgpa =
      totalCredits === 0
        ? 0
        : (
            totalPoints / totalCredits
          ).toFixed(2);

    await semester.save();

    res.status(200).json({
      message: "Subject deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= UPDATE SUBJECT =================
exports.updateSubject = async (req, res) => {
  try {
    const {
      subjectName,
      credits,
      grade,
      gradePoint,
    } = req.body;

    // FIND SUBJECT
    let subject = await Subject.findById(
      req.params.id
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // UPDATE SUBJECT
    subject.subjectName = subjectName;
    subject.credits = credits;
    subject.grade = grade;
    subject.gradePoint = gradePoint;

    await subject.save();

    // FIND SEMESTER
    const semester = await Semester.findById(
      subject.semester
    );

    // GET ALL SUBJECTS
    const subjects = await Subject.find({
      semester: semester._id,
    });

    // RECALCULATE
    let totalCredits = 0;
    let totalPoints = 0;

    subjects.forEach((sub) => {
      totalCredits += Number(sub.credits);

      totalPoints +=
        Number(sub.credits) *
        Number(sub.gradePoint);
    });

    semester.totalCredits = totalCredits;

    semester.sgpa =
      totalCredits === 0
        ? 0
        : (
            totalPoints / totalCredits
          ).toFixed(2);

    await semester.save();

    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};