import { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import { useAuth } from './useAuth';

export const useAppointmentCount = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    upcoming: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    if (!user) {
      setCounts({ upcoming: 0, pending: 0 });
      return;
    }

    try {
      setLoading(true);
      const appointments = await appointmentService.getCustomerAppointments(user.id);
      
      // Count upcoming confirmed appointments
      const now = new Date();
      const upcoming = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.bookingDateTime);
        return appointmentDate > now && 
               (appointment.status === 'SCHEDULED' || 
                appointment.status === 'CONFIRMED' || 
                appointment.status === 'CREATED');
      }).length;

      // Count pending appointments
      const pending = appointments.filter(appointment => 
        appointment.status === 'PENDING' || 
        appointment.status === 'REQUESTED'
      ).length;

      setCounts({ upcoming, pending });
    } catch (error) {
      console.error('Error fetching appointment counts:', error);
      setCounts({ upcoming: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Refresh counts every minute
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return { counts, loading, refetch: fetchCounts };
};