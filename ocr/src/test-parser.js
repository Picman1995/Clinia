import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseHorariosText, toCliniaPatientPayload } from './parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'horarios-ejemplo.txt'), 'utf8');
const result = parseHorariosText(fixture);

assert.ok(result.patientsCount >= 4, `Expected >= 4 patients, got ${result.patientsCount}`);
assert.ok(result.appointmentsCount >= 5, `Expected >= 5 appointments, got ${result.appointmentsCount}`);

const gladys = result.patients.find((p) => p.fullName.toLowerCase().includes('gladys'));
assert.ok(gladys, 'Gladys not found');
assert.equal(gladys.documentNumber, null);
assert.equal(gladys.phone, '0982767548');
assert.equal(gladys.externalRef, '003875');
assert.equal(gladys.firstName, 'Gladys Beatriz');
assert.equal(gladys.lastName, 'Solis Aquino');
assert.equal(gladys.appointmentHint.depositAmount, 150000);
assert.equal(gladys.appointmentHint.statusHint, 'CONFIRMADA');

const luis = result.patients.find((p) => p.fullName.toLowerCase().includes('luis'));
assert.ok(luis, 'Luis not found');
assert.ok(luis.phone.includes('0981234567'));
assert.equal(luis.appointmentHint.depositAmount, 50000);

const junk = parseHorariosText(`
12/9/2026
9:00 a.m. - 9:40 a.m.
Sena En Efectivo - 009999 -> CONFIRMADO
(981)111-222
DEPILACION ZONA INTIMA seña 50.000 gs en efectivo
Lic. Maria
`);
assert.equal(
  junk.patients.filter((p) => /sena|efectivo|^en$/i.test(p.fullName)).length,
  0,
  'Deposit phrases must not become patient names'
);

const payload = toCliniaPatientPayload(gladys);
assert.equal(payload.documentNumber, null);

console.log(
  JSON.stringify(
    {
      ok: true,
      patientsCount: result.patientsCount,
      appointmentsCount: result.appointmentsCount,
      patients: result.patients.map((p) => ({
        name: p.fullName,
        phone: p.phone,
        externalRef: p.externalRef,
        clinia: toCliniaPatientPayload(p),
      })),
      appointments: result.appointments,
    },
    null,
    2
  )
);
