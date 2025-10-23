import React from 'react';

const SimpleApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#121212', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1>Karma Club App</h1>
      <p>If you can see this, the basic React app is working!</p>
    </div>
  );
};

export default SimpleApp;