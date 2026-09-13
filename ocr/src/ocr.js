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

export async function recognizeImage(buffer) {
  const worker = await getWorker();
  const result = await worker.recognize(buffer);
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
