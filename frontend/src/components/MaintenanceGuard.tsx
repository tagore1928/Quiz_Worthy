import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Loader } from './Loader';

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    // Listen for site status in system/settings
    const unsub = onSnapshot(
      doc(db, 'system', 'settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Admin panel writes `maintenanceMode`; `isMaintenanceMode` is the legacy field name
          setIsMaintenance(!!(data.maintenanceMode ?? data.isMaintenanceMode));
        } else {
          setIsMaintenance(false);
        }
        setChecking(false);
      },
      (error) => {
        console.warn('System settings listener error (falling back to normal operational state):', error);
        setIsMaintenance(false);
        setChecking(false);
      }
    );

    return unsub;
  }, []);

  if (loading || checking) {
    return (
      <Loader />
    );
  }

  const isAdmin = userProfile?.role === 'admin';
  const isMaintenancePage = location.pathname === '/maintenance';

  // If maintenance mode is active, user is NOT admin, and not on /maintenance -> redirect to /maintenance
  if (isMaintenance && !isAdmin && !isMaintenancePage) {
    return <Navigate to="/maintenance" replace />;
  }

  // If NOT in maintenance mode and user tries to access /maintenance -> redirect to /
  if (!isMaintenance && isMaintenancePage) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
