import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { validateForm, authValidation } from '../../utils/validation';
import type { User } from '../../types/auth';

// A reusable component for displaying information in view mode
const InfoField = ({ label, value }: { label: string, value: string | undefined }) => (
    <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="mt-1 p-3 bg-gray-100 rounded-md text-gray-800 min-h-[44px]">
            {value || <span className="text-gray-400">Not provided</span>}
        </div>
    </div>
);

// A reusable component for form inputs in edit mode
const InputField = ({ label, name, type = 'text', value, onChange, error }: { label: string, name: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string }) => (
    <div>
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

// A new reusable component for textareas, perfect for addresses
const TextareaField = ({ label, name, value, onChange, error }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, error?: string }) => (
    <div>
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);


const PersonalInfo = () => {
    const { user, updateUser } = useAuth(); 
    const [isEditing, setIsEditing] = useState(false);

    type FormValues = Pick<User, 'fullName' | 'email' | 'phoneNumber' | 'address'>;

    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
    } = useForm<FormValues>({
        initialValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
            address: user?.address || '', // Add address
        },
        validate: (values) => validateForm(values, {
            fullName: authValidation.signup.fullName,
            email: authValidation.signup.email,
            phoneNumber: authValidation.profile.phoneNumber,
            address: authValidation.profile.address, // Add address validation
        }),
        onSubmit: async (formValues) => {
            console.log('Submitting updated info:', formValues);
            await new Promise(resolve => setTimeout(resolve, 1000));
            updateUser(formValues);
            setIsEditing(false);
        },
    });

    useEffect(() => {
        if (user) {
            resetForm({
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber || '',
                address: user.address || '' // Add address
            });
        }
    }, [user]);

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
            
            {!isEditing ? (
                // --- VIEW MODE ---
                <div className="space-y-4">
                    <InfoField label="Full Name" value={user?.fullName} />
                    <InfoField label="Email Address" value={user?.email} />
                    <InfoField label="Phone Number" value={user?.phoneNumber} />
                    <InfoField label="Address" value={user?.address} /> {/* Display address */}
                    <div className="pt-4">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-[#D72638] text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                        >
                            Edit Information
                        </button>
                    </div>
                </div>
            ) : (
                // --- EDIT MODE ---
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField 
                        label="Full Name" 
                        name="fullName"
                        value={values.fullName}
                        onChange={handleChange}
                        error={errors.fullName}
                    />
                    <InputField 
                        label="Email Address" 
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={errors.email}
                    />
                    <InputField 
                        label="Phone Number" 
                        name="phoneNumber"
                        type="tel"
                        value={values.phoneNumber ?? ''}
                        onChange={handleChange}
                        error={errors.phoneNumber}
                    />
                    {/* Add the TextareaField for the address */}
                    <TextareaField
                        label="Address"
                        name="address"
                        value={values.address ?? ''}
                        onChange={handleChange as any} // Cast to any to handle textarea
                        error={errors.address}
                    />
                    <div className="pt-4 flex items-center gap-4">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-lg font-semibold text-white ${isSubmitting ? 'bg-gray-400' : 'bg-[#D72638] hover:bg-red-700'}`}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PersonalInfo;