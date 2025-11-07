import { useLocation, useNavigate, Link } from "react-router-dom";

/** Mirror the response shape we pass via navigation state. */
type ServiceBookingResponse = {
  id: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: string;
  serviceType: string;
  bookingDate: string; // ISO or yyyy-mm-dd
  bookingTime: string; // HH:mm
  note?: string;
  paymentMethod: string;
  createdAt: string;
};

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state as ServiceBookingResponse | undefined;

  if (!booking) {
    // Direct access: send user to the form
    navigate("/booking/new", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-red-500">
              <img
                alt="avatar"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  booking.fullName
                )}&background=ef4444&color=ffffff`}
              />
            </div>
            <div>
              <p className="font-semibold">{booking.fullName}</p>
              <p className="text-sm text-gray-500">alex.johnson@example.com</p>
              <p className="text-sm text-gray-500">{booking.phoneNumber}</p>
            </div>
          </div>
          <button className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Edit Profile
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl p-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-center text-2xl font-semibold text-red-700 mb-6">
            Service Booking
          </h2>

          <div className="space-y-3">
            <Row label="Full Name" value={booking.fullName} />
            <Row label="Phone Number" value={booking.phoneNumber} />
            <Row label="Vehicle Type" value={booking.vehicleType} />
            <Row label="Service Type" value={booking.serviceType} />
            <Row label="Booked Date" value={formatDate(booking.bookingDate)} />
            <Row label="Booked Time" value={booking.bookingTime} />
            {booking.note ? (
              <Row label="Additional Note" value={booking.note} />
            ) : null}
            <Row label="Payment Method" value={booking.paymentMethod} />
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700">
            <span>✅</span>
            <span>Service Booked Successfully!</span>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Link
              to="/dashboard"
              className="text-red-700 font-semibold hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <button
              onClick={() => navigate("/booking/history")}
              className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Booking History
            </button>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-end text-sm text-gray-500">
          <button className="text-red-600">Logout</button>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-2 border rounded-lg bg-gray-50 px-3 py-2">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="sm:col-span-2 font-medium break-words">{value}</div>
    </div>
  );
}

function formatDate(isoOrYmd: string) {
  // handles both "yyyy-mm-dd" and full ISO strings
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(isoOrYmd)
    ? `${isoOrYmd}T00:00:00`
    : isoOrYmd;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? isoOrYmd : d.toLocaleDateString();
}
