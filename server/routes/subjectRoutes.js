const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addSubject,
  getSubjects,
  deleteSubject,
  updateSubject,
} = require("../controllers/subjectController");


// ADD SUBJECT
router.post(
  "/:semesterId",
  authMiddleware,
  addSubject
);


// GET SUBJECTS
router.get(
  "/:semesterId",
  authMiddleware,
  getSubjects
);


// DELETE SUBJECT
router.delete(
  "/:id",
  authMiddleware,
  deleteSubject
);


// UPDATE SUBJECT
router.put(
  "/:id",
  authMiddleware,
  updateSubject
);

module.exports = router;