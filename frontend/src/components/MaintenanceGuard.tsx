import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

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
          setIsMaintenance(!!data.isMaintenanceMode);
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
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
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
