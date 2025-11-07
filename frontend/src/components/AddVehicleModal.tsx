import React, { useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { useForm } from '../hooks/useForm';
import { validateForm, authValidation } from '../utils/validation';
import type { Vehicle } from '../types/auth';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id'>) => void;
}

// Reusable input field for the form
const FormInput = ({ label, name, placeholder, value, onChange, error, required = false, type = 'text' }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue
  } = useForm<Omit<Vehicle, 'id'>>({
    initialValues: {
      registrationNumber: '',
      make: '',
      model: '',
      year: '',
      color: '',
      imageUrl: '',
    },
    validate: (values) => validateForm(values, authValidation.vehicle),
    onSubmit: async (formValues) => {
      // Pass the new vehicle data (including the image preview URL) to the parent
      onSave({ ...formValues, imageUrl: imagePreview || '' });
      handleClose(); // Close the modal after saving
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    resetForm();
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-modal="true" role="dialog">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add a New Vehicle</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body (Form) */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-4">
            <FormInput label="Registration Number" name="registrationNumber" placeholder="e.g., BHG-654" value={values.registrationNumber} onChange={handleChange} error={errors.registrationNumber} required />
            <FormInput label="Manufacturer" name="make" placeholder="e.g., Toyota, Honda" value={values.make} onChange={handleChange} error={errors.make} required />
            <FormInput label="Model" name="model" placeholder="e.g., Camry, Civic" value={values.model} onChange={handleChange} error={errors.model} required />
            <FormInput label="Year" name="year" placeholder="e.g., 2024" value={values.year} onChange={handleChange} error={errors.year} required type="number" />
            <FormInput label="Color" name="color" placeholder="e.g., White" value={values.color} onChange={handleChange} error={errors.color} />
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Image (Optional)</label>
              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vehicle preview" className="mx-auto h-24 w-auto rounded-md" />
                  ) : (
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer (Actions) */}
          <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-4 py-2 text-sm font-medium text-white bg-[#D72638] rounded-md hover:bg-red-700 disabled:bg-gray-400`}>
              {isSubmitting ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;