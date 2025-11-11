import React, { useEffect, useState } from "react";
import axios from "axios";
import authService from "../../services/authService";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTag,
  FaRegClock,
  FaTrash,
  FaEnvelopeOpen,
} from "react-icons/fa";

const ToggleSwitch = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-700">{label}</span>
    <label
      htmlFor={id}
      className="relative inline-flex items-center cursor-pointer"
    >
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
    </label>
  </div>
);

const NotificationItem = ({
  id,
  icon,
  text,
  time,
  colorClass,
  read,
  onMarkRead,
  onDelete,
}: {
  id: number;
  icon: React.ReactNode;
  text: string;
  time: string;
  colorClass: string;
  read: boolean;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}) => (
  <div className={`p-4 rounded-lg flex items-start gap-4 ${colorClass}`}>
    <div className="text-xl mt-1">{icon}</div>
    <div className="flex-1">
      <p className={`${read ? "opacity-70 line-through" : ""}`}>{text}</p>
      <p className="text-sm opacity-75">{time}</p>
    </div>
    <div className="flex items-center gap-2">
      {!read && (
        <button
          onClick={() => onMarkRead(id)}
          className="text-sm text-green-600 hover:underline flex items-center gap-2"
        >
          <FaEnvelopeOpen /> <span>Mark read</span>
        </button>
      )}
      <button
        onClick={() => onDelete(id)}
        className="text-sm text-red-600 hover:underline flex items-center gap-2"
      >
        <FaTrash /> <span>Delete</span>
      </button>
    </div>
  </div>
);

const Notifications = () => {
  const [prefs, setPrefs] = useState({
    serviceUpdates: true,
    appointmentReminders: true,
    specialOffers: false,
  });

  type Notification = {
    id: number;
    text: string;
    time: string;
    read: boolean;
    type?: string;
    customerId?: number;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = authService.getStoredToken();
        const base =
          import.meta.env.VITE_NOTIFICATION_API_URL || "http://127.0.0.1:8085";
        const res = await axios.get(`${base}/api/notifications/me`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        // Extract data from ApiResponse wrapper
        const response = res.data;
        const data = response?.data?.content || response?.data || [];
        
        // Map backend Notification -> local Notification shape
        const mapped = (Array.isArray(data) ? data : []).map(
          (n) =>
            ({
              id: n.id,
              text: n.message || n.text || "",
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleString()
                : n.time || "",
              read: !!n.isRead,
              type: n.type,
              customerId: n.customerId,
            } as Notification)
        );

        setNotifications(mapped || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number, customerId?: number) => {
    try {
      const base = import.meta.env.VITE_CUSTOMER_API || "http://127.0.0.1:8082";
      const token = authService.getStoredToken();
      if (!customerId) return;
      await axios.put(
        `${base}/api/customers/${customerId}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const base = import.meta.env.VITE_CUSTOMER_API || "http://127.0.0.1:8082";
      const token = authService.getStoredToken();
      const unread = notifications.filter((n) => !n.read && n.customerId);
      await Promise.all(
        unread.map((n) =>
          axios.put(
            `${base}/api/customers/${n.customerId}/notifications/${n.id}/read`,
            {},
            {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }
          )
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id: number, customerId?: number) => {
    try {
      const base = import.meta.env.VITE_CUSTOMER_API || "http://127.0.0.1:8082";
      const token = authService.getStoredToken();
      if (!customerId) return;
      await axios.delete(
        `${base}/api/customers/${customerId}/notifications/${id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const iconFor = (n: Notification) => {
    switch (n.type) {
      case "reminder":
      case "APPOINTMENT_REMINDER":
        return <FaExclamationTriangle />;
      case "completed":
      case "SERVICE_COMPLETED":
        return <FaCheckCircle />;
      case "offer":
      case "PROMOTION":
        return <FaTag />;
      case "VEHICLE_ADDED":
        return <FaCheckCircle />;
      default:
        return <FaRegClock />;
    }
  };

  const colorFor = (n: Notification) =>
    n.read ? "bg-gray-50 text-gray-600" : "bg-white";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-sm text-red-500 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading notifications...</p>
      ) : (
        <div className="space-y-3 mb-8">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                id={n.id}
                icon={iconFor(n)}
                text={n.text}
                time={n.time}
                colorClass={colorFor(n)}
                read={n.read}
                onMarkRead={(id) => markAsRead(id, n.customerId)}
                onDelete={(id) => deleteNotification(id, n.customerId)}
              />
            ))
          )}
        </div>
      )}

      <div className="text-center mb-8">
        <button className="text-sm text-red-500 font-semibold hover:underline">
          View All Notifications
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4 max-w-sm">
          <ToggleSwitch
            id="service-updates"
            label="Service Updates"
            checked={prefs.serviceUpdates}
            onChange={(c) => setPrefs((p) => ({ ...p, serviceUpdates: c }))}
          />
          <ToggleSwitch
            id="appointment-reminders"
            label="Appointment Reminders"
            checked={prefs.appointmentReminders}
            onChange={(c) =>
              setPrefs((p) => ({ ...p, appointmentReminders: c }))
            }
          />
          <ToggleSwitch
            id="special-offers"
            label="Special Offers"
            checked={prefs.specialOffers}
            onChange={(c) => setPrefs((p) => ({ ...p, specialOffers: c }))}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
