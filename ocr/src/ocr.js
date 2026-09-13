import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('spa+eng');
      await worker.setParameters({
        tessedit_pageseg_mode: '4',
        preserve_interword_spaces: '1',
      });
      return worker;
    })();
  }
  return workerPromise;
}

export async function preprocessImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 2600, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .linear(1.25, -20)
    .sharpen({ sigma: 1.2 })
    .png()
    .toBuffer();
}

export async function recognizeImage(buffer) {
  const prepared = await preprocessImage(buffer);
  const worker = await getWorker();
  const result = await worker.recognize(prepared);
  return {
    text: result.data.text || '',
    confidence: result.data.confidence ?? null,
  };
}

export async function shutdownOcr() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
