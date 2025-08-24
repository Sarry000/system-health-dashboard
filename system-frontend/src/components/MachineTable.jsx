import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- STYLES ---
const styles = {
  // Main container for the whole component
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  // Style for the summary cards
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #e9ecef',
  },
  statValue: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#212529',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '0.25rem',
  },
  // Style for the table container
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e9ecef',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e9ecef',
  },
  tableTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#343a40',
    margin: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#f8f9fa',
  },
  td: {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    color: '#495057',
    borderTop: '1px solid #e9ecef',
  },
  // Status badges
  statusOk: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    color: '#15803d',
  },
  statusNotOk: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#b91c1c',
  },
  centeredCell: {
    textAlign: 'center',
  },
  message: {
    padding: '3rem',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '1rem',
  },
};

// --- COMPONENTS ---

const StatCard = ({ value, label }) => (
  <div style={styles.statCard}>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const StatusIndicator = ({ isOk, textOk, textNotOk }) => (
  <span style={isOk ? styles.statusOk : styles.statusNotOk}>
    {isOk ? textOk : textNotOk}
  </span>
);

const MachineTable = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const fetchMachines = () => {
      axios.get('http://localhost:3001/api/machines')
        .then(response => setMachines(response.data))
        .catch(error => {
          console.error("Error fetching data:", error);
          setError("Could not fetch data. Is the local server running?");
        })
        .finally(() => setLoading(false));
    };
    fetchMachines();
    const intervalId = setInterval(fetchMachines, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const issuesCount = useMemo(() => {
    return machines.filter(m => !m.is_encrypted || !m.is_antivirus_running || !m.sleep_minutes_compliant).length;
  }, [machines]);

  if (loading) return <div style={styles.message}>Loading...</div>;
  if (error) return <div style={{...styles.message, color: '#b91c1c'}}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.statsContainer}>
        <StatCard value={machines.length} label="Total Machines" />
        <StatCard value={issuesCount} label="Machines with Issues" />
      </div>
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>All Machines</h2>
        </div>
        {machines.length === 0 ? (
          <div style={styles.message}>No machines have reported yet.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Machine ID</th>
                <th style={styles.th}>OS</th>
                <th style={{...styles.th, ...styles.centeredCell}}>Encryption</th>
                <th style={{...styles.th, ...styles.centeredCell}}>Antivirus</th>
                <th style={{...styles.th, ...styles.centeredCell}}>Sleep Policy</th>
                <th style={styles.th}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine, index) => (
                <tr 
                  key={machine.id} 
                  style={{backgroundColor: hoveredRow === index ? '#f8f9fa' : '#ffffff'}}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{...styles.td, fontFamily: 'monospace'}} title={machine.id}>{machine.id.substring(0, 12)}...</td>
                  <td style={styles.td}>{machine.os}</td>
                  <td style={{...styles.td, ...styles.centeredCell}}>
                    <StatusIndicator isOk={machine.is_encrypted} textOk="On" textNotOk="Off" />
                  </td>
                  <td style={{...styles.td, ...styles.centeredCell}}>
                    <StatusIndicator isOk={machine.is_antivirus_running} textOk="Running" textNotOk="Not Found" />
                  </td>
                  <td style={{...styles.td, ...styles.centeredCell}}>
                    <StatusIndicator isOk={machine.sleep_minutes_compliant} textOk="Compliant" textNotOk="Non-Compliant" />
                  </td>
                  <td style={styles.td}>{new Date(machine.last_seen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MachineTable;