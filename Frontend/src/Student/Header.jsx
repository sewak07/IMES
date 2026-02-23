import styles from "./StudentDashboard.module.css";

export default function Header({
  student,
  userMenuRef,
  showUserMenu,
  setShowUserMenu,
  showPasswordModal,
  setShowPasswordModal,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  passwordMsg,
  handleChangePassword
}) {
  return (
    <div>
      <div className={styles.sdTopbar}>
        <div
          className={styles.sdLogo}
          onClick={() => window.location.reload()}
          style={{ cursor: "pointer" }}
        >
          🎓 IMES
        </div>

        <div className={styles.sdUser} ref={userMenuRef}>
          <div>
            <strong>{student.username}</strong>
            <br />
            <span>{student.email}</span>
          </div>

          <div
            className={styles.sdAvatar}
            onClick={() => setShowUserMenu((p) => !p)}
          >
            {student.username.charAt(0).toUpperCase()}
          </div>

          {showUserMenu && (
            <div className={styles.userMenu}>
              <button
                onClick={() => {
                  setShowPasswordModal(true);
                  setShowUserMenu(false);
                }}
              >
                🔐 Change Password
              </button>
              <button
                className={styles.logoutBtn}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Change Password</h3>

            <input
              type="password"
              placeholder="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {passwordMsg && <p>{passwordMsg}</p>}

            <div className={styles.modalActions}>
              <button onClick={handleChangePassword}>Update</button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
