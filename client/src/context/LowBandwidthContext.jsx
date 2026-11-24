import React, { createContext, useContext, useState, useEffect } from 'react';

const LowBandwidthContext = createContext(null);

export const LowBandwidthProvider = ({ children }) => {
  const [isLowBandwidth, setIsLowBandwidth] = useState(() => {
    return localStorage.getItem('rural_low_bandwidth_mode') === 'true';
  });

  const [totalBytesTransferred, setTotalBytesTransferred] = useState(0);
  const [networkQuality, setNetworkQuality] = useState('2G/3G Hotspot');

  useEffect(() => {
    localStorage.setItem('rural_low_bandwidth_mode', isLowBandwidth);
  }, [isLowBandwidth]);

  useEffect(() => {
    const handleMetric = (event) => {
      if (event.detail && event.detail.bytes) {
        setTotalBytesTransferred(prev => prev + event.detail.bytes);
      }
    };

    window.addEventListener('rural-bandwidth-metric', handleMetric);
    return () => window.removeEventListener('rural-bandwidth-metric', handleMetric);
  }, []);

  const toggleLowBandwidth = () => {
    setIsLowBandwidth(prev => !prev);
  };

  const formattedDataUsage = totalBytesTransferred > 1024 * 1024
    ? `${(totalBytesTransferred / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalBytesTransferred / 1024).toFixed(1)} KB`;

  return (
    <LowBandwidthContext.Provider
      value={{
        isLowBandwidth,
        toggleLowBandwidth,
        totalBytesTransferred,
        formattedDataUsage,
        networkQuality,
        setNetworkQuality
      }}
    >
      {children}
    </LowBandwidthContext.Provider>
  );
};

export const useLowBandwidth = () => {
  const context = useContext(LowBandwidthContext);
  if (!context) {
    throw new Error('useLowBandwidth must be used within LowBandwidthProvider');
  }
  return context;
};
