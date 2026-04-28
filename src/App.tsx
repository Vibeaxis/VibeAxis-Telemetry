import { useState, useEffect } from 'react'
import './App.css'

function Dial({ label, value, max = 100, unit = "%" }) {
  const radius = 60; // Scaled for 5 dials
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const dashoffset = circumference - (clampedValue / max) * circumference;
  const isDanger = (value / max) > 0.85;

  return (
    <div className="dial-pod">
      <svg className="svg-dial" style={{ width: '160px', height: '160px' }}>
        <circle className="dial-bg" cx="80" cy="80" r={radius} strokeWidth="10" />
        <circle 
          className={`dial-progress ${isDanger ? 'danger' : ''}`} 
          cx="80" cy="80" r={radius} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={dashoffset}
        />
      </svg>
      <div className="dial-value" style={{ top: '80px', fontSize: '2rem' }}>
        {value}<span className="dial-unit" style={{ fontSize: '1rem' }}>{unit}</span>
      </div>
      <div className="dial-label" style={{ fontSize: '1rem' }}>{label}</div>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(window.location.hash);
  const [stats, setStats] = useState({ cpuTemp: 0, cpuLoad: 0, ramUsage: 0, gpuTemp: 0, gpuLoad: 0 });
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);

    if (window.api) {
      window.api.onTelemetry?.((data) => setStats(data));
      window.api.onThemeChange?.((theme) => {
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--bg-color', theme.bg);
        setBgImage(null); 
      });
      window.api.onBgChange?.((base64) => setBgImage(base64));
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ==========================================
  // VIEW 1: THE DASHBOARD WINDOW
  // ==========================================
  if (route === '#dashboard') {
    return (
      <div className="dashboard-container" style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}>
        
        {/* THE GEAR IS BACK - Summons the Settings Window */}
        <button 
          onClick={() => window.api?.openSettings()}
          style={{ position: 'absolute', top: 15, left: 15, background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, WebkitAppRegion: 'no-drag' }}
        >
          ⚙️
        </button>

        <div className="telemetry-row" style={{ gap: '40px' }}>
          <Dial label="CPU TEMP" value={stats.cpuTemp} unit="°C" />
          <Dial label="CPU LOAD" value={stats.cpuLoad} unit="%" />
          <Dial label="RAM USAGE" value={stats.ramUsage} unit="%" />
          <Dial label="GPU TEMP" value={stats.gpuTemp} unit="°C" />
          <Dial label="GPU LOAD" value={stats.gpuLoad} unit="%" />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE CONTROL PANEL WINDOW
  // ==========================================
  const handleSnap = () => window.api?.snapWindow();
  const applyTheme = (primary, bg) => window.api?.sendTheme(primary, bg);
  const handleResolution = (w, h) => window.api?.resizeWindow(w, h);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => window.api?.sendBg(event.target.result);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div style={{ padding: '40px', background: '#020617', height: '100vh', color: 'white', fontFamily: 'Orbitron' }}>
      <h1 style={{ marginBottom: '40px', color: '#0ea5e9' }}>PANEL CONTROL</h1>

      <div className="settings-section">
        <h3>POSITION & SIZE</h3>
        <button className="settings-btn" onClick={handleSnap}>LOCK TO MINI-DISPLAY</button>
        
        {/* THE RESOLUTION BUTTONS ARE BACK */}
        <div style={{ marginTop: '15px' }}>
          <button className="settings-btn" onClick={() => handleResolution(1280, 400)}>1280 x 400</button>
          <button className="settings-btn" onClick={() => handleResolution(1920, 480)}>1920 x 480</button>
          <button className="settings-btn" onClick={() => handleResolution(800, 480)}>800 x 480</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>COLOR THEME</h3>
        <button className="settings-btn" onClick={() => applyTheme('#0ea5e9', '#020617')}>Cyber Blue</button>
        <button className="settings-btn" onClick={() => applyTheme('#d946ef', '#2e1065')}>Neon Purple</button>
        <button className="settings-btn" onClick={() => applyTheme('#22c55e', '#052e16')}>Matrix Green</button>
      </div>

      <div className="settings-section">
        <h3>CUSTOM BACKGROUND</h3>
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: '#94a3b8' }} />
      </div>
    </div>
  );
}

export default App