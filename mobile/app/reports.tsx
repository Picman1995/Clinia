import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Card, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '@/src/components/ui';
import { addDays, api, formatGs, ReportResponse, todayPy, toPyOffset } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function ReportsScreen() {
  const { colors } = useThemePreference();
  const [fromDate, setFromDate] = useState(todayPy().slice(0, 8) + '01');
  const [toDate, setToDate] = useState(todayPy());
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const range = useCallback(() => {
    const from = toPyOffset(fromDate, '00:00');
    const to = toPyOffset(addDays(toDate, 1), '00:00');
    return { from, to };
  }, [fromDate, toDate]);

  const load = useCallback(async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
      Alert.alert('Fechas invalidas', 'Usa formato AAAA-MM-DD');
      return;
    }
    setLoading(true);
    try {
      const { from, to } = range();
      setReport(await api.getReport(from, to));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo generar el reporte');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const printReport = async () => {
    setPdfBusy(true);
    try {
      const { from, to } = range();
      await Print.printAsync({ uri: api.getReportPdfUrl(from, to) });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo imprimir el PDF');
    } finally {
      setPdfBusy(false);
    }
  };

  const shareReport = async () => {
    setPdfBusy(true);
    try {
      const { from, to } = range();
      const remote = api.getReportPdfUrl(from, to);
      const local = `${FileSystem.cacheDirectory}clinia-reporte-${fromDate}_${toDate}.pdf`;
      const downloaded = await FileSystem.downloadAsync(remote, local);
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('No disponible', 'Este dispositivo no permite compartir archivos');
        return;
      }
      await Sharing.shareAsync(downloaded.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir reporte Clinia',
        UTI: 'com.adobe.pdf',
      });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo compartir el PDF');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Reportes</Title>
        <Muted>Resumen financiero por periodo</Muted>

        <Field label="Desde (AAAA-MM-DD)" value={fromDate} onChangeText={setFromDate} />
        <Field label="Hasta (AAAA-MM-DD)" value={toDate} onChangeText={setToDate} />
        <PrimaryButton label={loading ? 'Calculando...' : 'Actualizar'} onPress={load} disabled={loading || pdfBusy} />

        {loading && !report ? (
          <ActivityIndicator color={colors.tint} />
        ) : report ? (
          <>
            <Card>
              <Muted>Pacientes atendidos</Muted>
              <Text style={[styles.value, { color: colors.text }]}>{report.patientsAttended}</Text>
              <Muted>Citas atendidas: {report.appointmentsAttended}</Muted>
              <Muted>Servicios realizados: {report.servicesPerformed}</Muted>
              <Muted>Promociones aplicadas: {report.promotionsApplied}</Muted>
            </Card>

            <Card>
              <Muted>Ingresos depilacion</Muted>
              <Text style={[styles.value, { color: colors.text }]}>{formatGs(report.incomeDepilation)}</Text>
              <Muted>Ingresos estetica</Muted>
              <Text style={[styles.value, { color: colors.text }]}>{formatGs(report.incomeAesthetics)}</Text>
              <Muted>Total servicios</Muted>
              <Text style={[styles.value, { color: colors.tint }]}>{formatGs(report.incomeTotal)}</Text>
            </Card>

            <Card>
              <Muted>Pagos recibidos</Muted>
              <Text style={[styles.value, { color: colors.text }]}>{formatGs(report.paymentsReceived)}</Text>
              <Muted>Senas: {formatGs(report.depositsReceived)}</Muted>
              <Muted>Saldos pendientes: {formatGs(report.pendingBalances)}</Muted>
            </Card>

            <Card>
              <Muted>Participacion propietario ({report.ownerCommissionPercentage}%)</Muted>
              <Text style={[styles.value, { color: colors.tint }]}>{formatGs(report.ownerShare)}</Text>
              <Muted>Restante: {formatGs(report.remainingShare)}</Muted>
            </Card>

            <View style={styles.actions}>
              <PrimaryButton
                label={pdfBusy ? 'Preparando PDF...' : 'Imprimir PDF'}
                onPress={printReport}
                disabled={pdfBusy || loading}
              />
              <SecondaryButton
                label="Compartir PDF"
                onPress={shareReport}
                disabled={pdfBusy || loading}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 40,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
