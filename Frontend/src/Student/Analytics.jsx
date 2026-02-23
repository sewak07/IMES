import { useState } from "react";
import { Radar, Bar } from "react-chartjs-2";
import styles from "./StudentDashboard.module.css";
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics({ performance }) {
  const [term, setTerm] = useState("1st Term");

  if (!performance || performance.length === 0) {
    return (
      <div className={styles.analyticsMessage}>
        <p>No performance data available for analytics.</p>
      </div>
    );
  }

  try {
    const subjects = performance.map((s) =>
      typeof s.subject === "string" ? s.subject : String(s.subject || "Unknown")
    );

    const marks = performance.map((s) => {
      const value =
        term === "1st Term"
          ? s.marks?.rawInternal
          : s.marks?.rawMidTerm;
      return typeof value === "number" && !isNaN(value) ? value : 0;
    });

    const radarData = {
      labels: subjects,
      datasets: [
        {
          label: term,
          data: marks,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(54, 162, 235, 1)",
        },
      ],
    };

    const barData = {
      labels: subjects,
      datasets: [
        {
          label: term,
          data: marks,
          backgroundColor: "#36a2eb",
        },
      ],
    };

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { min: 0, max: 60, ticks: { stepSize: 2 } } },
      plugins: { legend: { position: "top" } },
    };

    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 0, max: 60, ticks: { stepSize: 2 } } },
      plugins: { legend: { position: "top" } },
    };

    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsHeader}>
          <h2>Analytics</h2>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={styles.termSelect}
          >
            <option>1st Term</option>
            <option>Mid Term</option>
          </select>
        </div>

        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsCard}>
            <h3>Skill Radar</h3>
            <div className={styles.chartWrapper}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <h3>Score Comparison</h3>
            <div className={styles.chartWrapper}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Analytics rendering error:", error);
    return (
      <div className={styles.analyticsError}>
        <p>Error loading analytics: {error.message}</p>
      </div>
    );
  }
}
