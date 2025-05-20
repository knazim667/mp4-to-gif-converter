import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import AppRoutes from './components/AppRoutes'; // Assuming AppRoutes is in components
import Footer from './components/Footer';
// import Navbar from './components/Navbar'; // Optional: if you add a Navbar

function App() {
  return (
    // BrowserRouter enables routing for the entire application
    <Router>
      {/* Main application container using Chakra UI Box */}
      {/* Flexbox ensures footer stays at the bottom */}
      <Box display="flex" flexDirection="column" minH="100vh">
        {/* Optional: Navbar would go here */}
        {/* <Navbar /> */}

        {/* Main content area that grows to fill available space */}
        {/* AppRoutes will render the component based on the current URL */}
        <Box flexGrow={1} py={8} /* bg="gray.50" - You might move bg to HomePage or keep it global */ >
          <AppRoutes />
        </Box>

        {/* Footer component, always visible */}
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
