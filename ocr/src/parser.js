const PHONE_RE = /\((\d{3})\)\s*(\d{3})[-\s]?(\d{3,4})/g;
const EXTERNAL_ID_RE = /\b(\d{6})\b/;
const DATE_RE = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g;
const TIME_RANGE_RE =
  /(\d{1,2}):(\d{2})\s*([ap])\.?\s*m\.?\s*[-–]\s*(\d{1,2}):(\d{2})\s*([ap])\.?\s*m\.?/i;
const DEPOSIT_RE =
  /se[nñ][oa]?\s*([\d.]+)\s*(?:gs\.?)?(?:\s+(?:por\s+)?(transf(?:erencia)?|\s*en\s+efectivo|efectivo))?/i;
const CONFIRMADO_RE = /confirmado/i;
const SERVICE_HINT_RE = /(DEPILACION|DEPILACIÓN|EVALUACI[OÓ]N|ESTETICA|ESTÉTICA)/i;
const NOISE_RE =
  /innovare|controleodonto|horarios|paciente|tipo de servicio|seguro|registro|emitido|aplicativo|lic\.\s*maria|confirmado|fecha|depilacion|depilación|evaluaci|zonas grandes|cuerpo completo|se[nñ][oa]|efectivo|transferencia|plataforma/i;
const NAME_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'da', 'do', 'das', 'dos']);
const NAME_STOPWORDS = new Set([
  'en',
  'el',
  'por',
  'con',
  'para',
  'una',
  'uno',
  'al',
  'sena',
  'seno',
  'seña',
  'señe',
  'gs',
  'am',
  'pm',
  'transf',
  'transferencia',
  'efectivo',
  'confirmado',
  'fecha',
  'paciente',
  'tipo',
  'servicio',
  'seguro',
  'registro',
  'emitido',
  'horarios',
  'controleodonto',
  'innovare',
  'aplicativo',
  'traves',
  'través',
  'plataforma',
  'https',
  'http',
  'lic',
  'net',
  'co',
  'ita',
]);
const IGNORED_PHONES = new Set(['0985400614']);

function to24h(hour, minute, ampm) {
  let h = Number(hour);
  const m = Number(minute);
  const period = ampm.toLowerCase();
  if (period === 'p' && h < 12) {
    h += 12;
  }
  if (period === 'a' && h === 12) {
    h = 0;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function normalizeDate(day, month, yearRaw) {
  let year = Number(yearRaw);
  if (year < 100) {
    year += 2000;
  }
  return `${year}-${String(Number(month)).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
}

function normalizePhone(match) {
  return `0${match[1]}${match[2]}${match[3]}`;
}

function extractPhones(text) {
  const phones = [];
  const re = new RegExp(PHONE_RE.source, 'g');
  let match;
  while ((match = re.exec(text)) !== null) {
    phones.push(normalizePhone(match));
  }
  return [...new Set(phones)];
}

function extractDeposit(text) {
  const match = text.match(DEPOSIT_RE);
  if (!match) {
    return { depositAmount: null, depositNote: null };
  }
  const amount = Number(match[1].replace(/\./g, ''));
  const lower = text.toLowerCase();
  let depositNote = null;
  if (/transf/.test(lower)) {
    depositNote = 'por transferencia';
  } else if (/efectivo/.test(lower)) {
    depositNote = 'en efectivo';
  }
  return {
    depositAmount: Number.isFinite(amount) ? amount : null,
    depositNote,
  };
}

function isNameParticle(word) {
  return NAME_PARTICLES.has(word.toLowerCase());
}

function isNameStopword(word) {
  return NAME_STOPWORDS.has(word.toLowerCase());
}

function cleanNameCandidate(raw) {
  if (!raw) {
    return null;
  }
  let value = String(raw)
    .replace(/[()]/g, ' ')
    .replace(/->/g, ' ')
    .replace(CONFIRMADO_RE, ' ')
    .replace(DEPOSIT_RE, ' ')
    .replace(EXTERNAL_ID_RE, ' ')
    .replace(new RegExp(PHONE_RE.source, 'g'), ' ')
    .replace(/[-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  value = value.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+|[^A-Za-zÁÉÍÓÚÑáéíóúñ]+$/g, '').trim();
  if (value.length < 5 || NOISE_RE.test(value)) {
    return null;
  }
  const words = value.split(/\s+/);
  if (words.length < 2 || words.length > 8) {
    return null;
  }
  if (!words.every((w) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]+$/.test(w))) {
    return null;
  }
  if (words.some((w) => isNameStopword(w))) {
    return null;
  }
  if (isNameParticle(words[0]) || isNameParticle(words[words.length - 1])) {
    return null;
  }
  const significant = words.filter((w) => !isNameParticle(w));
  if (significant.length < 2 || significant.some((w) => w.length < 3)) {
    return null;
  }
  return words.join(' ');
}

function scoreName(name) {
  let score = name.length + name.split(/\s+/).length * 3;
  if (/[a-záéíóúñ]/.test(name) && /[A-ZÁÉÍÓÚÑ]/.test(name)) {
    score += 25;
  }
  if (name === name.toUpperCase()) {
    score -= 15;
  }
  return score;
}

function pickBestName(candidates) {
  const cleaned = [...new Set(candidates.map(cleanNameCandidate).filter(Boolean))];
  if (cleaned.length === 0) {
    return null;
  }
  cleaned.sort((a, b) => scoreName(b) - scoreName(a));
  return cleaned[0];
}

function splitName(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  if (parts.length === 3) {
    return { firstName: parts[0], lastName: `${parts[1]} ${parts[2]}` };
  }
  return {
    firstName: `${parts[0]} ${parts[1]}`,
    lastName: parts.slice(2).join(' '),
  };
}

function titleCaseWords(value) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractNameFromBlock(nameZone) {
  const afterParen = [...nameZone.matchAll(/\)\s*([A-Za-zÁÉÍÓÚÑáéíóúñ ]{5,}?)(?=\s*-\s*\d{6}|\s*$|\n)/g)].map(
    (m) => m[1]
  );
  const parenNames = [...nameZone.matchAll(/\(([A-Za-zÁÉÍÓÚÑáéíóúñ ]{5,})\)/g)].map((m) => m[1]);
  const dashed = [...nameZone.matchAll(/([A-Za-zÁÉÍÓÚÑáéíóúñ ]{5,}?)\s*-\s*\d{6}/g)].map((m) => m[1]);
  const plainChunks = nameZone
    .split(/\n/)
    .flatMap((line) => line.split(/\s{2,}/))
    .map((chunk) => chunk.replace(/\(.*?\)/g, ' ').trim());
  return pickBestName([...afterParen, ...dashed, ...parenNames, ...plainChunks]);
}

function extractService(serviceZone) {
  const lines = serviceZone
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const serviceLine = lines.find((line) => SERVICE_HINT_RE.test(line));
  if (!serviceLine) {
    return null;
  }
  return serviceLine
    .replace(DEPOSIT_RE, '')
    .replace(/Lic\.\s*Maria/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSchedule(block) {
  const timeMatch = block.match(TIME_RANGE_RE);
  if (!timeMatch) {
    const dates = [...block.matchAll(DATE_RE)];
    return {
      date: dates[0] ? normalizeDate(dates[0][1], dates[0][2], dates[0][3]) : null,
      startTime: null,
      endTime: null,
    };
  }
  const around = block.slice(Math.max(0, timeMatch.index - 40), timeMatch.index + timeMatch[0].length);
  const nearDates = [...around.matchAll(DATE_RE)];
  const dateMatch = nearDates[nearDates.length - 1];
  return {
    date: dateMatch ? normalizeDate(dateMatch[1], dateMatch[2], dateMatch[3]) : null,
    startTime: to24h(timeMatch[1], timeMatch[2], timeMatch[3]),
    endTime: to24h(timeMatch[4], timeMatch[5], timeMatch[6]),
  };
}

function splitBlocks(text) {
  const normalized = String(text || '').replace(/\r/g, '\n');
  const phoneMatches = [...normalized.matchAll(new RegExp(PHONE_RE.source, 'g'))];
  if (phoneMatches.length === 0) {
    return [];
  }
  const blocks = [];
  for (let i = 0; i < phoneMatches.length; i += 1) {
    const phoneMatch = phoneMatches[i];
    const prevEnd =
      i === 0 ? 0 : phoneMatches[i - 1].index + phoneMatches[i - 1][0].length;
    const nextStart = i + 1 < phoneMatches.length ? phoneMatches[i + 1].index : normalized.length;
    const phoneEnd = phoneMatch.index + phoneMatch[0].length;
    const nameZone = normalized.slice(prevEnd, phoneMatch.index);
    const serviceZone = normalized.slice(phoneEnd, nextStart);
    const full = normalized.slice(prevEnd, nextStart);
    blocks.push({
      full,
      nameZone,
      serviceZone,
      phoneText: phoneMatch[0],
    });
  }
  return blocks;
}

export function parseHorariosText(rawText) {
  const blocks = splitBlocks(rawText);
  const rows = [];
  const patientsByKey = new Map();

  for (const block of blocks) {
    const phones = extractPhones(block.phoneText).filter((phone) => !IGNORED_PHONES.has(phone));
    if (phones.length === 0) {
      continue;
    }
    const extraPhones = extractPhones(block.nameZone + '\n' + block.serviceZone).filter(
      (phone) => !phones.includes(phone) && !IGNORED_PHONES.has(phone)
    );
    const allPhones = [...phones, ...extraPhones];
    const rawName = extractNameFromBlock(block.nameZone);
    if (!rawName) {
      continue;
    }
    const fullName = titleCaseWords(rawName);
    const externalIdMatch = block.nameZone.match(EXTERNAL_ID_RE);
    const externalRef = externalIdMatch ? externalIdMatch[1] : null;
    const { firstName, lastName } = splitName(fullName);
    const schedule = extractSchedule(block.full);
    const deposit = extractDeposit(block.serviceZone);
    const serviceText = extractService(block.serviceZone);
    const noteParts = [];
    if (externalRef) {
      noteParts.push(`Ref externa: ${externalRef}`);
    }
    noteParts.push('Origen OCR HORARIOS ControleODONTO');

    const row = {
      firstName,
      lastName,
      fullName,
      documentNumber: null,
      phone: allPhones.join(' / '),
      phones: allPhones,
      externalRef,
      notes: noteParts.join(' | '),
      appointmentHint: {
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        serviceText,
        depositAmount: deposit.depositAmount,
        depositNote: deposit.depositNote,
        statusHint: CONFIRMADO_RE.test(block.full) ? 'CONFIRMADA' : 'PENDIENTE',
      },
      confidence: {
        name: 0.85,
        phone: 0.9,
        externalRef: externalRef ? 0.75 : 0,
        schedule: schedule.date && schedule.startTime ? 0.75 : 0.35,
        deposit: deposit.depositAmount != null ? 0.75 : 0.2,
      },
    };

    rows.push(row);

    const key = allPhones[0];
    const previous = patientsByKey.get(key);
    if (!previous || scoreName(fullName) > scoreName(previous.fullName)) {
      patientsByKey.set(key, row);
    }
  }

  const patients = [...patientsByKey.values()];

  return {
    source: 'HORARIOS_CONTROLEODONTO',
    patientsCount: patients.length,
    appointmentsCount: rows.length,
    patients,
    appointments: rows.map((row) => ({
      patientName: row.fullName,
      phone: row.phone,
      externalRef: row.externalRef,
      ...row.appointmentHint,
    })),
  };
}

export function toCliniaPatientPayload(patient) {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    documentNumber: null,
    phone: patient.phone,
    notes: patient.notes,
  };
}
