

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import Signup from './pages/Authentication/SignUp';
import ResetPasswordRequest from './pages/Authentication/ResetPasswordRequest';
import ResetPasswordNew from './pages/Authentication/ResetPasswordNew';
import Landing from './pages/Landing/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPasswordRequest />} />
        <Route path="/reset-password/new" element={<ResetPasswordNew />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
