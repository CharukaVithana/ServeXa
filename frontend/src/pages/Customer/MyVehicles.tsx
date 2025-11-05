import React, { useState } from 'react';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import AddVehicleModal from '../../components/AddVehicleModal';
import type { Vehicle } from '../../types/auth';
import EditVehicleModal from '../../components/EditVehicleModal';
import RemoveVehicleModal from '../../components/RemoveVehicleModal';

const VehicleCard = ({ vehicle, onEdit, onRemove }: { vehicle: Vehicle, onEdit: (v: Vehicle) => void, onRemove: (v: Vehicle) => void }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        <img src={vehicle.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} alt={vehicle.model} className="w-full h-48 object-cover" />
        <div className="p-4 flex-grow">
            <h3 className="text-lg font-bold text-gray-800">{vehicle.model}</h3>
            <p className="text-sm text-gray-500">Reg. Number: {vehicle.registrationNumber}</p>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
            <button onClick={() => onEdit(vehicle)} className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2">
                <FaPencilAlt /> Edit
            </button>
            <button onClick={() => onRemove(vehicle)} className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2">
                <FaTrash /> Remove
            </button>
        </div>
    </div>
);

const MyVehicles = () => {
    const { user, addVehicle, updateVehicle, removeVehicle } = useAuth();
    
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
    
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const vehicles = user?.vehicles || [];

    const handleEditClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setEditModalOpen(true);
    };

    const handleRemoveClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setRemoveModalOpen(true);
    };

    const closeModals = () => {
        setAddModalOpen(false);
        setEditModalOpen(false);
        setRemoveModalOpen(false);
        setSelectedVehicle(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Vehicles</h2>
                <button 
                    onClick={() => setAddModalOpen(true)}
                    className="bg-[#D72638] text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"
                >
                    <FaPlus /> Add Vehicle
                </button>
            </div>

            {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.map((vehicle) => (
                        <VehicleCard 
                            key={vehicle.id}
                            vehicle={vehicle}
                            onEdit={handleEditClick}
                            onRemove={handleRemoveClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">You haven't added any vehicles yet.</p>
                </div>
            )}

            <AddVehicleModal 
                isOpen={isAddModalOpen} 
                onClose={closeModals} 
                onSave={async (vehicle) => {
                    try {
                        await addVehicle(vehicle);
                        closeModals();
                    } catch (error) {
                        console.error('Error adding vehicle:', error);
                        // You might want to show an error message to the user here
                    }
                }} 
            />
            <EditVehicleModal 
                isOpen={isEditModalOpen} 
                onClose={closeModals} 
                onSave={async (id, vehicle) => {
                    try {
                        await updateVehicle(id, vehicle);
                        closeModals();
                    } catch (error) {
                        console.error('Error updating vehicle:', error);
                        // You might want to show an error message to the user here
                    }
                }} 
                vehicle={selectedVehicle} 
            />
            <RemoveVehicleModal 
                isOpen={isRemoveModalOpen} 
                onClose={closeModals} 
                onConfirm={async (id) => {
                    try {
                        await removeVehicle(id);
                        closeModals();
                    } catch (error) {
                        console.error('Error removing vehicle:', error);
                        // You might want to show an error message to the user here
                    }
                }} 
                vehicle={selectedVehicle} 
            />
        </div>
    );
};

export default MyVehicles;