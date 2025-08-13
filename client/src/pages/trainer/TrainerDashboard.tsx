import { logoutTrainer } from '@/redux/slices/trainerAuthSlice';
import type { RootState } from '@/redux/store';
import { trainerLogout } from '@/services/authService';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function TrainerDashboard() {
  const { trainer } = useSelector((state: RootState) => state.trainerAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    dispatch(logoutTrainer());
    await trainerLogout();
    navigate('/trainer/login');
  };

  // Mock data for demonstration
  const mockStats = {
    totalClients: 24,
    sessionsToday: 5,
    upcomingSession: '2:00 PM',
    monthlyRevenue: '$4,250'
  };

  const recentClients = [
    { id: 1, name: 'Sarah Johnson', lastSession: '2 days ago', status: 'Active' },
    { id: 2, name: 'Mike Chen', lastSession: '1 week ago', status: 'Active' },
    { id: 3, name: 'Emma Davis', lastSession: '3 days ago', status: 'Active' },
  ];

  const todaySchedule = [
    { time: '9:00 AM', client: 'John Smith', type: 'Strength Training' },
    { time: '10:30 AM', client: 'Lisa Brown', type: 'Cardio' },
    { time: '2:00 PM', client: 'David Wilson', type: 'Personal Training' },
    { time: '3:30 PM', client: 'Anna Lee', type: 'Yoga' },
    { time: '5:00 PM', client: 'Tom Harris', type: 'HIIT' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}> Trainer Dashboard</h1>
          <div style={styles.userSection}>
            <span style={styles.userEmail}>{trainer?.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeText}>Welcome back, Trainer!</h2>
          <p style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Clients</h3>
            <p style={styles.statValue}>{mockStats.totalClients}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Sessions Today</h3>
            <p style={styles.statValue}>{mockStats.sessionsToday}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Next Session</h3>
            <p style={styles.statValue}>{mockStats.upcomingSession}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Monthly Revenue</h3>
            <p style={styles.statValue}>{mockStats.monthlyRevenue}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Today's Schedule */}
          <div style={styles.scheduleSection}>
            <h3 style={styles.sectionTitle}>Today's Schedule</h3>
            <div style={styles.scheduleList}>
              {todaySchedule.map((session, index) => (
                <div key={index} style={styles.scheduleItem}>
                  <span style={styles.scheduleTime}>{session.time}</span>
                  <div style={styles.scheduleDetails}>
                    <p style={styles.clientName}>{session.client}</p>
                    <p style={styles.sessionType}>{session.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Clients */}
          <div style={styles.clientsSection}>
            <h3 style={styles.sectionTitle}>Recent Clients</h3>
            <div style={styles.clientsList}>
              {recentClients.map((client) => (
                <div key={client.id} style={styles.clientItem}>
                  <div>
                    <p style={styles.clientName}>{client.name}</p>
                    <p style={styles.lastSession}>Last session: {client.lastSession}</p>
                  </div>
                  <span style={styles.statusBadge}>{client.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.actionButtons}>
            <button style={styles.actionButton}>Add New Client</button>
            <button style={styles.actionButton}>Schedule Session</button>
            <button style={styles.actionButton}>View Reports</button>
            <button style={styles.actionButton}>Manage Programs</button>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    margin: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userEmail: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  welcomeSection: {
    marginBottom: '2rem',
  },
  welcomeText: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
  },
  date: {
    color: '#7f8c8d',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statTitle: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: 0,
    fontWeight: 'bold',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  scheduleSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  clientsSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  scheduleItem: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  scheduleTime: {
    fontWeight: 'bold',
    color: '#3498db',
    minWidth: '80px',
  },
  scheduleDetails: {
    flex: 1,
  },
  clientName: {
    margin: '0 0 0.25rem 0',
    fontWeight: '500',
  },
  sessionType: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#7f8c8d',
  },
  clientsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  clientItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  lastSession: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#7f8c8d',
  },
  statusBadge: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
  },
  quickActions: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
};

export default TrainerDashboard;