

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Authentication/Login';
import Signup from './pages/Authentication/SignUp';
import ResetPasswordRequest from './pages/Authentication/ResetPasswordRequest';
import ResetPasswordNew from './pages/Authentication/ResetPasswordNew';
import Landing from './pages/Landing/Landing';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPasswordRequest />} />
          <Route path="/reset-password/new" element={<ResetPasswordNew />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
