import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../services/api";

function SemesterCard({
  semester,
  fetchSemesters,
}) {

  const [subjects, setSubjects] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [formData, setFormData] =
    useState({
      subjectName: "",
      credits: "",
      grade: "",
      gradePoint: "",
    });

  const [editData, setEditData] =
    useState({
      subjectName: "",
      credits: "",
      grade: "",
      gradePoint: "",
    });

  // =========================
  // GRADE MAP
  // =========================

  const gradeMap = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    U: 0,
  };

  // =========================
  // FETCH SUBJECTS
  // =========================

  const fetchSubjects = async () => {

    try {

      const res = await API.get(
        `/subjects/${semester._id}`
      );

      setSubjects(res.data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // =========================
  // STATS
  // =========================

  const totalSubjects =
    subjects.length;

  const failedSubjects =
    subjects.filter(
      (sub) => sub.grade === "U"
    ).length;

  const passedSubjects =
    totalSubjects - failedSubjects;

  const status =
    failedSubjects > 0
      ? "FAIL"
      : "PASS";

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    if (name === "grade") {

      setFormData({
        ...formData,
        grade: value,
        gradePoint:
          gradeMap[value],
      });

    } else {

      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // =========================
  // ADD SUBJECT
  // =========================

  const addSubject = async () => {

    if (
      !formData.subjectName ||
      !formData.credits ||
      !formData.grade
    ) {
      return toast.error(
        "Fill all fields"
      );
    }

    try {

      setLoading(true);

      await API.post(
        `/subjects/${semester._id}`,
        formData
      );

      toast.success(
        "Subject Added"
      );

      setFormData({
        subjectName: "",
        credits: "",
        grade: "",
        gradePoint: "",
      });

      fetchSubjects();
      fetchSemesters();

      setShowForm(false);

    } catch (error) {

      console.log(error);

      toast.error(
        "Failed to add subject"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // DELETE SUBJECT
  // =========================

  const deleteSubject = async (
    id
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this subject?"
      );

    if (!confirmDelete) return;

    try {

      await API.delete(
        `/subjects/${id}`
      );

      toast.success(
        "Subject Deleted"
      );

      await fetchSubjects();

      await fetchSemesters();

    } catch (error) {

      console.log(error);

      toast.error(
        "Delete failed"
      );
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (subject) => {

    setEditingId(subject._id);

    setEditData({
      subjectName:
        subject.subjectName,
      credits: subject.credits,
      grade: subject.grade,
      gradePoint:
        subject.gradePoint,
    });
  };

  // =========================
  // UPDATE SUBJECT
  // =========================

  const updateSubject = async () => {

    try {

      await API.put(
        `/subjects/${editingId}`,
        editData
      );

      toast.success(
        "Subject Updated"
      );

      setEditingId(null);

      fetchSubjects();

      fetchSemesters();

    } catch (error) {

      console.log(error);

      toast.error(
        "Update failed"
      );
    }
  };

  // =========================
  // DELETE SEMESTER
  // =========================

  const handleDeleteSemester =
    async () => {

      const confirmDelete =
        window.confirm(
          "Delete this semester?"
        );

      if (!confirmDelete) return;

      try {

        await API.delete(
          `/semesters/${semester._id}`
        );

        toast.success(
          "Semester deleted"
        );

        fetchSemesters();

      } catch (error) {

        console.log(error);

        toast.error(
          "Delete failed"
        );
      }
    };

  return (

    <div
      style={{
        backgroundColor: "#0f172a",
        padding: "25px",
        borderRadius: "20px",
        boxShadow:
          "0px 0px 20px rgba(0,255,120,0.08)",
      }}
    >

      {/* TITLE */}

      <h1
        style={{
          color: "white",
          fontSize: "38px",
        }}
      >
        Semester {
          semester.semesterNumber
        }
      </h1>

      {/* DELETE SEM */}

      <button
        onClick={
          handleDeleteSemester
        }
        style={{
          backgroundColor: "red",
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        Delete Semester
      </button>

      {/* SGPA */}

      <h2
        style={{
          color: "#00e676",
        }}
      >
        SGPA:
        {" "}
        {semester.sgpa || 0}
      </h2>

      <h3
        style={{
          color: "#ffd54f",
          marginBottom: "20px",
        }}
      >
        Total Credits:
        {" "}
        {semester.totalCredits || 0}
      </h3>

      {/* ADD SUBJECT BUTTON */}

      <button
        onClick={() =>
          setShowForm(!showForm)
        }
        style={{
          width: "100%",
          padding: "18px",
          backgroundColor:
            "#00c853",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "22px",
          fontWeight: "bold",
          marginBottom: "25px",
          cursor: "pointer",
        }}
      >
        {showForm
          ? "Close Form"
          : "+ Add Subject"}
      </button>

      {/* FORM */}

      {showForm && (

        <div>

          <input
            type="text"
            name="subjectName"
            placeholder="Subject Name"
            value={
              formData.subjectName
            }
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="number"
            name="credits"
            placeholder="Credits"
            value={formData.credits}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            style={inputStyle}
          >

            <option value="">
              Select Grade
            </option>

            <option value="O">
              O
            </option>

            <option value="A+">
              A+
            </option>

            <option value="A">
              A
            </option>

            <option value="B+">
              B+
            </option>

            <option value="B">
              B
            </option>

            <option value="C">
              C
            </option>

            <option value="U">
              U
            </option>

          </select>

          <input
            type="number"
            readOnly
            value={
              formData.gradePoint
            }
            placeholder="Grade Point Auto"
            style={{
              ...inputStyle,
              backgroundColor:
                "#0b1220",
              cursor:
                "not-allowed",
            }}
          />

          <button
            onClick={addSubject}
            style={addButton}
          >
            {loading
              ? "Adding..."
              : "Add Subject"}
          </button>

        </div>
      )}

      {/* STATS */}

      <div
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >

        <h2
          style={{
            color: "white",
            marginBottom: "20px",
          }}
        >
          Subjects
        </h2>

        <p style={statsText}>
          Total Subjects:
          {" "}
          <span
            style={greenText}
          >
            {totalSubjects}
          </span>
        </p>

        <p style={statsText}>
          Passed:
          {" "}
          <span
            style={greenText}
          >
            {passedSubjects}
          </span>
        </p>

        <p style={statsText}>
          Failed:
          {" "}
          <span
            style={redText}
          >
            {failedSubjects}
          </span>
        </p>

        <p
          style={{
            color:
              status === "PASS"
                ? "#00e676"
                : "red",

            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          Status: {status}
        </p>

      </div>

      {/* SUBJECT LIST */}

      {subjects.map((sub) => (

        <div
          key={sub._id}
          style={{
            backgroundColor:
              "#1e293b",

            padding: "20px",

            borderRadius: "16px",

            marginBottom: "20px",

            transition: "0.3s",
          }}
        >

          {editingId ===
          sub._id ? (

            <div>

              <input
                type="text"
                value={
                  editData.subjectName
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    subjectName:
                      e.target.value,
                  })
                }
                placeholder="Subject Name"
                style={inputStyle}
              />

              <input
                type="number"
                value={
                  editData.credits
                }
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    credits:
                      e.target.value,
                  })
                }
                placeholder="Credits"
                style={inputStyle}
              />

              <select
                value={
                  editData.grade
                }
                onChange={(e) => {

                  const grade =
                    e.target.value;

                  setEditData({
                    ...editData,
                    grade,
                    gradePoint:
                      gradeMap[
                        grade
                      ],
                  });
                }}
                style={inputStyle}
              >

                <option value="">
                  Select Grade
                </option>

                <option value="O">
                  O
                </option>

                <option value="A+">
                  A+
                </option>

                <option value="A">
                  A
                </option>

                <option value="B+">
                  B+
                </option>

                <option value="B">
                  B
                </option>

                <option value="C">
                  C
                </option>

                <option value="U">
                  U
                </option>

              </select>

              <input
                type="number"
                readOnly
                value={
                  editData.gradePoint
                }
                style={{
                  ...inputStyle,
                  backgroundColor:
                    "#0b1220",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                  flexWrap: "wrap",
                }}
              >

                <button
                  onClick={
                    updateSubject
                  }
                  style={{
                    backgroundColor:
                      "green",

                    color: "white",

                    border: "none",

                    padding:
                      "10px 18px",

                    borderRadius:
                      "10px",

                    cursor: "pointer",

                    fontWeight:
                      "bold",
                  }}
                >
                  Save
                </button>

                <button
                  onClick={() =>
                    setEditingId(
                      null
                    )
                  }
                  style={{
                    backgroundColor:
                      "gray",

                    color: "white",

                    border: "none",

                    padding:
                      "10px 18px",

                    borderRadius:
                      "10px",

                    cursor: "pointer",

                    fontWeight:
                      "bold",
                  }}
                >
                  Cancel
                </button>

              </div>

            </div>

          ) : (

            <div>

              <h2
                style={{
                  color: "white",
                  fontSize: "26px",
                  textTransform:
                    "uppercase",
                }}
              >
                {
                  sub.subjectName
                }
              </h2>

              <p
                style={{
                  color:
                    sub.grade ===
                    "U"
                      ? "red"
                      : "#00e676",

                  fontSize: "20px",

                  fontWeight:
                    "bold",

                  marginTop:
                    "12px",
                }}
              >
                {sub.grade}
                {" "}Grade
                • {" "}
                {sub.credits}
                {" "}Credits
                • GP:
                {
                  sub.gradePoint
                }
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >

                <button
                  onClick={() =>
                    startEdit(sub)
                  }
                  style={{
                    backgroundColor:
                      "#ff9800",

                    color: "white",

                    border: "none",

                    padding:
                      "10px 18px",

                    borderRadius:
                      "10px",

                    cursor: "pointer",

                    fontWeight:
                      "bold",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteSubject(
                      sub._id
                    )
                  }
                  style={{
                    backgroundColor:
                      "red",

                    color: "white",

                    border: "none",

                    padding:
                      "10px 18px",

                    borderRadius:
                      "10px",

                    cursor: "pointer",

                    fontWeight:
                      "bold",
                  }}
                >
                  Delete
                </button>

              </div>

            </div>
          )}

        </div>
      ))}

    </div>
  );
}

// =========================
// STYLES
// =========================

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "14px",
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "#1e293b",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
};

const addButton = {
  width: "100%",
  padding: "16px",
  marginTop: "20px",
  backgroundColor: "#00c853",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "20px",
};

const statsText = {
  color: "white",
  fontSize: "18px",
  marginBottom: "10px",
};

const greenText = {
  color: "#00e676",
  fontWeight: "bold",
};

const redText = {
  color: "red",
  fontWeight: "bold",
};

export default SemesterCard;