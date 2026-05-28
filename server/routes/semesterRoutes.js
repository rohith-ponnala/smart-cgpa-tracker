const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  addSemester,
  getSemesters,
  deleteSemester,
} = require(
  "../controllers/semesterController"
);

// ADD SEMESTER
router.post(
  "/",
  authMiddleware,
  addSemester
);

// GET SEMESTERS
router.get(
  "/",
  authMiddleware,
  getSemesters
);

// DELETE SEMESTER
router.delete(
  "/:id",
  authMiddleware,
  deleteSemester
);

module.exports = router;