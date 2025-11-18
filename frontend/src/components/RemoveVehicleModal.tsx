import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import type { Vehicle } from '../types/auth';

interface RemoveVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  vehicle: Vehicle | null;
}

const RemoveVehicleModal: React.FC<RemoveVehicleModalProps> = ({ isOpen, onClose, onConfirm, vehicle }) => {
  if (!isOpen || !vehicle) return null;

  const handleConfirm = () => {
    onConfirm(vehicle.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-start p-6">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Remove Vehicle</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to remove the <strong className="font-semibold">{vehicle.model}</strong> (Reg: {vehicle.registrationNumber})?
              </p>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveVehicleModal;