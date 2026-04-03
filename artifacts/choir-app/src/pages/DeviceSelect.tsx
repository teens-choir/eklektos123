import { useLocation } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Monitor, Tablet, Smartphone, Music } from "lucide-react";
import { useDevice, type DeviceType } from "@/lib/device";

const devices: { type: DeviceType; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    type: "pc",
    icon: <Monitor size={40} />,
    label: "PC",
    desc: "Full sidebar, wide layout, maximum information density",
  },
  {
    type: "tablet",
    icon: <Tablet size={40} />,
    label: "Tablet",
    desc: "Larger touch targets, collapsible sidebar, balanced layout",
  },
  {
    type: "mobile",
    icon: <Smartphone size={40} />,
    label: "Mobile",
    desc: "Bottom navigation, compact view, easy thumb access",
  },
];

export default function DeviceSelect() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser();
  const { setDevice } = useDevice();

  const handleSelect = (type: DeviceType) => {
    setDevice(type);
    if (user?.role === "admin") {
      setLocation("/admin/dashboard");
    } else {
      setLocation("/member/home");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden theme-normal">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 blur-[150px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-3xl">
        <div className="flex flex-col items-center mb-12">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-border">
            <Music className="text-primary w-7 h-7 glow-text" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase glow-text text-center mb-2">
            Choose Your Device
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest text-center uppercase">
            Select how you're accessing the system — layout adjusts to fit perfectly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {devices.map(({ type, icon, label, desc }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="glass-panel group flex flex-col items-center gap-5 p-8 rounded-2xl border border-white/10 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 hover:scale-[1.03] cursor-pointer text-center glow-border-hover"
            >
              <div className="w-20 h-20 rounded-2xl bg-black/40 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:glow-text transition-all duration-200">
                {icon}
              </div>
              <div>
                <div className="text-xl font-bold tracking-widest uppercase text-white group-hover:text-primary transition-colors mb-2">
                  {label}
                </div>
                <div className="text-xs text-muted-foreground tracking-wide leading-relaxed">
                  {desc}
                </div>
              </div>
              <div className="w-full h-0.5 bg-primary/0 group-hover:bg-primary/40 transition-all duration-300 rounded-full" />
            </button>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-xs tracking-widest mt-8 uppercase">
          You can change this anytime from your profile settings
        </p>
      </div>
    </div>
  );
}
