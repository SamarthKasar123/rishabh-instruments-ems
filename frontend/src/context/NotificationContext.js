import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      console.log('🔒 Not authenticated, skipping notification fetch');
      return;
    }

    try {
      console.log('📡 Fetching notifications...');
      setIsLoading(true);
      const response = await apiService.getAlerts();
      console.log('📊 Raw API response:', response.data);
      
      // Flatten all notification types into a single array
      const allNotifications = [
        ...(response.data.lowStock || []),
        ...(response.data.overdueMaintenance || []),
        ...(response.data.upcomingMaintenance || []),
        ...(response.data.overdueTasks || [])
      ].map(notification => ({
        ...notification,
        id: `${notification.type}_${notification.id}`,
        timestamp: new Date(),
        isRead: false
      }));

      console.log('📱 Processed notifications:', allNotifications);
      console.log('📈 Total notifications:', allNotifications.length);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.length);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return '📦';
      case 'overdue_maintenance':
        return '🔧';
      case 'upcoming_maintenance':
        return '⏰';
      case 'overdue_task':
        return '📋';
      default:
        return '📢';
    }
  };

  // Get notification color based on severity
  const getNotificationColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  // Auto-refresh notifications every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    getNotificationIcon,
    getNotificationColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
