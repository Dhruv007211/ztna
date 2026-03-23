import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { getDeviceInfo, getPublicIP } from "@/lib/device-info";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);

        // Log failed attempt
        const device = getDeviceInfo();
        const ip = await getPublicIP();
        // We can't log without a user_id for failed login of unknown user
        setLoading(false);
        return;
      }

      if (data.user) {
        // Record login info
        const device = getDeviceInfo();
        const ip = await getPublicIP();

        // Calculate simple risk score
        const { data: existingDevices } = await supabase
          .from("devices")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("device_fingerprint", device.fingerprint);

        let riskScore = 0;
        if (!existingDevices || existingDevices.length === 0) {
          riskScore += 40; // New device
        }

        // Check previous logins for location changes
        const { data: prevLogs } = await supabase
          .from("login_logs")
          .select("ip_address")
          .eq("user_id", data.user.id)
          .order("login_time", { ascending: false })
          .limit(1);

        if (prevLogs && prevLogs.length > 0 && prevLogs[0].ip_address !== ip) {
          riskScore += 30; // New location
        }

        // Insert login log
        await supabase.from("login_logs").insert({
          user_id: data.user.id,
          ip_address: ip,
          device: device.deviceName,
          browser: device.browser,
          operating_system: device.os,
          login_status: "success",
          risk_score: riskScore,
        });

        // Upsert device
        if (existingDevices && existingDevices.length > 0) {
          await supabase
            .from("devices")
            .update({
              login_count: existingDevices[0].login_count + 1,
              last_login_time: new Date().toISOString(),
            })
            .eq("id", existingDevices[0].id);
        } else {
          await supabase.from("devices").insert({
            user_id: data.user.id,
            device_name: device.deviceName,
            browser: device.browser,
            operating_system: device.os,
            device_fingerprint: device.fingerprint,
          });

          // Create security alert for new device
          await supabase.from("security_alerts").insert({
            user_id: data.user.id,
            alert_type: "new_device",
            description: `New device detected: ${device.deviceName}`,
            severity: riskScore > 50 ? "high" : "medium",
          });
        }

        navigate("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 scan-line pointer-events-none opacity-30" />

      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">ZTNA</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your security dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="card-cyber p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
