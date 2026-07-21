import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle } from 'lucide-react';
import './PublicBookingView.css';

const API_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function PublicBookingView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [bookings, setBookings] = useState([]);
  
  const [formData, setFormData] = useState({
    planner_name: '',
    contact_info: '',
    event_details: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch availability
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  // Generate next 14 days for calendar
  const nextDays = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  const isSlotBooked = (date, time) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return bookings.some(b => {
      // Basic check: if same date and the start time matches or overlaps
      // In a real app, logic would cover duration. Here we assume 1hr slots.
      return b.date === formattedDate && b.start_time === time && b.status === 'approved';
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMessage("Please select a time slot.");
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Calculate end time (assuming 1 hour duration for simplicity in V1)
      const hour = parseInt(selectedTime.split(':')[0]);
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

      await axios.post(`${API_URL}/bookings`, {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        end_time: endTime
      });
      
      setStatus('success');
      setFormData({ planner_name: '', contact_info: '', event_details: '' });
      setSelectedTime('');
      fetchBookings(); // Refresh availability
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || "Failed to submit request.");
    }
  };

  if (status === 'success') {
    return (
      <div className="container animate-fade-in">
        <div className="success-card glass-card">
          <CheckCircle size={64} className="text-success mb-4 mx-auto" />
          <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Request Pending</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Your booking request has been submitted successfully. The admin will review it shortly.
          </p>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button className="btn-primary" onClick={() => setStatus('idle')}>Make Another Booking</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="booking-layout">
        
        {/* Left Column: Calendar & Time Slots */}
        <div className="booking-left">
          <div className="card">
            <h3>Select a Date</h3>
            <div className="date-picker-grid">
              {nextDays.map((day, i) => (
                <button 
                  key={i}
                  className={`date-chip ${isSameDay(day, selectedDate) ? 'selected' : ''}`}
                  onClick={() => { setSelectedDate(day); setSelectedTime(''); }}
                >
                  <span className="day-name">{format(day, 'EEE')}</span>
                  <span className="day-number">{format(day, 'd')}</span>
                  <span className="month-name">{format(day, 'MMM')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <h3>Available Slots for {format(selectedDate, 'MMMM d, yyyy')}</h3>
            <div className="time-picker-grid">
              {TIME_SLOTS.map((time) => {
                const booked = isSlotBooked(selectedDate, time);
                return (
                  <button
                    key={time}
                    disabled={booked}
                    className={`time-chip ${selectedTime === time ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock size={16} />
                    {time}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="booking-right">
          <div className="card glass-card">
            <h3 style={{ marginBottom: '20px' }}>Request Booking</h3>
            
            {errorMessage && <div className="error-alert">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label><User size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px' }}/> Full Name</label>
                <input 
                  type="text" 
                  name="planner_name" 
                  required 
                  value={formData.planner_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="input-group">
                <label><Phone size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px' }}/> Contact Info (Email / Phone)</label>
                <input 
                  type="text" 
                  name="contact_info" 
                  required 
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              <div className="input-group">
                <label>Event Details</label>
                <textarea 
                  name="event_details" 
                  rows="4" 
                  value={formData.event_details}
                  onChange={handleInputChange}
                  placeholder="E.g., Wedding reception for 150 guests..."
                ></textarea>
              </div>

              <div className="selected-summary">
                <strong>Selected Slot:</strong> 
                {selectedTime ? ` ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}` : ' None selected'}
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '20px' }}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
