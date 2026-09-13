const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export type EntityStatus = 'ACTIVO' | 'INACTIVO';
export type ServiceCategoryType = 'DEPILACION' | 'ESTETICA';

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

export type PatientResponse = {
  id: number;
  firstName: string;
  lastName: string;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  address?: string | null;
  notes?: string | null;
  registeredAt: string;
  status: EntityStatus;
};

export type PatientRequest = {
  firstName: string;
  lastName: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
};

export type ServiceCategoryResponse = {
  id: number;
  name: string;
  type: ServiceCategoryType;
  description?: string | null;
  status: EntityStatus;
};

export type ServiceResponse = {
  id: number;
  name: string;
  description?: string | null;
  categoryId: number;
  categoryName: string;
  categoryType: ServiceCategoryType;
  durationMinutes: number;
  price: number;
  status: EntityStatus;
};

export type ServiceRequest = {
  name: string;
  description?: string;
  categoryId: number;
  durationMinutes: number;
  price: number;
};

export type ServiceZoneResponse = {
  id: number;
  name: string;
  description?: string | null;
  serviceId: number;
  serviceName: string;
  price: number;
  durationMinutes: number;
  status: EntityStatus;
};

export type ServiceZoneRequest = {
  name: string;
  description?: string;
  serviceId: number;
  price: number;
  durationMinutes: number;
};

export type AppointmentStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

export type PaymentStatus =
  | 'PENDIENTE'
  | 'SENIA_PAGADA'
  | 'PAGADO'
  | 'PAGO_PARCIAL'
  | 'CANCELADO';

export type AppointmentItemRequest = {
  serviceId?: number;
  serviceZoneId?: number;
  quantity?: number;
};

export type AppointmentRequest = {
  patientId: number;
  professionalId?: number;
  promotionId?: number;
  startAt: string;
  depositAmount: number;
  notes?: string;
  items: AppointmentItemRequest[];
  rescheduleFromAppointmentId?: number;
};

export type AppointmentItemResponse = {
  id: number;
  serviceId?: number | null;
  serviceZoneId?: number | null;
  nameSnapshot: string;
  durationMinutes: number;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotalSnapshot: number;
};

export type AppointmentResponse = {
  id: number;
  patientId: number;
  patientName: string;
  patientDocument?: string | null;
  professionalId: number;
  professionalName: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  balanceAmount: number;
  appointmentStatus: AppointmentStatus;
  paymentStatus: PaymentStatus;
  notes?: string | null;
  promotionNameSnapshot?: string | null;
  items: AppointmentItemResponse[];
};

export type PaymentType = 'SENIA' | 'PARCIAL' | 'FINAL' | 'OTRO';

export type PromotionItemResponse = {
  id: number;
  serviceId?: number | null;
  serviceName?: string | null;
  serviceZoneId?: number | null;
  serviceZoneName?: string | null;
};

export type PromotionResponse = {
  id: number;
  name: string;
  description?: string | null;
  normalPrice: number;
  promotionalPrice: number;
  startDate?: string | null;
  endDate?: string | null;
  status: EntityStatus;
  items: PromotionItemResponse[];
};

export type PromotionRequest = {
  name: string;
  description?: string;
  normalPrice: number;
  promotionalPrice: number;
  startDate?: string;
  endDate?: string;
  items?: { serviceId?: number; serviceZoneId?: number }[];
};

export type PaymentResponse = {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  amount: number;
  paymentType: PaymentType;
  paidAt: string;
  notes?: string | null;
  status: EntityStatus;
};

export type PaymentCreateRequest = {
  appointmentId: number;
  amount: number;
  paymentType: PaymentType;
  paidAt?: string;
  notes?: string;
};

export type SessionStatus = 'PENDIENTE' | 'REALIZADA' | 'CANCELADA';

export type TreatmentSessionResponse = {
  id: number;
  sessionNumber: number;
  sessionStatus: SessionStatus;
  performedAt?: string | null;
  appointmentId?: number | null;
  notes?: string | null;
};

export type TreatmentPackageResponse = {
  id: number;
  patientId: number;
  patientName: string;
  serviceId?: number | null;
  serviceName?: string | null;
  name: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  totalPrice: number;
  notes?: string | null;
  status: EntityStatus;
  sessions: TreatmentSessionResponse[];
};

export type TreatmentPackageRequest = {
  patientId: number;
  serviceId?: number;
  name: string;
  totalSessions: number;
  totalPrice: number;
  notes?: string;
};

export type PatientHistoryResponse = {
  patientId: number;
  patientName: string;
  packages: TreatmentPackageResponse[];
  upcomingAppointments: AppointmentResponse[];
  recentAppointments: AppointmentResponse[];
  recentPayments: PaymentResponse[];
};

export type DashboardResponse = {
  date: string;
  appointmentsToday: number;
  patientsToday: number;
  servicesToday: number;
  incomeToday: number;
  depositsToday: number;
  pendingBalances: number;
  pendingDepositAppointments: number;
  professionalName: string;
};

export type ReportResponse = {
  from: string;
  to: string;
  patientsAttended: number;
  servicesPerformed: number;
  appointmentsAttended: number;
  promotionsApplied: number;
  incomeDepilation: number;
  incomeAesthetics: number;
  incomeTotal: number;
  depositsReceived: number;
  paymentsReceived: number;
  pendingBalances: number;
  ownerCommissionPercentage: number;
  ownerShare: number;
  remainingShare: number;
};

export type BusinessSettingResponse = {
  key: string;
  value: string;
  description?: string | null;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.length > 0) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getBaseUrl: () => API_URL,
  health: () => request<HealthResponse>('/api/health'),
  defaultProfessional: () => request<ProfessionalResponse>('/api/professionals/default'),

  searchPatients: (q?: string, status?: EntityStatus) =>
    request<PatientResponse[]>('/api/patients', { query: { q, status } }),
  getPatient: (id: number) => request<PatientResponse>(`/api/patients/${id}`),
  createPatient: (body: PatientRequest) =>
    request<PatientResponse>('/api/patients', { method: 'POST', body }),
  updatePatient: (id: number, body: PatientRequest) =>
    request<PatientResponse>(`/api/patients/${id}`, { method: 'PUT', body }),
  deactivatePatient: (id: number) =>
    request<PatientResponse>(`/api/patients/${id}/deactivate`, { method: 'POST' }),
  activatePatient: (id: number) =>
    request<PatientResponse>(`/api/patients/${id}/activate`, { method: 'POST' }),

  listCategories: (status?: EntityStatus) =>
    request<ServiceCategoryResponse[]>('/api/service-categories', { query: { status } }),
  searchServices: (params?: {
    q?: string;
    categoryId?: number;
    type?: ServiceCategoryType;
    status?: EntityStatus;
  }) => request<ServiceResponse[]>('/api/services', { query: params }),
  getService: (id: number) => request<ServiceResponse>(`/api/services/${id}`),
  createService: (body: ServiceRequest) =>
    request<ServiceResponse>('/api/services', { method: 'POST', body }),
  updateService: (id: number, body: ServiceRequest) =>
    request<ServiceResponse>(`/api/services/${id}`, { method: 'PUT', body }),
  deactivateService: (id: number) =>
    request<ServiceResponse>(`/api/services/${id}/deactivate`, { method: 'POST' }),
  activateService: (id: number) =>
    request<ServiceResponse>(`/api/services/${id}/activate`, { method: 'POST' }),
  searchZones: (serviceId?: number, status?: EntityStatus) =>
    request<ServiceZoneResponse[]>('/api/service-zones', { query: { serviceId, status } }),
  getZone: (id: number) => request<ServiceZoneResponse>(`/api/service-zones/${id}`),
  createZone: (body: ServiceZoneRequest) =>
    request<ServiceZoneResponse>('/api/service-zones', { method: 'POST', body }),
  updateZone: (id: number, body: ServiceZoneRequest) =>
    request<ServiceZoneResponse>(`/api/service-zones/${id}`, { method: 'PUT', body }),
  deactivateZone: (id: number) =>
    request<ServiceZoneResponse>(`/api/service-zones/${id}/deactivate`, { method: 'POST' }),
  activateZone: (id: number) =>
    request<ServiceZoneResponse>(`/api/service-zones/${id}/activate`, { method: 'POST' }),

  listAppointments: (from: string, to: string, professionalId?: number) =>
    request<AppointmentResponse[]>('/api/appointments', { query: { from, to, professionalId } }),
  getAppointment: (id: number) => request<AppointmentResponse>(`/api/appointments/${id}`),
  createAppointment: (body: AppointmentRequest) =>
    request<AppointmentResponse>('/api/appointments', { method: 'POST', body }),
  updateAppointmentStatus: (
    id: number,
    appointmentStatus: AppointmentStatus,
    options?: { treatmentPackageId?: number; sessionNotes?: string }
  ) =>
    request<AppointmentResponse>(`/api/appointments/${id}/status`, {
      method: 'PUT',
      body: {
        appointmentStatus,
        treatmentPackageId: options?.treatmentPackageId,
        sessionNotes: options?.sessionNotes,
      },
    }),

  listPromotions: (params?: { status?: EntityStatus; onlyValidToday?: boolean }) =>
    request<PromotionResponse[]>('/api/promotions', { query: params }),
  getPromotion: (id: number) => request<PromotionResponse>(`/api/promotions/${id}`),
  createPromotion: (body: PromotionRequest) =>
    request<PromotionResponse>('/api/promotions', { method: 'POST', body }),
  updatePromotion: (id: number, body: PromotionRequest) =>
    request<PromotionResponse>(`/api/promotions/${id}`, { method: 'PUT', body }),
  deactivatePromotion: (id: number) =>
    request<PromotionResponse>(`/api/promotions/${id}/deactivate`, { method: 'POST' }),

  listPayments: (params: { appointmentId?: number; patientId?: number }) =>
    request<PaymentResponse[]>('/api/payments', { query: params }),
  createPayment: (body: PaymentCreateRequest) =>
    request<PaymentResponse>('/api/payments', { method: 'POST', body }),

  getPatientHistory: (id: number) => request<PatientHistoryResponse>(`/api/patients/${id}/history`),
  listTreatmentPackages: (patientId: number, status?: EntityStatus) =>
    request<TreatmentPackageResponse[]>('/api/treatment-packages', { query: { patientId, status } }),
  getTreatmentPackage: (id: number) =>
    request<TreatmentPackageResponse>(`/api/treatment-packages/${id}`),
  createTreatmentPackage: (body: TreatmentPackageRequest) =>
    request<TreatmentPackageResponse>('/api/treatment-packages', { method: 'POST', body }),
  deactivateTreatmentPackage: (id: number) =>
    request<TreatmentPackageResponse>(`/api/treatment-packages/${id}/deactivate`, { method: 'POST' }),
  completeTreatmentSession: (id: number, body?: { appointmentId?: number; notes?: string }) =>
    request<TreatmentSessionResponse>(`/api/treatment-sessions/${id}/complete`, {
      method: 'POST',
      body: body ?? {},
    }),
  cancelTreatmentSession: (id: number) =>
    request<TreatmentSessionResponse>(`/api/treatment-sessions/${id}/cancel`, { method: 'POST' }),

  getDashboard: (date?: string) =>
    request<DashboardResponse>('/api/dashboard', { query: { date } }),
  getReport: (from: string, to: string) =>
    request<ReportResponse>('/api/reports', { query: { from, to } }),
  getReportPdfUrl: (from: string, to: string) =>
    buildUrl('/api/reports/pdf', { from, to }),
  listSettings: () => request<BusinessSettingResponse[]>('/api/settings'),
  getSetting: (key: string) => request<BusinessSettingResponse>(`/api/settings/${key}`),
  updateSetting: (key: string, value: string) =>
    request<BusinessSettingResponse>(`/api/settings/${key}`, {
      method: 'PUT',
      body: { value },
    }),
};

export function formatGs(amount: number | string) {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`;
}

export function toPyOffset(date: string, time: string) {
  return `${date}T${time}:00-03:00`;
}

export function dayRange(date: string) {
  const next = addDays(date, 1);
  return {
    from: toPyOffset(date, '00:00'),
    to: toPyOffset(next, '00:00'),
  };
}

export function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function todayPy() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-PY', {
    timeZone: 'America/Asuncion',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
