// API client for backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// Note: Authentication is handled server-side via session/JWT
// Client no longer sends family secret in headers

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ApiError extends Error {
  statusCode?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const error: ApiError = new Error(errorData.error || 'API request failed');
        error.statusCode = response.status;
        return { data: null, error };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: null as T, error: null };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Flights API
  flights = {
    getAll: () => this.get<any[]>('/api/flights'),
    getById: (id: string) => this.get<any>(`/api/flights/${id}`),
    getByTerm: (termId: string) => this.get<any[]>(`/api/flights/term/${termId}`),
    create: (data: any) => this.post<any>('/api/flights', data),
    update: (id: string, data: any) => this.put<any>(`/api/flights/${id}`, data),
    delete: (id: string) => this.delete<void>(`/api/flights/${id}`),
  };

  // Transport API
  transport = {
    getAll: () => this.get<any[]>('/api/transport'),
    getById: (id: string) => this.get<any>(`/api/transport/${id}`),
    getByTerm: (termId: string) => this.get<any[]>(`/api/transport/term/${termId}`),
    create: (data: any) => this.post<any>('/api/transport', data),
    update: (id: string, data: any) => this.put<any>(`/api/transport/${id}`, data),
    delete: (id: string) => this.delete<void>(`/api/transport/${id}`),
  };

  // Service Providers API
  serviceProviders = {
    getAll: () => this.get<any[]>('/api/service-providers'),
    getById: (id: string) => this.get<any>(`/api/service-providers/${id}`),
    getByType: (type: string) => this.get<any[]>(`/api/service-providers/type/${type}`),
    search: (query: string) => this.get<any[]>(`/api/service-providers/search?q=${encodeURIComponent(query)}`),
    create: (data: any) => this.post<any>('/api/service-providers', data),
    update: (id: string, data: any) => this.put<any>(`/api/service-providers/${id}`, data),
    deactivate: (id: string) => this.delete<any>(`/api/service-providers/${id}`),
  };

  // Not Travelling API
  notTravelling = {
    getAll: () => this.get<any[]>('/api/not-travelling'),
    getByTerm: (termId: string) => this.get<any>(`/api/not-travelling/term/${termId}`),
    upsert: (data: any) => this.post<any>('/api/not-travelling', data),
    clear: (termId: string, data?: { type?: 'flights' | 'transport' | 'both' }) =>
      this.put<any>(`/api/not-travelling/term/${termId}/clear`, data ?? {}),
    delete: (termId: string) => this.delete<void>(`/api/not-travelling/term/${termId}`),
  };
}

export const apiClient = new ApiClient(API_URL);
