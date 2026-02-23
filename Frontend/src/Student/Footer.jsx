import { useState } from "react";
import styles from "./StudentDashboard.module.css";

export default function Footer() {
  const [popupContent, setPopupContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div>
      <footer className={styles.sdFooter}>
        <div className={styles.footerContent}>
          <div className={styles.footerLine}>© {new Date().getFullYear()} IMES</div>
          <div className={styles.footerLine}>
            <span>Designed with ❤️ for students by</span>
            <span>
              <a
                href="https://sewak07.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sewak Dhakal
              </a>{" "}
              and{" "}
              <a
                href="https://nischal-portfolio.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nischal Dahal
              </a>
            </span>
          </div>

          <div className={styles.footerLine}>
            <button
              className={styles.footerLink}
              onClick={() => {
                setPopupContent("about");
                setShowPopup(true);
              }}
            >
              About Us
            </button>

            <button
              className={styles.footerLink}
              onClick={() => {
                setPopupContent("privacy");
                setShowPopup(true);
              }}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {
        showPopup && (
          <div className={styles.infoModalOverlay}>
            <div className={styles.infoModal}>
              {popupContent === "about" && (
                <div className="about-us">
                  <h2>About Us</h2>
                  <p>
                    Welcome to <strong>IMES</strong>, a streamlined solution for internal marks evaluation and academic performance tracking. Our platform bridges the gap between administration, teachers, and students, making academic management smooth and transparent.
                  </p>

                  <h3>For Admins</h3>
                  <p>
                    Effortlessly manage teachers and students with full CRUD (Create, Read, Update, Delete) capabilities, ensuring accurate and up-to-date records.
                  </p>

                  <h3>For Teachers</h3>
                  <p>
                    Simplify your workload by taking attendance and submitting internal assessment marks in a few clicks, keeping your classroom organized and efficient.
                  </p>

                  <h3>For Students</h3>
                  <p>
                    Track your academic progress in real-time. View attendance, assignment scores, and internal assessments, gaining insights into your performance and growth.
                  </p>

                  <p>
                    At <strong>IMES</strong>, we believe that effective evaluation and clear communication pave the way for academic excellence. Our mission is to provide a seamless experience that empowers educators and students alike.
                  </p>
                </div>
              )}


              {popupContent === "privacy" && (
                <div className="privacy-policy">
                  <h2>Privacy Policy</h2>
                  <p>
                    At <strong>IMES</strong>, we respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard the data of our users.
                  </p>

                  <h3>Information We Collect</h3>
                  <p>
                    We collect information such as student and teacher details, attendance records, and internal assessment marks. This information is necessary to provide and improve our services.
                  </p>

                  <h3>How We Use Your Data</h3>
                  <p>
                    The data collected is used solely for academic management purposes, including performance tracking, attendance monitoring, and report generation. We do not share personal information with unauthorized third parties.
                  </p>

                  <h3>Data Security</h3>
                  <p>
                    We implement strict security measures to protect all sensitive information from unauthorized access, alteration, or disclosure.
                  </p>

                  <h3>Student and Teacher Rights</h3>
                  <p>
                    Users have the right to access, update, or request deletion of their personal information. Please contact the admin for any privacy-related concerns.
                  </p>

                  <p>
                    By using <strong>IMES</strong>, you consent to the practices described in this Privacy Policy. We are committed to maintaining the trust and security of our users.
                  </p>
                </div>
              )}


              <div className={styles.infoModalActions}>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setPopupContent("");
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }


    </div>
  )
}