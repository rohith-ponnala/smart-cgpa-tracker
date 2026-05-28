import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import API from "../services/api";
import SemesterCard from "../components/SemesterCard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#ff4444", "#00ff88"];

function Dashboard() {

  const navigate = useNavigate();

  const [semesters, setSemesters] = useState([]);
  const [semesterNumber, setSemesterNumber] = useState("");

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] =
    useState("All");

  const [targetCGPA, setTargetCGPA] =
    useState("");

  const [futureCredits, setFutureCredits] =
    useState("");

  const [requiredSGPA, setRequiredSGPA] =
    useState(null);

  // =========================
  // PROTECT ROUTE
  // =========================

  useEffect(() => {

    const user =
      localStorage.getItem("user");

    if (!user) {
      navigate("/login");
    }

    fetchSemesters();

  }, []);

  // =========================
  // FETCH SEMESTERS
  // =========================

  const fetchSemesters = async () => {

    try {

      setLoading(true);

      const res =
        await API.get("/semesters");

      setSemesters(res.data);

    } catch (error) {

      console.log(error);

      toast.error(
        "Failed to load semesters"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // ADD SEMESTER
  // =========================

  const addSemester = async () => {

    if (!semesterNumber) {

      return toast.error(
        "Enter semester number"
      );
    }

    try {

      await API.post("/semesters", {
        semesterNumber,
      });

      toast.success(
        "Semester Added"
      );

      setSemesterNumber("");

      fetchSemesters();

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to add semester"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {

  localStorage.removeItem("user");

  localStorage.removeItem("token");

  toast.success("Logged out");

  navigate("/login");
};
  // =========================
  // CALCULATE CGPA
  // =========================

  const calculateCGPA = () => {

    if (semesters.length === 0)
      return 0;

    let totalWeightedSGPA = 0;
    let totalCredits = 0;

    semesters.forEach((sem) => {

      totalWeightedSGPA +=
        sem.sgpa * sem.totalCredits;

      totalCredits +=
        sem.totalCredits;
    });

    if (totalCredits === 0)
      return 0;

    return (
      totalWeightedSGPA /
      totalCredits
    ).toFixed(2);
  };

  // =========================
  // ANALYTICS
  // =========================

  const highestSGPA =
    semesters.length > 0
      ? Math.max(
          ...semesters.map(
            (sem) => sem.sgpa || 0
          )
        )
      : 0;

  const lowestSGPA =
    semesters.length > 0
      ? Math.min(
          ...semesters.map(
            (sem) => sem.sgpa || 0
          )
        )
      : 0;

  const bestSemester =
    semesters.length > 0
      ? semesters.find(
          (sem) =>
            sem.sgpa === highestSGPA
        )
      : null;

  const overallCredits =
    semesters.reduce(
      (total, sem) =>
        total +
        (sem.totalCredits || 0),
      0
    );

  const cgpa =
    parseFloat(calculateCGPA());

  const performanceMessage =
    semesters.length === 0
      ? "N/A"
      : cgpa >= 9
      ? "Excellent Performance"
      : cgpa >= 8
      ? "Very Good Performance"
      : cgpa >= 7
      ? "Good Performance"
      : "Needs Improvement";

  // =========================
  // CHART DATA
  // =========================

  const chartData = semesters.map(
    (sem) => ({
      semester:
        `Sem ${sem.semesterNumber}`,
      sgpa: sem.sgpa,
    })
  );

  // =========================
  // PDF DOWNLOAD
  // =========================

  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(24);

    doc.text(
      "Smart CGPA Report",
      20,
      20
    );

    doc.setFontSize(18);

    doc.text(
      `Overall CGPA: ${calculateCGPA()}`,
      20,
      40
    );

    doc.text(
      `Overall Credits: ${overallCredits}`,
      20,
      55
    );

    const tableColumn = [
      "Semester",
      "SGPA",
      "Credits",
    ];

    const tableRows = [];

    semesters.forEach((sem) => {

      const row = [
        `Semester ${sem.semesterNumber}`,
        sem.sgpa,
        sem.totalCredits,
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("CGPA_Report.pdf");
  };

  // =========================
  // TARGET PREDICTOR
  // =========================

  const calculateTargetSGPA = () => {

    if (!targetCGPA || !futureCredits) {

      toast.error(
        "Enter all fields"
      );

      return;
    }

    const currentCredits =
      semesters.reduce(
        (acc, sem) =>
          acc + sem.totalCredits,
        0
      );

    const currentPoints =
      semesters.reduce(
        (acc, sem) =>
          acc +
          sem.sgpa *
            sem.totalCredits,
        0
      );

    const targetTotalPoints =
      parseFloat(targetCGPA) *
      (
        currentCredits +
        parseFloat(futureCredits)
      );

    const neededPoints =
      targetTotalPoints -
      currentPoints;

    const sgpaNeeded =
      neededPoints /
      parseFloat(futureCredits);

    setRequiredSGPA(
      sgpaNeeded.toFixed(2)
    );
  };

  // =========================
  // PASS FAIL
  // =========================

  const totalPassed =
    semesters.reduce(
      (acc, sem) =>
        acc +
        (sem.subjects || []).filter(
          (sub) =>
            sub.gradePoint >= 5
        ).length,
      0
    );

  const totalFailed =
    semesters.reduce(
      (acc, sem) =>
        acc +
        (sem.subjects || []).filter(
          (sub) =>
            sub.gradePoint < 5
        ).length,
      0
    );

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredSemesters =
    semesters
      .map((sem) => ({
        ...sem,

        subjects:
          (sem.subjects || []).filter(
            (sub) => {

              const subjectName =
                (
                  sub.subjectName ||
                  sub.name ||
                  ""
                ).toLowerCase();

              return subjectName.includes(
                searchTerm
                  .toLowerCase()
                  .trim()
              );
            }
          ),
      }))
      .filter((sem) => {

        const semesterMatch =
          selectedSemester ===
            "All" ||
          sem.semesterNumber ==
            selectedSemester;

        const searchMatch =
          searchTerm.trim() === ""
            ? true
            : sem.subjects.length > 0;

        return (
          semesterMatch &&
          searchMatch
        );
      });

  // =========================
  // PIE CHART
  // =========================

  const passFailData = [
    {
      name: "Failed",
      value: totalFailed,
    },
    {
      name: "Passed",
      value: totalPassed,
    },
  ];

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  }}
>

  <div
    style={{
      width: "70px",
      height: "70px",
      border: "8px solid #1e293b",
      borderTop: "8px solid #00ff88",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }}
  />

  <h1>Loading Dashboard...</h1>

</div>
    );
  }
  const tableHeader = {
  padding: "15px",
  textAlign: "left",
  color: "#94a3b8",
};

const tableCell = {
  padding: "15px",
};

  return (

    <div
      style={{
        backgroundColor:
          "#020617",
        minHeight: "100vh",
        padding: "30px",
      }}
    >

      {/* TOP BAR */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        <h1
          style={{
            color: "white",
            fontSize: "42px",
          }}
        >
          Smart CGPA Tracker
        </h1>

        <button
           onClick={handleLogout}
          style={{
            backgroundColor:
              "red",
            color: "white",
            border: "none",
            padding:
              "12px 20px",
            borderRadius:
              "10px",
            cursor: "pointer",
            fontWeight:
              "bold",
            fontSize: "16px",
          }}
        >
          Logout
        </button>

        <button
          onClick={downloadPDF}
          style={{
            backgroundColor:
              "#2563eb",
            color: "white",
            border: "none",
            padding:
              "14px 20px",
            borderRadius:
              "10px",
            cursor: "pointer",
            fontWeight:
              "bold",
            fontSize: "16px",
          }}
        >
          Download PDF Report
        </button>

      </div>

      {/* STAT CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        <div
          style={{
            background:
              "#071739",
            padding: "25px",
            borderRadius:
              "20px",
          }}
        >
          <h3
            style={{
              color:
                "#94a3b8",
            }}
          >
            Total Semesters
          </h3>

          <h1
            style={{
              color:
                "#00ff88",
              fontSize: "42px",
            }}
          >
            {semesters.length}
          </h1>
        </div>

        <div
          style={{
            background:
              "#071739",
            padding: "25px",
            borderRadius:
              "20px",
          }}
        >
          <h3
            style={{
              color:
                "#94a3b8",
            }}
          >
            Total Subjects
          </h3>

          <h1
            style={{
              color:
                "#3b82f6",
              fontSize: "42px",
            }}
          >
            {
              semesters.reduce(
                (acc, sem) =>
                  acc +
                  (
                    sem.subjects ||
                    []
                  ).length,
                0
              )
            }
          </h1>
        </div>

        <div
          style={{
            background:
              "#071739",
            padding: "25px",
            borderRadius:
              "20px",
          }}
        >
          <h3
            style={{
              color:
                "#94a3b8",
            }}
          >
            Passed Subjects
          </h3>

          <h1
            style={{
              color:
                "#22c55e",
              fontSize: "42px",
            }}
          >
            {totalPassed}
          </h1>
        </div>

        <div
          style={{
            background:
              "#071739",
            padding: "25px",
            borderRadius:
              "20px",
          }}
        >
          <h3
            style={{
              color:
                "#94a3b8",
            }}
          >
            Failed Subjects
          </h3>

          <h1
            style={{
              color:
                "#ef4444",
              fontSize: "42px",
            }}
          >
            {totalFailed}
          </h1>
        </div>

      </div>

      {/* SEARCH FILTER */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >

        <input
          type="text"
          placeholder="Search subject..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: "15px",
            borderRadius:
              "12px",
            border: "none",
            backgroundColor:
              "#1e293b",
            color: "white",
            fontSize: "16px",
          }}
        />

        <select
          value={selectedSemester}
          onChange={(e) =>
            setSelectedSemester(
              e.target.value
            )
          }
          style={{
            padding: "15px",
            borderRadius:
              "12px",
            border: "none",
            backgroundColor:
              "#1e293b",
            color: "white",
            fontSize: "16px",
          }}
        >

          <option value="All">
            All Semesters
          </option>

          {semesters.map(
            (sem) => (

              <option
                key={sem._id}
                value={
                  sem.semesterNumber
                }
              >
                Semester{" "}
                {
                  sem.semesterNumber
                }
              </option>
            )
          )}

        </select>

      </div>

      {/* CGPA CARD */}

      <div
        style={{
          backgroundColor:
            "#071739",
          padding: "30px",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      >

        <h2
          style={{
            color: "white",
            marginBottom: "20px",
          }}
        >
          Overall CGPA
        </h2>

        <h1
          style={{
            color:
              "#00ff88",
            fontSize: "64px",
          }}
        >
          {calculateCGPA()}
        </h1>

      </div>
      {/* PERFORMANCE ANALYTICS */}

<div
  style={{
    backgroundColor: "#071739",
    padding: "30px",
    borderRadius: "20px",
    marginBottom: "30px",
  }}
>

  <h2
    style={{
      color: "white",
      marginBottom: "20px",
    }}
  >
    Performance Analytics
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(250px,1fr))",
      gap: "20px",
    }}
  >

    <div>
      <p style={{ color: "#94a3b8" }}>
        Highest SGPA
      </p>

      <h1 style={{ color: "#00ff88" }}>
        {highestSGPA}
      </h1>
    </div>

    <div>
      <p style={{ color: "#94a3b8" }}>
        Lowest SGPA
      </p>

      <h1 style={{ color: "#ef4444" }}>
        {lowestSGPA}
      </h1>
    </div>

    <div>
      <p style={{ color: "#94a3b8" }}>
        Best Semester
      </p>

      <h1 style={{ color: "#3b82f6" }}>
        Semester{" "}
        {bestSemester?.semesterNumber || "-"}
      </h1>
    </div>

    <div>
      <p style={{ color: "#94a3b8" }}>
        Overall Credits
      </p>

      <h1 style={{ color: "#facc15" }}>
        {overallCredits}
      </h1>
    </div>

  </div>

  <h2
    style={{
      color:
        cgpa >= 8
          ? "#00ff88"
          : "#facc15",
      marginTop: "30px",
    }}
  >
    {performanceMessage}
  </h2>

</div>

{/* TARGET PREDICTOR */}

<div
  style={{
    backgroundColor: "#071739",
    padding: "30px",
    borderRadius: "20px",
    marginBottom: "30px",
  }}
>

  <h2
    style={{
      color: "white",
      marginBottom: "20px",
    }}
  >
    🎯 CGPA Target Predictor
  </h2>

  <input
    type="number"
    placeholder="Target CGPA"
    value={targetCGPA}
    onChange={(e) =>
      setTargetCGPA(e.target.value)
    }
    style={{
      width: "100%",
      padding: "15px",
      marginBottom: "15px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#1e293b",
      color: "white",
      fontSize: "16px",
    }}
  />

  <input
    type="number"
    placeholder="Future Credits"
    value={futureCredits}
    onChange={(e) =>
      setFutureCredits(e.target.value)
    }
    style={{
      width: "100%",
      padding: "15px",
      marginBottom: "15px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#1e293b",
      color: "white",
      fontSize: "16px",
    }}
  />

  <button
    onClick={calculateTargetSGPA}
    style={{
      backgroundColor: "#00ff88",
      color: "black",
      border: "none",
      padding: "14px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Calculate Required SGPA
  </button>

  {requiredSGPA && (
    <h3
      style={{
        color: "#00ff88",
        marginTop: "20px",
      }}
    >
      You need approximately{" "}
      {requiredSGPA} SGPA
      next semester
    </h3>
  )}

</div>

{/* CHARTS */}

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(450px,1fr))",
    gap: "30px",
    marginBottom: "30px",
  }}
>

  {/* PIE CHART */}

  <div
    style={{
      backgroundColor: "#071739",
      padding: "30px",
      borderRadius: "20px",
    }}
  >

    <h2
      style={{
        color: "white",
        marginBottom: "20px",
      }}
    >
      Pass vs Fail Analysis
    </h2>

    <div
      style={{
        width: "100%",
        height: "350px",
      }}
    >

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={passFailData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label
          >

            {passFailData.map(
              (entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[
                      index %
                        COLORS.length
                    ]
                  }
                />
              )
            )}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>

  </div>

  {/* LINE CHART */}

  <div
    style={{
      backgroundColor: "#071739",
      padding: "30px",
      borderRadius: "20px",
    }}
  >

    <h2
      style={{
        color: "white",
        marginBottom: "20px",
      }}
    >
      SGPA Performance Trend
    </h2>

    <div
      style={{
        width: "100%",
        height: "350px",
      }}
    >

      <ResponsiveContainer>

        <LineChart data={chartData}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
          />

          <XAxis
            dataKey="semester"
            stroke="#94a3b8"
          />

          <YAxis stroke="#94a3b8" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="sgpa"
            stroke="#00ff88"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  </div>

</div>

      {/* SEMESTERS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "30px",
        }}
      >

        {filteredSemesters.length === 0 ? (

  <div
    style={{
      width: "100%",
      backgroundColor: "#071739",
      padding: "40px",
      borderRadius: "20px",
      textAlign: "center",
      color: "white",
      marginTop: "20px",
    }}
  >

    <h2
      style={{
        fontSize: "32px",
        marginBottom: "10px",
      }}
    >
      📚 No Semesters Found
    </h2>

    <p
      style={{
        color: "#94a3b8",
        fontSize: "18px",
      }}
    >
      Add your first semester to start tracking CGPA 🚀
    </p>

  </div>

) : (

  filteredSemesters.map((semester) => (

    <SemesterCard
      key={semester._id}
      semester={semester}
      fetchSemesters={fetchSemesters}
    />

  ))

)}

      </div>
      {/* SUBJECT PERFORMANCE TABLE */}

<div
  style={{
    backgroundColor: "#071739",
    padding: "30px",
    borderRadius: "20px",
    marginTop: "40px",
  }}
>

  <h2
    style={{
      color: "white",
      marginBottom: "25px",
    }}
  >
    Subject Performance
  </h2>

  <div
    style={{
      overflowX: "auto",
    }}
  >

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        color: "white",
      }}
    >

      <thead>

        <tr
          style={{
            backgroundColor: "#0f172a",
          }}
        >

          <th style={tableHeader}>
            Subject
          </th>

          <th style={tableHeader}>
            Semester
          </th>

          <th style={tableHeader}>
            Grade
          </th>

          <th style={tableHeader}>
            Credits
          </th>

          <th style={tableHeader}>
            Grade Point
          </th>

          <th style={tableHeader}>
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {filteredSemesters.flatMap((sem) =>
          (sem.subjects || []).map(
            (sub, index) => (

              <tr
                key={index}
                style={{
                  borderBottom:
                    "1px solid #1e293b",
                }}
              >

                <td style={tableCell}>
                  {sub.subjectName}
                </td>

                <td style={tableCell}>
                  Semester {sem.semesterNumber}
                </td>

                <td style={tableCell}>
                  {sub.grade}
                </td>

                <td style={tableCell}>
                  {sub.credits}
                </td>

                <td style={tableCell}>
                  {sub.gradePoint}
                </td>

                <td
                  style={{
                    ...tableCell,
                    color:
                      sub.gradePoint >= 5
                        ? "#22c55e"
                        : "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  {sub.gradePoint >= 5
                    ? "PASS"
                    : "FAIL"}
                </td>

              </tr>
            )
          )
        )}

      </tbody>

    </table>

  </div>

</div>

    </div>
  );
}
const styleSheet = document.styleSheets[0];

styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`, styleSheet.cssRules.length);
export default Dashboard;