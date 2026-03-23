import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Shield, Monitor, Activity, AlertTriangle, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ logins: 0, devices: 0, alerts: 0, avgRisk: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [logsRes, devicesRes, alertsRes] = await Promise.all([
        supabase.from("login_logs").select("*").eq("user_id", user.id).order("login_time", { ascending: false }),
        supabase.from("devices").select("*").eq("user_id", user.id),
        supabase.from("security_alerts").select("*").eq("user_id", user.id).eq("is_resolved", false),
      ]);

      const logs = logsRes.data || [];
      const devices = devicesRes.data || [];
      const alerts = alertsRes.data || [];

      const avgRisk = logs.length ? Math.round(logs.reduce((a, l) => a + l.risk_score, 0) / logs.length) : 0;

      setStats({
        logins: logs.length,
        devices: devices.length,
        alerts: alerts.length,
        avgRisk,
      });

      setRecentLogs(logs.slice(0, 5));

      // Build chart data from last 7 days
      const days: Record<string, { logins: number; risk: number; count: number }> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        days[key] = { logins: 0, risk: 0, count: 0 };
      }

      logs.forEach((l) => {
        const key = new Date(l.login_time).toLocaleDateString("en-US", { weekday: "short" });
        if (days[key]) {
          days[key].logins++;
          days[key].risk += l.risk_score;
          days[key].count++;
        }
      });

      setChartData(Object.entries(days).map(([day, v]) => ({ day, logins: v.logins })));
      setRiskData(Object.entries(days).map(([day, v]) => ({ day, risk: v.count ? Math.round(v.risk / v.count) : 0 })));
    };

    fetchData();
  }, [user]);

  const riskColor = stats.avgRisk < 30 ? "text-success" : stats.avgRisk < 60 ? "text-warning" : "text-danger";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold animate-fade-in-up">Security Overview</h2>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in-up stagger-1">
            Real-time monitoring of your network access
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Logins" value={stats.logins} icon={Activity} variant="default" />
          <StatCard title="Active Devices" value={stats.devices} icon={Monitor} variant="success" />
          <StatCard title="Open Alerts" value={stats.alerts} icon={AlertTriangle} variant={stats.alerts > 0 ? "warning" : "success"} />
          <StatCard title="Avg Risk Score" value={stats.avgRisk} icon={Shield} variant={stats.avgRisk > 50 ? "danger" : "success"} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-cyber p-5 animate-fade-in-up stagger-2">
            <h3 className="text-sm font-semibold mb-4">Login Activity (7 days)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(162 72% 46%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(162 72% 46%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(215 12% 52%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 12% 52%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(220 18% 10%)", border: "1px solid hsl(220 16% 18%)", borderRadius: "8px", fontSize: 12 }}
                    labelStyle={{ color: "hsl(210 20% 92%)" }}
                  />
                  <Area type="monotone" dataKey="logins" stroke="hsl(162 72% 46%)" fill="url(#loginGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-cyber p-5 animate-fade-in-up stagger-3">
            <h3 className="text-sm font-semibold mb-4">Risk Score Trend</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(215 12% 52%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 12% 52%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(220 18% 10%)", border: "1px solid hsl(220 16% 18%)", borderRadius: "8px", fontSize: 12 }}
                    labelStyle={{ color: "hsl(210 20% 92%)" }}
                  />
                  <Bar dataKey="risk" fill="hsl(200 80% 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Logins */}
        <div className="card-cyber p-5 animate-fade-in-up stagger-4">
          <h3 className="text-sm font-semibold mb-4">Recent Login Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Time</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">IP Address</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Device</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" />
                      No login activity yet
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs">{new Date(log.login_time).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-xs">{log.ip_address}</td>
                      <td className="py-2.5 px-3 text-xs">{log.device}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs font-medium ${log.login_status === "success" ? "text-success" : "text-danger"}`}>
                          {log.login_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-xs font-mono font-bold ${
                            log.risk_score < 30 ? "text-success" : log.risk_score < 60 ? "text-warning" : "text-danger"
                          }`}
                        >
                          {log.risk_score}
                        </span>
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
