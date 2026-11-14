import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Package, 
  Gamepad2, 
  Landmark, 
  Cpu, 
  Terminal, 
  Sparkles,
  Send,
  Timer,
  CheckSquare,
  Activity,
  Globe2
} from "lucide-react";
import WorkspaceUniverseTab from "./pages/WorkspaceUniverseTab";
import ProductsTab from "./pages/ProductsTab";
import MahdiaTab from "./pages/MahdiaTab";
import GameTab from "./pages/GameTab";
import PomodoroTab from "./pages/PomodoroTab";
import TasksTab from "./pages/TasksTab";
import DiagnosticsTab from "./pages/DiagnosticsTab";
import { updateAppIcon } from "./appIcon";
import "./App.css";

interface SystemStats {
  os_name: string;
  arch: string;
  timestamp: number;
  app_version: string;
  status: string;
  total_projects: number;
}

export function App() {
  const [activeTab, setActiveTab] = useState<
    "universe" | "products" | "game" | "mahdia" | "pomodoro" | "tasks" | "diagnostics" | "system"
  >("universe");
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    invoke<SystemStats>("get_system_stats")
      .then((res) => setStats(res))
      .catch((err) => console.error("Error fetching system stats:", err));
  }, []);

  useEffect(() => {
    updateAppIcon(activeTab);
  }, [activeTab]);

  async function handleGreet(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await invoke<string>("greet", { name });
      setGreetMsg(response);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="desktop-app">
      {/* Universal Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">أ</div>
          <div>
            <div className="brand-title">Alif Desktop</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Master All-in-One Suite</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === "universe" ? "active" : ""}`}
            onClick={() => setActiveTab("universe")}
          >
            <Globe2 size={17} />
            Alif Universe (294)
          </button>

          <button 
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={17} />
            Products & Inventory
          </button>

          <button 
            className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            <CheckSquare size={17} />
            Tasks & Workflow
          </button>

          <button 
            className={`nav-item ${activeTab === "pomodoro" ? "active" : ""}`}
            onClick={() => setActiveTab("pomodoro")}
          >
            <Timer size={17} />
            Pomodoro Focus
          </button>

          <button 
            className={`nav-item ${activeTab === "game" ? "active" : ""}`}
            onClick={() => setActiveTab("game")}
          >
            <Gamepad2 size={17} />
            Banjoui Arcade
          </button>

          <button 
            className={`nav-item ${activeTab === "mahdia" ? "active" : ""}`}
            onClick={() => setActiveTab("mahdia")}
          >
            <Landmark size={17} />
            Mahdia Heritage
          </button>

          <button 
            className={`nav-item ${activeTab === "diagnostics" ? "active" : ""}`}
            onClick={() => setActiveTab("diagnostics")}
          >
            <Activity size={17} />
            Cloud Diagnostics
          </button>

          <button 
            className={`nav-item ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <Cpu size={17} />
            Rust Engine & IPC
          </button>
        </nav>

        <div className="sidebar-footer">
          <div>
            <div style={{ color: "#94a3b8", fontSize: "11px" }}>Workspace Hub</div>
            <div style={{ color: "#38bdf8", fontWeight: 600 }}>Tauri v2 + Rust Native</div>
          </div>
        </div>
      </aside>

      {/* Main App Workspace */}
      <main className="main-content">
        <div className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "14px" }}>
              {activeTab === "universe" && "Alif Universe Master Project Browser (294 Projects)"}
              {activeTab === "products" && "Alpalin Enterprise Manager"}
              {activeTab === "tasks" && "Tasks & Deliverables Planner"}
              {activeTab === "pomodoro" && "Deep Work Pomodoro Timer"}
              {activeTab === "game" && "Banjoui Action Rhythm Game"}
              {activeTab === "mahdia" && "Mahdia Cultural Heritage Explorer"}
              {activeTab === "diagnostics" && "Edge Ping & Diagnostics Console"}
              {activeTab === "system" && "Rust System Diagnostic"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="status-pill">
              <span className="dot"></span>
              Rust IPC Active
            </div>
          </div>
        </div>

        <div className="content-body">
          {activeTab === "universe" && <WorkspaceUniverseTab />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "tasks" && <TasksTab />}
          {activeTab === "pomodoro" && <PomodoroTab />}
          {activeTab === "game" && <GameTab />}
          {activeTab === "mahdia" && <MahdiaTab />}
          {activeTab === "diagnostics" && <DiagnosticsTab />}
          {activeTab === "system" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="hero-banner">
                <h2>Native Rust & System Diagnostics</h2>
                <p>
                  Zero-overhead native execution powered by the Tauri v2 Rust runtime and memory-safe IPC bridge.
                </p>
              </div>

              <div className="cards-grid">
                <div className="card">
                  <span className="card-title">Architecture</span>
                  <span className="card-value">
                    {stats?.arch?.toUpperCase() || "X86_64"} / {stats?.os_name || "Windows"}
                  </span>
                </div>

                <div className="card">
                  <span className="card-title">Indexed Projects</span>
                  <span className="card-value" style={{ color: "#38bdf8" }}>
                    {stats?.total_projects || 294} Projects
                  </span>
                </div>

                <div className="card">
                  <span className="card-title">Core Version</span>
                  <span className="card-value" style={{ color: "#818cf8" }}>
                    v{stats?.app_version || "1.0.0"}
                  </span>
                </div>
              </div>

              <div className="interactive-panel">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Terminal size={18} color="#38bdf8" />
                  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Rust Command Invocation</h3>
                </div>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Send commands to the native Rust backend via Tauri IPC channel:
                </p>

                <form className="greet-form" onSubmit={handleGreet}>
                  <input
                    className="greet-input"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter command or parameter..."
                  />
                  <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Send size={15} />
                    Send IPC
                  </button>
                </form>

                {greetMsg && (
                  <div className="greet-message">
                    <Sparkles size={16} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                    {greetMsg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
