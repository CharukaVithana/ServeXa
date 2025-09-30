

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../Authentication/Login';
import Signup from '../Authentication/SignUp';
import ResetPasswordRequest from '../Authentication/ResetPasswordRequest';
import ResetPasswordNew from '../Authentication/ResetPasswordNew';
import Landing from './pages/Landing/landing';

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
