const API_BASE_URL = import.meta.env.VITE_CUSTOMER_API_URL || 'http://localhost:8082/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

class CustomerService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Get customer by email
   * Note: This assumes there's an endpoint to get customer by email
   * If not available, you may need to get all customers and filter
   */
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      // First, try to get all customers and find by email
      // In production, you should add a GET /api/customers?email={email} endpoint
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      const customers: Customer[] = await this.handleResponse<Customer[]>(response);
      const customer = customers.find(c => c.email === email);
      return customer || null;
    } catch (error) {
      console.error('Error fetching customer by email:', error);
      return null;
    }
  }

  /**
   * Get customer ID by email
   */
  async getCustomerIdByEmail(email: string): Promise<number | null> {
    const customer = await this.getCustomerByEmail(email);
    return customer ? customer.id : null;
  }
}

export default new CustomerService();

