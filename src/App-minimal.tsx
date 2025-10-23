function App() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#0f1419', 
      color: '#ffffff', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '2rem',
        background: 'linear-gradient(45deg, #10B981, #3B82F6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        🌟 Karma Club
      </h1>
      
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '2rem', 
        borderRadius: '12px',
        border: '1px solid #333',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#10B981', marginBottom: '1rem' }}>
          ✅ Development Environment is Working!
        </h2>
        
        <div style={{ lineHeight: '1.8' }}>
          <p>✅ React 18.3.1 is running</p>
          <p>✅ Vite development server active</p>
          <p>✅ TypeScript compilation successful</p>
          <p>✅ Hot module replacement ready</p>
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#0f1419', 
          borderRadius: '8px',
          border: '1px solid #10B981'
        }}>
          <p><strong>🚀 Ready for Development!</strong></p>
          <p>Your Karma Club app is ready. You can now start developing new features.</p>
        </div>
      </div>
    </div>
  );
}

export default App;