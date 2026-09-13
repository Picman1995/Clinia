import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { recognizeImage, shutdownOcr } from './ocr.js';
import { parseHorariosText, toCliniaPatientPayload } from './parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.join(__dirname, '..', 'samples', 'horarios-ejemplo.png');

const buffer = fs.readFileSync(samplePath);
const ocr = await recognizeImage(buffer);
const parsed = parseHorariosText(ocr.text);

console.log(
  JSON.stringify(
    {
      sample: samplePath,
      ocrConfidence: ocr.confidence,
      patientsCount: parsed.patientsCount,
      cliniaPatients: parsed.patients.map(toCliniaPatientPayload),
      textPreview: ocr.text.slice(0, 800),
    },
    null,
    2
  )
);

await shutdownOcr();
