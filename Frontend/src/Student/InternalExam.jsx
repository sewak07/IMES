import styles from "./StudentDashboard.module.css";

export default function InternalExam({ performance }) {
  return (
    <div>
      <h2 className={styles.sdSectionTitle}>Internal Examination Result</h2>
      <div className={styles.sdSubjects}>
        {performance.map((s, i) => {
          const internalMark = s.marks?.rawInternal ?? 0;
          const midTermMark = s.marks?.rawMidTerm ?? 0;

          return (
            <div
              className={`${styles.sdCard} ${!s.isQualified ? styles.nqCard : ""}`}
              key={`internal-${i}`}
            >
              <div className={styles.sdCardHeader}>
                <h3>{s.subject}</h3>
                {!s.isQualified && <span className={styles.nqBadge}>NQ</span>}
              </div>

              <div className={styles.sdCardBody}>
                <div className={styles.sdBlock}>
                  <div className={styles.sdRow}>
                    <span
                      style={{
                        color: internalMark >= 24 ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      1st Term
                    </span>
                    <span
                      style={{
                        color: internalMark >= 24 ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      {internalMark} / 60
                    </span>
                  </div>

                  <div className={styles.sdRow}>
                    <span
                      style={{
                        color: midTermMark >= 24 ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      Mid Term
                    </span>
                    <span
                      style={{
                        color: midTermMark >= 24 ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      {midTermMark} / 60
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
