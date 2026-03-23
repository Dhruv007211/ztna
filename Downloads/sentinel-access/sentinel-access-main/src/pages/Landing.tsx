import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Fingerprint, ArrowRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Landing() {
  const { user } = useAuth();

  const features = [
    { icon: Lock, title: "Zero Trust Architecture", desc: "Never trust, always verify. Every access request is fully authenticated and authorized." },
    { icon: Eye, title: "Real-Time Monitoring", desc: "Continuous monitoring of all login attempts, devices, and network anomalies." },
    { icon: Fingerprint, title: "Device Fingerprinting", desc: "Track and verify devices with browser, OS, and behavioral fingerprinting." },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 h-16 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">ZTNA Security</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary glow-pulse" />
            Zero Trust Security Active
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight animate-fade-in-up stagger-1" style={{ textWrap: "balance" }}>
          Secure Every Access
          <br />
          <span className="text-gradient-cyber">Point in Real Time</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up stagger-2" style={{ textWrap: "pretty" }}>
          Enterprise-grade Zero Trust Network Access with real-time risk scoring, device fingerprinting, and adaptive authentication.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10 animate-fade-in-up stagger-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity active:scale-[0.97] border-glow"
          >
            Start Monitoring <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors active:scale-[0.97]"
          >
            Learn More <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className={`card-cyber p-6 animate-fade-in-up stagger-${i + 1}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center">
<p className="text-xs text-muted-foreground">© Dhruv , Durlabh & Ayush – ZTNA Security System</p>
      </footer>
    </div>
  );
}
