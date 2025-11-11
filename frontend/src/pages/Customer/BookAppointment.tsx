import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaPhone, FaCalendarAlt, FaCar, FaClock, FaPlus } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import appointmentService from '../../services/appointmentService';
import { toast } from 'react-hot-toast';
import AddVehicleModal from '../../components/AddVehicleModal';
import type { Vehicle } from '../../types/auth';

interface BookingFormData {
    fullName: string;
    phoneNumber: string;
    vehicleId: string;
    serviceType: string;
    bookingDate: string;
    bookingTime: string;
    additionalNote: string;
    paymentMethod: string;
}

interface ValidationErrors {
    fullName?: string;
    phoneNumber?: string;
    vehicleId?: string;
    serviceType?: string;
    bookingDate?: string;
    bookingTime?: string;
    paymentMethod?: string;
}

const BookAppointment = () => {
    const { user, addVehicle } = useAuth();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const timePickerRef = useRef<HTMLDivElement>(null);
    
    const vehicles = user?.vehicles || [];
    
    const [formData, setFormData] = useState<BookingFormData>({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        vehicleId: '',
        serviceType: '',
        bookingDate: '',
        bookingTime: '',
        additionalNote: '',
        paymentMethod: ''
    });

    const serviceTypes = [
        'Oil Change',
        'General Check-Up',
        'Tire Replacement',
        'Brake Service',
        'Battery Replacement',
        'Engine Tune-Up',
        'Transmission Service',
        'Air Conditioning Service',
        'Wheel Alignment',
        'Other'
    ];

    const paymentMethods = [
        'Credit Card',
        'Debit Card',
        'Cash',
        'Bank Transfer'
    ];

    const timeSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear validation error for this field when user starts typing
        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };
    
    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
            if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
                setShowTimePicker(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format phone number to (XXX) XXX-XXXX format
    const formatPhoneNumber = (phone: string): string => {
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');
        
        // Check if it's a valid length (10 digits for US numbers)
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 11 && digits[0] === '1') {
            // Handle numbers with country code 1
            return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        
        // Return original if it doesn't match expected format
        return phone;
    };

    // Check if user has vehicles on component mount
    useEffect(() => {
        if (user && vehicles.length === 0) {
            toast.error('Please add a vehicle first before booking an appointment', { duration: 5000 });
        }
    }, [user, vehicles.length]);

    // Validate form fields
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        
        // Check if user has vehicles first
        if (vehicles.length === 0) {
            toast.error('Please add a vehicle before booking an appointment');
            return false;
        }
        
        // Validate full name
        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }
        
        // Validate phone number
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else {
            const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                errors.phoneNumber = 'Phone number must have at least 10 digits';
            }
        }
        
        // Validate vehicle selection
        if (!formData.vehicleId) {
            errors.vehicleId = 'Please select a vehicle';
        }
        
        // Validate service type
        if (!formData.serviceType.trim()) {
            errors.serviceType = 'Service type is required';
        }
        
        // Validate booking date
        if (!formData.bookingDate) {
            errors.bookingDate = 'Booking date is required';
        }
        
        // Validate booking time
        if (!formData.bookingTime) {
            errors.bookingTime = 'Booking time is required';
        }
        
        // Validate payment method
        if (!formData.paymentMethod) {
            errors.paymentMethod = 'Payment method is required';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }
        
        try {
            // Validate and combine date and time
            const time24Hour = convertTo24Hour(formData.bookingTime);
            const bookingDateTime = `${formData.bookingDate}T${time24Hour}`;
            
            // Validate the combined datetime
            const testDate = new Date(bookingDateTime);
            if (isNaN(testDate.getTime())) {
                toast.error('Invalid date or time format');
                return;
            }
            
            // Format phone number before sending
            const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);
            
            // Get the selected vehicle details
            const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
            const vehicleType = selectedVehicle 
                ? `${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year}`
                : `Vehicle ID: ${formData.vehicleId}`;
            
            const appointmentData = {
                fullName: formData.fullName.trim(),
                phoneNumber: formattedPhoneNumber,
                vehicleId: formData.vehicleId,
                vehicleType: vehicleType,
                serviceType: formData.serviceType.trim(),
                bookingDateTime,
                additionalNote: formData.additionalNote.trim(),
                paymentMethod: formData.paymentMethod
            };
            
            const response = await appointmentService.createAppointment(appointmentData);
            
            toast.success('Appointment booked successfully!');
            
            // Redirect to appointments page
            setTimeout(() => {
                navigate('/profile/appointments');
            }, 1000);
            
        } catch (error) {
            console.error('Error creating appointment:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to book appointment');
        }
    };
    
    // Helper function to convert 12-hour time to 24-hour format
    const convertTo24Hour = (time12h: string) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        let hourNum = parseInt(hours, 10);
        
        if (modifier === 'PM' && hourNum !== 12) {
            hourNum += 12;
        } else if (modifier === 'AM' && hourNum === 12) {
            hourNum = 0;
        }
        
        // Ensure hours are padded to 2 digits
        const formattedHours = hourNum.toString().padStart(2, '0');
        
        return `${formattedHours}:${minutes}:00`;
    };

    // Calendar component for date selection
    const renderCalendar = () => {
        const today = new Date();
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
        
        const days = [];
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const isPastDate = date < today;
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => {
                        if (!isPastDate) {
                            setSelectedDate(date);
                            setFormData(prev => ({
                                ...prev,
                                bookingDate: date.toISOString().split('T')[0]
                            }));
                            setShowCalendar(false);
                        }
                    }}
                    disabled={isPastDate}
                    className={`
                        p-2 text-sm rounded-lg transition-colors
                        ${isPastDate ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
                        ${isToday ? 'bg-red-100 text-red-600 font-semibold' : ''}
                        ${isSelected ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }
        
        return (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 min-w-[320px]">
                <div className="flex justify-between items-center mb-4">
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(year, month - 1))}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold">
                        {monthNames[month]} {year}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(year, month + 1))}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-semibold text-gray-600 p-2">
                            {day}
                        </div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Book New Service</h1>
                    </div>
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FaUser className="text-gray-500" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                                required
                            />
                            {validationErrors.fullName && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FaPhone className="text-gray-500" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="(555) 123-4567"
                                className={`w-full px-4 py-2 border ${validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                                required
                            />
                            {validationErrors.phoneNumber && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                            )}
                        </div>

                        {/* Vehicle Selection */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FaCar className="text-gray-500" />
                                Select Vehicle
                            </label>
                            {vehicles.length > 0 ? (
                                <select
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border ${validationErrors.vehicleId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                                    required
                                >
                                    <option value="">Select a vehicle</option>
                                    {vehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.registrationNumber}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500">No vehicles added yet.</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddVehicleModalOpen(true)}
                                        className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                                    >
                                        <FaPlus className="text-xs" /> Add Vehicle
                                    </button>
                                </div>
                            )}
                            {validationErrors.vehicleId && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.vehicleId}</p>
                            )}
                        </div>

                        {/* Service Type */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Service Type
                            </label>
                            <select
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border ${validationErrors.serviceType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                                required
                            >
                                <option value="">Select Service Type</option>
                                {serviceTypes.map(service => (
                                    <option key={service} value={service}>{service}</option>
                                ))}
                            </select>
                            {validationErrors.serviceType && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.serviceType}</p>
                            )}
                        </div>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Booking Date */}
                        <div className="relative" ref={datePickerRef}>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FaCalendarAlt className="text-gray-500" />
                                Booking Date
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={formData.bookingDate ? new Date(formData.bookingDate).toLocaleDateString() : ''}
                                onClick={() => setShowCalendar(!showCalendar)}
                                placeholder="DD/MM/YYYY"
                                className={`w-full px-4 py-2 border ${validationErrors.bookingDate ? 'border-red-500' : 'border-gray-300'} rounded-lg cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                            />
                            {validationErrors.bookingDate && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.bookingDate}</p>
                            )}
                            {showCalendar && renderCalendar()}
                        </div>

                        {/* Booking Time */}
                        <div className="relative" ref={timePickerRef}>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FaClock className="text-gray-500" />
                                Booking Time
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={formData.bookingTime}
                                onClick={() => setShowTimePicker(!showTimePicker)}
                                placeholder="Select Time"
                                className={`w-full px-4 py-2 border ${validationErrors.bookingTime ? 'border-red-500' : 'border-gray-300'} rounded-lg cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                            />
                            {validationErrors.bookingTime && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.bookingTime}</p>
                            )}
                            {showTimePicker && (
                                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 max-h-64 overflow-y-auto w-full min-w-[300px]">
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map(time => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, bookingTime: time }));
                                                    setShowTimePicker(false);
                                                }}
                                                className={`py-2 px-3 text-sm rounded-lg border transition-colors
                                                    ${formData.bookingTime === time 
                                                        ? 'bg-red-500 text-white border-red-500' 
                                                        : 'border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Additional Note
                        </label>
                        <textarea
                            name="additionalNote"
                            value={formData.additionalNote}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Add Your Note"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Payment Method
                        </label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border ${validationErrors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                            required
                        >
                            <option value="">Select Payment Method</option>
                            {paymentMethods.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                        {validationErrors.paymentMethod && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.paymentMethod}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-[#D72638] text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Submit Booking
                        </button>
                    </div>
                        </form>
                </div>
            </div>
            
            {/* Add Vehicle Modal */}
            <AddVehicleModal 
                isOpen={isAddVehicleModalOpen} 
                onClose={() => setIsAddVehicleModalOpen(false)} 
                onSave={async (vehicle) => {
                    try {
                        await addVehicle(vehicle);
                        setIsAddVehicleModalOpen(false);
                        toast.success('Vehicle added successfully! You can now select it.');
                        // Auto-select the newly added vehicle if it's the first one
                        if (vehicles.length === 0 && user?.vehicles?.[0]) {
                            setFormData(prev => ({ ...prev, vehicleId: user.vehicles[0].id }));
                        }
                    } catch (error) {
                        console.error('Error adding vehicle:', error);
                        toast.error('Failed to add vehicle. Please try again.');
                    }
                }} 
            />
        </div>
    );
};

export default BookAppointment;