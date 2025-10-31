import React from 'react';
import { FaCheckCircle, FaEye } from 'react-icons/fa';

const ServiceHistory = () => {
    // Placeholder data
    const history = [
        { date: 'June 15, 2023', vehicle: 'Toyota Camry', service: 'Oil Change & Filter', status: 'completed', cost: '$89.99' },
        { date: 'April 3, 2023', vehicle: 'Toyota Camry', service: 'Brake Replacement', status: 'completed', cost: '$350.00' },
        { date: 'January 22, 2023', vehicle: 'Honda Civic', service: 'Annual Inspection', status: 'completed', cost: '$120.00' },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Service History</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr className="text-sm font-semibold text-gray-600">
                            <th className="p-4">Date</th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4">Service Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Cost</th>
                            <th className="p-4">Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="p-4">{item.date}</td>
                                <td className="p-4">{item.vehicle}</td>
                                <td className="p-4">{item.service}</td>
                                <td className="p-4">
                                    <span className="flex items-center gap-2 text-green-600">
                                        <FaCheckCircle /> Completed
                                    </span>
                                </td>
                                <td className="p-4">{item.cost}</td>
                                <td className="p-4">
                                    <button className="text-red-500 hover:underline flex items-center gap-1">
                                        <FaEye /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServiceHistory;