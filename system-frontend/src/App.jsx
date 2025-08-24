import React from 'react';
import MachineTable from './components/MachineTable';

const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // A slightly darker, more professional gray
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dee2e6',
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '4.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#212529',
  },
  mainContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem',
  },
};

function App() {
  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>
            System Health Dashboard
          </h1>
        </div>
      </header>
      <main style={styles.mainContent}>
        <MachineTable />
      </main>
    </div>
  );
}

export default App;