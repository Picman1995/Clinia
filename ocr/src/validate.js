function assessHorariosDocument(ocrText, confidence, patientsCount) {
  const text = String(ocrText || '').toLowerCase();
  const markers = [
    'horario',
    'paciente',
    'depilacion',
    'depilación',
    'confirmado',
    'controleodonto',
    'innovare',
    'tipo de servicio',
    'registro',
  ];
  const markerHits = markers.filter((marker) => text.includes(marker)).length;
  const score = Number(confidence ?? 0);

  if (score > 0 && score < 35) {
    return {
      ok: false,
      code: 'BLURRY',
      message: 'La imagen parece borrosa o ilegible. Sacá otra foto con mejor luz, enfoque y sin movimiento.',
      markerHits,
    };
  }

  if (markerHits < 2 && patientsCount === 0) {
    return {
      ok: false,
      code: 'NOT_HORARIOS',
      message: 'No parece una hoja de HORARIOS ControleODONTO. Fotografiá la planilla correcta completa.',
      markerHits,
    };
  }

  if (patientsCount === 0) {
    return {
      ok: false,
      code: 'NO_PATIENTS',
      message: 'No se detectaron pacientes. Encuadrá toda la tabla y volvé a intentar.',
      markerHits,
    };
  }

  return {
    ok: true,
    code: null,
    message: null,
    markerHits,
  };
}

export { assessHorariosDocument };
