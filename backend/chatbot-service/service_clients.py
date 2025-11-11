import os
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class ServiceClientError(Exception):
    """Custom exception for service client errors"""
    pass


class BaseServiceClient:
    """Base class for microservice clients"""
    
    def __init__(self, service_name: str, base_url: str, timeout: float = 30.0):
        self.service_name = service_name
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        headers: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> Any:
        """Make HTTP request to the service"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = await self.client.request(
                method=method,
                url=url,
                headers=headers,
                **kwargs
            )
            response.raise_for_status()
            
            # Handle empty responses
            if response.status_code == 204 or not response.content:
                logger.warning(f"Empty response from {self.service_name} at {url}")
                return None
                
            try:
                data = response.json()
                logger.debug(f"Response from {self.service_name}: {data}")
                return data
            except Exception as json_error:
                logger.error(f"Failed to parse JSON from {self.service_name}: {json_error}")
                logger.error(f"Response content: {response.text}")
                return None
        except httpx.HTTPError as e:
            logger.error(f"Error calling {self.service_name} at {url}: {str(e)}")
            raise ServiceClientError(f"Failed to call {self.service_name}: {str(e)}")
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


class AuthServiceClient(BaseServiceClient):
    """Client for Authentication Service"""
    
    def __init__(self):
        base_url = os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")
        super().__init__("auth-service", base_url)
    
    async def get_user_info(self, user_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Get user information - uses /me endpoint with token"""
        if not token:
            # Try to get current user info without token
            return await self._make_request(
                "GET",
                "/api/auth/me",
                headers={}
            )
        
        headers = {"Authorization": f"Bearer {token}"}
        return await self._make_request(
            "GET",
            "/api/auth/me",
            headers=headers
        )
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and get user details"""
        return await self._make_request(
            "POST",
            "/api/auth/verify",
            headers={"Authorization": f"Bearer {token}"}
        )


class AppointmentServiceClient(BaseServiceClient):
    """Client for Appointment Service"""
    
    def __init__(self):
        base_url = os.getenv("APPOINTMENT_SERVICE_URL", "http://localhost:8083")
        super().__init__("appointment-service", base_url)
    
    async def get_customer_appointments(
        self, 
        customer_id: str, 
        token: Optional[str] = None,
        status: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get appointments for a customer"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        params = {"customerId": customer_id}
        if status:
            params["status"] = status
        if from_date:
            params["fromDate"] = from_date.isoformat()
        if to_date:
            params["toDate"] = to_date.isoformat()
        
        return await self._make_request(
            "GET",
            "/api/appointments",
            headers=headers,
            params=params
        )
    
    async def get_appointment_by_id(self, appointment_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Get appointment details by ID"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        return await self._make_request(
            "GET",
            f"/api/appointments/{appointment_id}",
            headers=headers
        )
    
    async def get_appointment_statistics(self, token: Optional[str] = None) -> Dict[str, Any]:
        """Get appointment statistics"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        return await self._make_request(
            "GET",
            "/api/appointments/statistics",
            headers=headers
        )


class VehicleServiceClient(BaseServiceClient):
    """Client for Vehicle Service"""
    
    def __init__(self):
        base_url = os.getenv("VEHICLE_SERVICE_URL", "http://localhost:8084")
        super().__init__("vehicle-service", base_url)
    
    async def get_customer_vehicles(self, customer_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get vehicles for a customer"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        return await self._make_request(
            "GET",
            f"/api/vehicles/customer/{customer_id}",
            headers=headers
        )
    
    async def get_vehicle_by_id(self, vehicle_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Get vehicle details by ID"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        return await self._make_request(
            "GET",
            f"/api/vehicles/{vehicle_id}",
            headers=headers
        )
    
    async def search_vehicles(
        self, 
        registration_number: Optional[str] = None,
        make: Optional[str] = None,
        model: Optional[str] = None,
        token: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search vehicles by various criteria"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        params = {}
        if registration_number:
            params["registrationNumber"] = registration_number
        if make:
            params["make"] = make
        if model:
            params["model"] = model
        
        return await self._make_request(
            "GET",
            "/api/vehicles/search",
            headers=headers,
            params=params
        )


class NotificationServiceClient(BaseServiceClient):
    """Client for Notification Service"""
    
    def __init__(self):
        base_url = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8085")
        super().__init__("notification-service", base_url)
    
    async def get_user_notifications(
        self, 
        user_id: str, 
        token: Optional[str] = None,
        status: Optional[str] = None,
        notification_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get notifications for a user"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        params = {"userId": user_id}
        if status:
            params["status"] = status
        if notification_type:
            params["type"] = notification_type
        
        return await self._make_request(
            "GET",
            "/api/notifications",
            headers=headers,
            params=params
        )
    
    async def get_unread_count(self, user_id: str, token: Optional[str] = None) -> int:
        """Get count of unread notifications"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        response = await self._make_request(
            "GET",
            f"/api/notifications/users/{user_id}/unread-count",
            headers=headers
        )
        return response.get("data", 0)


class ServiceClients:
    """Singleton container for all service clients"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.auth = AuthServiceClient()
            cls._instance.appointment = AppointmentServiceClient()
            cls._instance.vehicle = VehicleServiceClient()
            cls._instance.notification = NotificationServiceClient()
        return cls._instance
    
    async def close_all(self):
        """Close all service clients"""
        await self.auth.close()
        await self.appointment.close()
        await self.vehicle.close()
        await self.notification.close()


# Global instance
service_clients = ServiceClients()