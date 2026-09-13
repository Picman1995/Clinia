const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const OCR_URL = process.env.EXPO_PUBLIC_OCR_URL ?? 'http://localhost:8090';

export type OcrAppointmentHint = {
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  serviceText?: string | null;
  depositAmount?: number | null;
  depositNote?: string | null;
  statusHint?: string | null;
};

export type OcrPatientCandidate = {
  firstName: string;
  lastName: string;
  fullName?: string;
  documentNumber?: string | null;
  phone?: string | null;
  phones?: string[];
  externalRef?: string | null;
  notes?: string | null;
  appointmentHint?: OcrAppointmentHint;
};

export type OcrAssessment = {
  ok: boolean;
  code?: string | null;
  message?: string | null;
  markerHits?: number;
};

export type OcrExtractResponse = {
  assessment: OcrAssessment;
  source?: string;
  patientsCount: number;
  appointmentsCount?: number;
  patients: OcrPatientCandidate[];
  cliniaPatients: {
    firstName: string;
    lastName: string;
    documentNumber?: string | null;
    phone?: string | null;
    notes?: string | null;
  }[];
  ocr?: {
    confidence?: number | null;
    textPreview?: string;
  };
  rawText?: string;
  message?: string;
};

export function getOcrBaseUrl() {
  return OCR_URL;
}

export function getApiBaseUrl() {
  return API_URL;
}

export async function extractHorariosFromImage(uri: string): Promise<OcrExtractResponse> {
  const form = new FormData();
  form.append('image', {
    uri,
    name: 'horarios.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${OCR_URL}/extract`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: form,
  });

  let payload: OcrExtractResponse;
  try {
    payload = (await response.json()) as OcrExtractResponse;
  } catch {
    throw new Error(`Error OCR HTTP ${response.status}`);
  }

  if (!response.ok) {
    const message =
      payload?.assessment?.message ||
      payload?.message ||
      `Error OCR HTTP ${response.status}`;
    const error = new Error(message) as Error & { payload?: OcrExtractResponse };
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function ocrHealth() {
  const response = await fetch(`${OCR_URL}/health`);
  if (!response.ok) {
    throw new Error(`OCR no disponible (${response.status})`);
  }
  return response.json();
}
