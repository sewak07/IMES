import styles from "./StudentDashboard.module.css";

export default function InternalAssessment({ performance }) {
  const getPercentage = (value, max) => (max ? Math.round((value / max) * 100) : 0);

 
  const getBarColor = (percentage) => {
    if (percentage >= 80) return "#16a34a"; 
    if (percentage >= 50) return "#facc15"; 
    return "#dc2626";
  };

  return (
    <div>
      <h2 className={styles.sdSectionTitle}>Subject-wise Internal Assessment Marks</h2>
      <div className={styles.sdSubjects}>
        {performance.map((s, i) => (
          <div
            className={`${styles.sdCard} ${!s.isQualified ? styles.nqCard : ""}`}
            key={i}
          >
            {/* Card Header */}
            <div className={styles.sdCardHeader}>
              <div>
                <h3>{s.subject}</h3>
              </div>
              <div className={styles.sdCircle}>
                {s.attendance?.totalDays
                  ? Math.round((s.attendance.attendedDays / s.attendance.totalDays) * 100)
                  : 0}
                %<small>Attend.</small>
              </div>
            </div>

            {/* Card Body */}
            <div className={styles.sdCardBody}>
              {/* Attendance */}
              <div className={styles.sdBlock}>
                <strong>Attendance</strong>
                <div
                  style={{
                    fontSize: "small",
                    fontWeight: 600
                  }}
                >
                  <div className={styles.sdRow}>
                    <span>Days</span>
                    <span>
                      {s.attendance?.attendedDays || 0}/{s.attendance?.totalDays || 0}
                    </span>
                  </div>
                  <div className={styles.sdRow}>
                    <span>Marks</span>
                    <span>
                      {s.marks?.attendanceMarks ?? 0}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Exams */}
              <div className={styles.sdBlock}>
                <strong>Exams</strong>
                <div
                  style={{
                    fontSize: "small",
                    fontWeight: 600
                  }}
                >
                  {[
                    { label: "1st Term", value: s.marks?.internal ?? 0, max: 10 },
                    { label: "Mid Term", value: s.marks?.midTerm ?? 0, max: 10 },
                  ].map((exam) => (
                    <div className={styles.sdRow} key={exam.label}>
                      <span style={{ flex: "0 0 70px" }}>{exam.label}</span>
                      <div className={styles.inlineProgressContainer}>
                        <div
                          className={styles.inlineProgressFill}
                          style={{
                            width: `${getPercentage(exam.value, exam.max)}%`,
                            backgroundColor: getBarColor(
                              getPercentage(exam.value, exam.max)
                            ),
                          }}
                        />

                      </div>
                      <span style={{ flex: "0 0 50px", textAlign: "right" }}>
                        {exam.value}/{exam.max}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments */}
              <div className={styles.sdBlock}>
                <strong>Assignments</strong>
                <div
                  style={{
                    fontSize: "small",
                    fontWeight: 600
                  }}
                >
                  {["assignment1", "assignment2", "assignment3"].map((a, idx) => {
                    const max = idx === 2 ? 4 : 3;
                    const val = s.marks?.[a] ?? 0;
                    return (
                      <div className={styles.sdRow} key={a}>
                        <span style={{ flex: "0 0 50px" }}>{`A${idx + 1}`}</span>
                        <div className={styles.inlineProgressContainer}>
                          <div
                            className={styles.inlineProgressFill}
                            style={{
                              width: `${getPercentage(val, max)}%`,
                              backgroundColor: getBarColor(getPercentage(val, max)),
                            }}
                          />
                        </div>
                        <span style={{ flex: "0 0 50px", textAlign: "right" }}>
                          {val}/{max}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className={styles.sdTotal}>
                <span>Total</span>
                <span>
                  {typeof s.totalAssessment === "number"
                    ? `${s.totalAssessment} marks`
                    : "NQ"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
