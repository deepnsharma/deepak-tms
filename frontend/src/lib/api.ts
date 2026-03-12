const API_BASE = 'http://localhost:5000/api';

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  // Delivery Orders
  getDeliveryOrders: (transporterId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (transporterId) params.append('transporterId', transporterId);
    if (status) params.append('status', status);
    const qs = params.toString();
    return fetchAPI(`/delivery-orders${qs ? `?${qs}` : ''}`);
  },
  getDeliveryOrder: (id: string) => fetchAPI(`/delivery-orders/${id}`),
  updateDeliveryOrder: (id: string, data: Record<string, unknown>) => 
    fetchAPI(`/delivery-orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  acceptDO: (id: string, data: Record<string, unknown>) => 
    fetchAPI(`/delivery-orders/${id}/accept`, { method: 'POST', body: JSON.stringify(data) }),

  // Transporters
  getTransporters: () => fetchAPI('/transporters'),
  
  // Vehicles
  getVehicles: (transporterId?: string) => 
    fetchAPI(`/vehicles${transporterId ? `?transporterId=${transporterId}` : ''}`),
  addVehicle: (data: Record<string, unknown>) => 
    fetchAPI('/vehicle', { method: 'POST', body: JSON.stringify(data) }),
  deleteVehicle: (id: string) => 
    fetchAPI(`/vehicles/${id}`, { method: 'DELETE' }),

  // Drivers
  getDrivers: (transporterId?: string) => 
    fetchAPI(`/drivers${transporterId ? `?transporterId=${transporterId}` : ''}`),
  addDriver: (data: Record<string, unknown>) => 
    fetchAPI('/driver', { method: 'POST', body: JSON.stringify(data) }),
  deleteDriver: (id: string) => 
    fetchAPI(`/drivers/${id}`, { method: 'DELETE' }),

  // Contracts
  getContracts: (transporterId?: string) => 
    fetchAPI(`/contracts${transporterId ? `?transporterId=${transporterId}` : ''}`),

  // Trips & POD
  getTrips: (transporterId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (transporterId) params.append('transporterId', transporterId);
    if (status) params.append('status', status);
    const qs = params.toString();
    return fetchAPI(`/trips${qs ? `?${qs}` : ''}`);
  },
  submitPod: (id: string, data: Record<string, unknown>) => 
    fetchAPI(`/trips/${id}/pod`, { method: 'POST', body: JSON.stringify(data) }),

  // Invoices
  getInvoices: (transporterId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (transporterId) params.append('transporterId', transporterId);
    if (status) params.append('status', status);
    const qs = params.toString();
    return fetchAPI(`/invoices${qs ? `?${qs}` : ''}`);
  },
  submitInvoice: (data: Record<string, unknown>) => 
    fetchAPI('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  reviewInvoice: (id: string, data: Record<string, unknown>) => 
    fetchAPI(`/invoices/${id}/review`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Bids (Legacy mapping)
  getBids: (doId: string) => fetchAPI(`/bids/${doId}`),
  submitBid: (data: Record<string, unknown>) => 
    fetchAPI('/bid', { method: 'POST', body: JSON.stringify(data) }),
  
  // Assignment (Legacy mapping)
  assignTransporter: (data: Record<string, unknown>) => 
    fetchAPI('/assign-transporter', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  broadcastDO: (order: Record<string, unknown>) => 
    fetchAPI('/notifications/broadcast', { method: 'POST', body: JSON.stringify(order) }),

  // Stats
  getStats: (transporterId?: string) => 
    fetchAPI(`/stats${transporterId ? `?transporterId=${transporterId}` : ''}`),
};
