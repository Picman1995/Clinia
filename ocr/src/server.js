import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { recognizeImage, shutdownOcr } from './ocr.js';
import { parseHorariosText, toCliniaPatientPayload } from './parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const app = express();
const port = Number(process.env.PORT || 8090);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    service: 'clinia-ocr',
    template: 'HORARIOS_CONTROLEODONTO',
  });
});

app.post('/parse', (req, res) => {
  const text = req.body?.text;
  if (!text || !String(text).trim()) {
    res.status(400).json({ message: 'Campo text es obligatorio' });
    return;
  }
  const parsed = parseHorariosText(text);
  res.json({
    ...parsed,
    cliniaPatients: parsed.patients.map(toCliniaPatientPayload),
  });
});

app.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Archivo image es obligatorio' });
      return;
    }
    const ocr = await recognizeImage(req.file.buffer);
    const parsed = parseHorariosText(ocr.text);
    res.json({
      ocr: {
        confidence: ocr.confidence,
        textPreview: ocr.text.slice(0, 1200),
      },
      ...parsed,
      cliniaPatients: parsed.patients.map(toCliniaPatientPayload),
      rawText: ocr.text,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : 'Error OCR',
    });
  }
});

app.post('/extract/sample', async (_req, res) => {
  try {
    const samplePath = path.join(rootDir, 'samples', 'horarios-ejemplo.png');
    const buffer = fs.readFileSync(samplePath);
    const ocr = await recognizeImage(buffer);
    const parsed = parseHorariosText(ocr.text);
    res.json({
      sample: samplePath,
      ocr: {
        confidence: ocr.confidence,
        textPreview: ocr.text.slice(0, 1200),
      },
      ...parsed,
      cliniaPatients: parsed.patients.map(toCliniaPatientPayload),
      rawText: ocr.text,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : 'Error OCR sample',
    });
  }
});

app.post('/parse/fixture', (_req, res) => {
  const fixturePath = path.join(rootDir, 'fixtures', 'horarios-ejemplo.txt');
  const text = fs.readFileSync(fixturePath, 'utf8');
  const parsed = parseHorariosText(text);
  res.json({
    fixture: fixturePath,
    ...parsed,
    cliniaPatients: parsed.patients.map(toCliniaPatientPayload),
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`clinia-ocr listening on http://0.0.0.0:${port}`);
});

async function close() {
  await shutdownOcr();
  server.close();
}

process.on('SIGINT', () => {
  close().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  close().finally(() => process.exit(0));
});
