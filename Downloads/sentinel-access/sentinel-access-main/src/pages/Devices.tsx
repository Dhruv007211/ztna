import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Monitor, Clock, Globe } from "lucide-react";

export default function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("devices")
      .select("*")
      .eq("user_id", user.id)
      .order("last_login_time", { ascending: false })
      .then(({ data }) => setDevices(data || []));
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold animate-fade-in-up">Registered Devices</h2>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in-up stagger-1">
            All devices that have accessed your account
          </p>
        </div>

        {devices.length === 0 ? (
          <div className="card-cyber p-12 text-center animate-fade-in-up stagger-2">
            <Monitor className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No devices registered yet</p>
            <p className="text-xs text-muted-foreground mt-1">Devices will appear after your first login</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((d, i) => (
              <div key={d.id} className={`card-cyber p-5 animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{d.device_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.browser} · {d.operating_system}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Login count
                    </span>
                    <span className="font-mono font-bold tabular-nums">{d.login_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> First seen
                    </span>
                    <span className="font-mono">{new Date(d.first_login_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Last seen
                    </span>
                    <span className="font-mono">{new Date(d.last_login_time).toLocaleDateString()}</span>
                  </div>
                </div>

                {d.device_fingerprint && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground font-mono">FP: {d.device_fingerprint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
