import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Authentication/Login";
import Signup from "./pages/Authentication/SignUp";
import ResetPasswordRequest from "./pages/Authentication/ResetPasswordRequest";
import ResetPasswordNew from "./pages/Authentication/ResetPasswordNew";
import PendingApproval from "./pages/Authentication/PendingApproval";
import Landing from "./pages/Landing/Landing";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ChatSupport from "./pages/Customer/ChatSupport";
import CustomerContact from "./pages/Customer/Contact";
import CustomerSetting from "./pages/Customer/Setting";
import AllVehicles from "./pages/Customer/Allvehicle";
import CustomerProfile from "./pages/Customer/CustomerProfile";
import PersonalInfo from "./pages/Customer/PersonalInfo";
import MyVehicles from "./pages/Customer/MyVehicles";
import ServiceHistory from "./pages/Customer/ServiceHistory";
import Appointments from "./pages/Customer/Appointments";
import BookAppointment from "./pages/Customer/BookAppointment";
import Notifications from "./pages/Customer/Notifications";
import { Toaster } from "react-hot-toast";
import Chatbot from "./components/Chatbot";

// Employee Dashboard Components
import EmployeeLayout from "./components/employee/EmployeeLayout";
import CurrentTasks from "./components/employee/CurrentTasks";
import PendingTasks from "./components/employee/PendingTasks";
import Completed from "./components/employee/Completed";
import Rejected from "./components/employee/Rejected";

// Admin Dashboard Components
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAppointments from "./pages/Admin/AdminAppointments";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ✅ Toaster must be inside Provider but outside Routes */}
        <Toaster position="top-right" reverseOrder={false} />
        
        {/* ✅ Global Chatbot - appears on all pages */}
        <Chatbot />

        {/* ✅ Routes should wrap all Route elements (not self-closed) */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/reset-password" element={<ResetPasswordRequest />} />
          <Route path="/reset-password/new" element={<ResetPasswordNew />} />


  
          {/* Customer Dashboard Routes */}
          <Route
            path="/cus-dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/cus-dashboard/appointments"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <BookAppointment />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/customer/chat-support"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <ChatSupport />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/customer/contact"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <CustomerContact />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/customer/settings"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <CustomerSetting />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/customer/vehicles"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <AllVehicles />
              </RoleProtectedRoute>
            }
          />

          {/* Employee Dashboard with nested routes */}
          <Route
            path="/employee"
            element={
              <RoleProtectedRoute allowedRoles={["employee", "admin"]}>
                <EmployeeLayout />
              </RoleProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/employee/pending-tasks" replace />}
            />
            <Route path="pending-tasks" element={<PendingTasks />} />
            <Route path="current-tasks" element={<CurrentTasks />} />
            <Route path="completed" element={<Completed />} />
            <Route path="rejected" element={<Rejected />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminAppointments />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <div>Users Management - Coming Soon</div>
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <div>Reports - Coming Soon</div>
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Settings - Coming Soon</div>
              </RoleProtectedRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Profile Routes */}
          <Route
            path="/profile"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <CustomerProfile />
              </RoleProtectedRoute>
            }
          >
            
            <Route index element={<Navigate to="personal-info" replace />} />
            <Route path="personal-info" element={<PersonalInfo />} />
            <Route path="my-vehicles" element={<MyVehicles />} />
            <Route path="service-history" element={<ServiceHistory />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
