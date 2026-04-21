import styles from "./StudentDashboard.module.css";
import { FiBook, FiCalendar, FiTrendingUp } from "react-icons/fi"
export default function Stats({ performance, student }) {
  const avgAttendancePct = Math.round(
    performance.reduce((sum, s) => {
      const a = s.attendance;
      return sum + (a?.totalDays ? (a.attendedDays / a.totalDays) * 100 : 0);
    }, 0) / performance.length
  );

  const avgInternalPct = Math.round(
    (performance.reduce((sum, s) => {
      return (
        sum +
        (s.marks?.internal || 0) +
        (s.marks?.midTerm || 0) +
        (s.marks?.assignment1 || 0) +
        (s.marks?.assignment2 || 0) +
        (s.marks?.assignment3 || 0) +
        (s.marks?.attendanceMarks || 0)
      );
    }, 0) /
      (performance.length * (10 + 10 + 3 + 3 + 4 + 10))) *
    100
  );

  return (
    <div>
      <div className={styles.sdHeader}>
        <h1>Performance Dashboard</h1>
        <p>
          Semester {student.semester}
        </p>
      </div>

      <div className={styles.sdStats}>
        <div className={styles.sdStat}>
          <div className={styles.sdStatContent}>
            <div className={styles.sdStatIcon}>
              <FiBook size={24} color="#197ee9" />
            </div>
            <div className={styles.sdStatText}>
              <h2>{performance.length}</h2>
              <p>Subjects</p>
            </div>
          </div>
        </div>

        <div className={styles.sdStat}>
          <div className={styles.sdStatContent}>
            <div className={styles.sdStatIcon}>
              <FiCalendar size={24} color="#197ee9" />
            </div>
            <div className={styles.sdStatText}>
              <h2>{avgAttendancePct}%</h2>
              <p>Avg Attendance</p>
            </div>
          </div>
        </div>

        <div className={styles.sdStat}>
          <div className={styles.sdStatContent}>
            <div className={styles.sdStatIcon}>
              <FiTrendingUp size={24} color="#197ee9" />
            </div>
            <div className={styles.sdStatText}>
              <h2>{avgInternalPct}%</h2>
              <p>Avg Internal</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
