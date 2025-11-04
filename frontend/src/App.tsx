

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Authentication/Login';
import Signup from './pages/Authentication/SignUp';
import ResetPasswordRequest from './pages/Authentication/ResetPasswordRequest';
import ResetPasswordNew from './pages/Authentication/ResetPasswordNew';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Employee Dashboard Components
import EmployeeLayout from './components/employee/EmployeeLayout';
import CurrentTasks from './components/employee/CurrentTasks';
import PendingTasks from './components/employee/PendingTasks';
import Completed from './components/employee/Completed';

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

          {/* Employee Dashboard with nested routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="/employee/pending-tasks" replace />} />
            <Route path="pending-tasks" element={<PendingTasks />} />
            <Route path="current-tasks" element={<CurrentTasks />} />
            <Route path="completed" element={<Completed />} />
          </Route>
          
          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

         
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
