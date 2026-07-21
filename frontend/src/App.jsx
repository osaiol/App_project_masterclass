import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, ShieldAlert } from 'lucide-react';
import PublicBookingView from './pages/PublicBookingView';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="container header-content">
            <Link to="/" className="header-logo">
              <Calendar className="w-8 h-8 text-cyan-blue" />
              Event<span>Centre</span> Bookings
            </Link>
            <nav>
              <Link to="/admin" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                <ShieldAlert size={18} />
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PublicBookingView />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
