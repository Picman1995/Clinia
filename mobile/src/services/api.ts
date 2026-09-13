const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export type HealthResponse = {
  status: string;
  application: string;
  timezone: string;
};

export type ProfessionalResponse = {
  id: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  specialty: string;
  birthDate: string;
  defaultProfessional: boolean;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>('/api/health'),
  defaultProfessional: () => request<ProfessionalResponse>('/api/professionals/default'),
  getBaseUrl: () => API_URL,
};
