import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const token = authService.getStoredToken();
      const base = import.meta.env.VITE_NOTIFICATION_API_URL || "http://127.0.0.1:8085";
      
      const res = await axios.get(`${base}/api/notifications/me`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      // Extract data from ApiResponse wrapper
      const response = res.data;
      const data = response?.data?.content || response?.data || [];
      
      // Count unread notifications
      const unread = (Array.isArray(data) ? data : []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notification count", err);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};