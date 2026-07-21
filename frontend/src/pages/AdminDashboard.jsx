import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import './AdminDashboard.css';

const API_URL = 'http://localhost:3001/api';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/admin/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  if (loading) return <div className="container" style={{ paddingTop: '40px' }}>Loading dashboard...</div>;

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const canceledBookings = bookings.filter(b => b.status === 'canceled');

  const renderBookingCard = (booking) => (
    <div key={booking.id} className="card booking-admin-card">
      <div className="card-header">
        <span className={`badge badge-${booking.status}`}>{booking.status}</span>
        <span className="booking-date"><CalendarIcon size={14}/> {format(parseISO(booking.date), 'MMM d, yyyy')}</span>
      </div>
      
      <div className="card-body">
        <h4 style={{ marginBottom: '8px' }}>{booking.planner_name}</h4>
        <div className="info-row"><Phone size={14}/> {booking.contact_info}</div>
        <div className="info-row"><Clock size={14}/> {booking.start_time} - {booking.end_time}</div>
        {booking.event_details && (
          <div className="info-details">
            <strong>Details:</strong>
            <p>{booking.event_details}</p>
          </div>
        )}
      </div>

      {booking.status === 'pending' && (
        <div className="card-actions">
          <button className="btn-success" onClick={() => updateStatus(booking.id, 'approved')}>
            <CheckCircle size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Approve
          </button>
          <button className="btn-danger" onClick={() => updateStatus(booking.id, 'canceled')}>
            <XCircle size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Cancel
          </button>
        </div>
      )}
      
      {booking.status === 'approved' && (
        <div className="card-actions">
           <button className="btn-danger" onClick={() => updateStatus(booking.id, 'canceled')} style={{ width: '100%' }}>
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Admin Dashboard</h2>
        <button className="btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-column">
          <div className="column-header">
            <h3>Pending Requests</h3>
            <span className="count-badge">{pendingBookings.length}</span>
          </div>
          <div className="cards-container">
            {pendingBookings.length === 0 ? <p className="empty-state">No pending requests</p> : pendingBookings.map(renderBookingCard)}
          </div>
        </div>

        <div className="dashboard-column">
          <div className="column-header">
            <h3>Approved Bookings</h3>
            <span className="count-badge">{approvedBookings.length}</span>
          </div>
          <div className="cards-container">
            {approvedBookings.length === 0 ? <p className="empty-state">No approved bookings</p> : approvedBookings.map(renderBookingCard)}
          </div>
        </div>

        <div className="dashboard-column">
          <div className="column-header">
            <h3>Canceled</h3>
            <span className="count-badge">{canceledBookings.length}</span>
          </div>
          <div className="cards-container">
            {canceledBookings.length === 0 ? <p className="empty-state">No canceled bookings</p> : canceledBookings.map(renderBookingCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
