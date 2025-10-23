function App() {
  console.log("App component is rendering!");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2em', textAlign: 'center' }}>
        🎉 Karma Club is Working!
      </h1>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>✅ React is loading</p>
        <p>✅ Vite is working</p>
        <p>✅ TypeScript is compiling</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default App;