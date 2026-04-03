import { createContext, useContext, useState, useEffect } from "react";

export type DeviceType = "pc" | "tablet" | "mobile" | null;

interface DeviceContextValue {
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
}

const DeviceContext = createContext<DeviceContextValue>({
  device: null,
  setDevice: () => {},
});

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDeviceState] = useState<DeviceType>(() => {
    const stored = localStorage.getItem("choir-device");
    if (stored === "pc" || stored === "tablet" || stored === "mobile") return stored;
    return null;
  });

  const setDevice = (d: DeviceType) => {
    if (d) localStorage.setItem("choir-device", d);
    else localStorage.removeItem("choir-device");
    setDeviceState(d);
  };

  useEffect(() => {
    const stored = localStorage.getItem("choir-device");
    if (stored === "pc" || stored === "tablet" || stored === "mobile") {
      setDeviceState(stored);
    }
  }, []);

  return (
    <DeviceContext.Provider value={{ device, setDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
