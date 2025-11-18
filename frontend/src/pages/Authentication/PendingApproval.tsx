import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";

const PendingApproval = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <FaClock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Account Pending Approval
        </h2>
        
        <p className="text-gray-600 mb-6">
          Thank you for registering! Your account has been created successfully and is 
          currently pending approval from an administrator.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            You will receive an email notification once your account has been approved. 
            This usually takes 1-2 business days.
          </p>
        </div>
        
        <p className="text-gray-600 mb-6">
          Once approved, you'll be able to log in and access all the features of ServeXa.
        </p>
        
        <Link 
          to="/login" 
          className="inline-block bg-[#D72638] text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
        >
          Return to Login
        </Link>
        
        <p className="mt-6 text-sm text-gray-500">
          Have questions? Contact us at{" "}
          <a href="mailto:support@servexa.com" className="text-[#D72638] hover:underline">
            support@servexa.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;