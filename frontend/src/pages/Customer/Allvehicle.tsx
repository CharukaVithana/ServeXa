import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  registrationNumber: string;
  lastServiceDate: string;
  status: string;
  nextAppointment: string;
}

const AllVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/vehicles/my-vehicles", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-gray-50 text-slate-800 min-h-screen">
      <div className="fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">My Vehicles</h1>

        {loading ? (
          <p>Loading...</p>
        ) : vehicles.length === 0 ? (
          <p>No vehicles found.</p>
        ) : (
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Registration</th>
                <th className="p-3 text-left">Make & Model</th>
                <th className="p-3 text-left">Last Service</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Next Appointment</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{v.registrationNumber}</td>
                  <td className="p-3">{v.make} {v.model}</td>
                  <td className="p-3">{v.lastServiceDate || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        v.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : v.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3">{v.nextAppointment || "Not Scheduled"}</td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:underline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllVehicles;
