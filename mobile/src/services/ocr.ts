import * as FileSystem from 'expo-file-system/legacy';

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

function parseOcrPayload(body: string, status: number): OcrExtractResponse {
  let payload: OcrExtractResponse;
  try {
    payload = JSON.parse(body) as OcrExtractResponse;
  } catch {
    throw new Error(`Error OCR HTTP ${status}`);
  }

  if (status < 200 || status >= 300) {
    const message =
      payload?.assessment?.message || payload?.message || `Error OCR HTTP ${status}`;
    const error = new Error(message) as Error & { payload?: OcrExtractResponse };
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function extractHorariosFromImage(uri: string): Promise<OcrExtractResponse> {
  const upload = await FileSystem.uploadAsync(`${OCR_URL}/extract`, uri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'image',
    mimeType: 'image/jpeg',
    headers: {
      Accept: 'application/json',
    },
  });

  return parseOcrPayload(upload.body, upload.status);
}

export async function ocrHealth() {
  const response = await fetch(`${OCR_URL}/health`);
  if (!response.ok) {
    throw new Error(`OCR no disponible (${response.status})`);
  }
  return response.json();
}
