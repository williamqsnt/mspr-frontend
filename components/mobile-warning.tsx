'use client';

import React, { useEffect, useState } from 'react';

const MobileWarning: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); 

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">L'application web n'est disponible qu'au format mobile pour le moment</h1>
          <p className="text-gray-600">Veuillez accéder à cette application depuis un format mobile.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileWarning;
