"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showToast } = useToast();

  const addNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      showToast(message, type);
    },
    [showToast],
  );

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotificationContext must be used within NotificationProvider",
    );
  return context;
};
