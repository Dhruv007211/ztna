import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity, Clock } from "lucide-react";

// OS detection function
function getOS(): string {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Win/.test(ua)) return "Windows";
  if (/Mac/.test(ua)) return "MacOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

export default function LoginActivity() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const os = getOS(); // Detect OS
    const deviceName = navigator.platform || "Unknown";
    const browserName = navigator.userAgent || "Unknown";
    const loginTime = new Date().toISOString();

    // Insert login activity into Supabase
    supabase.from("login_logs").insert({
      user_id: user.id,
      ip_address: "0.0.0.0", // optionally backend can provide real IP
      device: deviceName,
      browser: browserName,
      operating_system: os,
      login_status: "success",
      login_time: loginTime,
      risk_score: 0,
    });

    // Fetch all login logs for this user
    supabase
      .from("login_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("login_time", { ascending: false })
      .then(({ data }) => setLogs(data || []));
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold animate-fade-in-up">Login Activity</h2>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in-up stagger-1">
            Complete history of all authentication events
          </p>
        </div>

        <div className="card-cyber overflow-hidden animate-fade-in-up stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Time</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">IP Address</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Device</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Browser</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">OS</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      No login activity recorded
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">{new Date(log.login_time).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-xs">{log.ip_address}</td>
                      <td className="py-3 px-4 text-xs max-w-[200px] truncate">{log.device}</td>
                      <td className="py-3 px-4 text-xs">{log.browser}</td>
                      <td className="py-3 px-4 text-xs">{log.operating_system}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            log.login_status === "success"
                              ? "bg-primary/10 text-success"
                              : "bg-destructive/10 text-danger"
                          }`}
                        >
                          {log.login_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                log.risk_score < 30 ? "bg-success" : log.risk_score < 60 ? "bg-warning" : "bg-danger"
                              }`}
                              style={{ width: `${Math.min(log.risk_score, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold tabular-nums">{log.risk_score}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}