const calculateSGPA = (subjects) => {
  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((sub) => {
    totalCredits += Number(sub.credits);

    totalPoints +=
      Number(sub.credits) *
      Number(sub.gradePoint);
  });

  const sgpa =
    totalCredits === 0
      ? 0
      : (totalPoints / totalCredits).toFixed(2);

  return {
    sgpa,
    totalCredits,
  };
};

module.exports = calculateSGPA;