import { useEffect, useRef, useState } from "react";

const InAppNotifications = ({ message, error }) => {
  const [notifications, setNotifications] = useState([]);
  const timerRef = useRef({});
  const recentRef = useRef({ key: "", time: 0 });

  const hideToast = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, toastVisible: false }
          : notification
      )
    );

    if (timerRef.current[id]) {
      clearTimeout(timerRef.current[id]);
      delete timerRef.current[id];
    }
  };

  const removeNotification = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id)
    );

    if (timerRef.current[id]) {
      clearTimeout(timerRef.current[id]);
      delete timerRef.current[id];
    }
  };

  const addNotification = (type, text) => {
    const cleanText = String(text || "").trim();

    if (!cleanText) {
      return;
    }

    const now = Date.now();
    const duplicateKey = `${type}-${cleanText}`;

    if (
      recentRef.current.key === duplicateKey &&
      now - recentRef.current.time < 800
    ) {
      return;
    }

    recentRef.current = {
      key: duplicateKey,
      time: now,
    };

    const id = `${now}-${Math.random().toString(16).slice(2)}`;

    const notification = {
      id,
      type,
      text: cleanText,
      toastVisible: true,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setNotifications((currentNotifications) =>
      [notification, ...currentNotifications].slice(0, 10)
    );

    timerRef.current[id] = setTimeout(() => {
      hideToast(id);
    }, 5000);
  };

  useEffect(() => {
    if (message) {
      addNotification("success", message);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      addNotification("error", error);
    }
  }, [error]);

  const visibleToasts = notifications.filter(
    (notification) => notification.toastVisible
  );

  return (
    <>
      <aside className="notification-history-panel">
        <div className="notification-history-header">
          <div>
            <span>Notifications</span>
            <strong>{notifications.length}/10</strong>
          </div>
        </div>

        {notifications.length === 0 ? (
          <p className="notification-empty">No notifications yet.</p>
        ) : (
          <div className="notification-history-list">
            {notifications.map((notification) => (
              <div
                className={`notification-history-item ${notification.type}`}
                key={notification.id}
              >
                <div>
                  <strong>
                    {notification.type === "error" ? "Error" : "Success"}
                  </strong>
                  <p>{notification.text}</p>
                  <small>{notification.createdAt}</small>
                </div>

                <button
                  type="button"
                  onClick={() => removeNotification(notification.id)}
                  aria-label="Remove notification"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>

      <div className="notification-toast-stack">
        {visibleToasts.map((notification) => (
          <div
            className={`notification-toast ${notification.type}`}
            key={notification.id}
          >
            <div>
              <strong>
                {notification.type === "error" ? "Action failed" : "Done"}
              </strong>
              <p>{notification.text}</p>
            </div>

            <button
              type="button"
              onClick={() => hideToast(notification.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default InAppNotifications;
