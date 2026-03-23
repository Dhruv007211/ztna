import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, CheckCircle, Shield, Clock } from "lucide-react";

export default function SecurityAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("security_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAlerts(data || []));
  }, [user]);

  const resolveAlert = async (id: string) => {
    await supabase.from("security_alerts").update({ is_resolved: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_resolved: true } : a)));
  };

  const severityStyles: Record<string, string> = {
    low: "border-l-info text-info",
    medium: "border-l-warning text-warning",
    high: "border-l-danger text-danger",
    critical: "border-l-danger text-danger",
  };

  const severityIcons: Record<string, typeof Shield> = {
    low: Shield,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: AlertTriangle,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold animate-fade-in-up">Security Alerts</h2>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in-up stagger-1">
            Threats and anomalies detected across your sessions
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="card-cyber p-12 text-center animate-fade-in-up stagger-2">
            <Shield className="w-8 h-8 text-success mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No security alerts</p>
            <p className="text-xs text-muted-foreground mt-1">Your account is secure</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const Icon = severityIcons[alert.severity] || Shield;
              const style = severityStyles[alert.severity] || severityStyles.low;

              return (
                <div
                  key={alert.id}
                  className={`card-cyber border-l-4 p-4 flex items-start gap-4 animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${style} ${
                    alert.is_resolved ? "opacity-50" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground capitalize">{alert.alert_type.replace(/_/g, " ")}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${style} bg-current/10`}>
                        {alert.severity}
                      </span>
                      {alert.is_resolved && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-success bg-success/10">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!alert.is_resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-success transition-colors px-2 py-1 rounded border border-border hover:border-success/30"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Resolve
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
