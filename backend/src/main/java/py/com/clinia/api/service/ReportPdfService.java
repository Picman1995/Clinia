package py.com.clinia.api.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import py.com.clinia.api.dto.ReportResponse;
import py.com.clinia.api.exception.BusinessException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class ReportPdfService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Locale LOCALE_PY = Locale.forLanguageTag("es-PY");

    public byte[] build(ReportResponse report) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);

            Paragraph title = new Paragraph("Clinia - Reporte financiero", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph(
                    "Periodo: " + formatDate(report.from()) + " a " + formatDate(report.to()),
                    normalFont
            ));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Atenciones", sectionFont));
            document.add(table(new String[]{
                    "Pacientes atendidos",
                    String.valueOf(report.patientsAttended()),
                    "Citas atendidas",
                    String.valueOf(report.appointmentsAttended()),
                    "Servicios realizados",
                    String.valueOf(report.servicesPerformed()),
                    "Promociones aplicadas",
                    String.valueOf(report.promotionsApplied())
            }));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Ingresos por servicios", sectionFont));
            document.add(table(new String[]{
                    "Depilacion",
                    money(report.incomeDepilation()),
                    "Estetica",
                    money(report.incomeAesthetics()),
                    "Total servicios",
                    money(report.incomeTotal())
            }));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Caja y saldos", sectionFont));
            document.add(table(new String[]{
                    "Pagos recibidos",
                    money(report.paymentsReceived()),
                    "Senas recibidas",
                    money(report.depositsReceived()),
                    "Saldos pendientes",
                    money(report.pendingBalances())
            }));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Participacion propietario", sectionFont));
            document.add(table(new String[]{
                    "Porcentaje",
                    report.ownerCommissionPercentage().stripTrailingZeros().toPlainString() + " %",
                    "Ganancia propietario",
                    money(report.ownerShare()),
                    "Restante",
                    money(report.remainingShare())
            }));

            document.close();
            return output.toByteArray();
        } catch (DocumentException | java.io.IOException ex) {
            throw new BusinessException("No se pudo generar el PDF del reporte");
        }
    }

    private PdfPTable table(String[] pairs) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 2f});
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

        for (int i = 0; i < pairs.length; i += 2) {
            PdfPCell label = new PdfPCell(new Phrase(pairs[i], labelFont));
            PdfPCell value = new PdfPCell(new Phrase(pairs[i + 1], valueFont));
            label.setPadding(8);
            value.setPadding(8);
            label.setBorderColor(new Color(210, 210, 210));
            value.setBorderColor(new Color(210, 210, 210));
            table.addCell(label);
            table.addCell(value);
        }
        return table;
    }

    private String money(BigDecimal amount) {
        return NumberFormat.getNumberInstance(LOCALE_PY).format(amount) + " Gs.";
    }

    private String formatDate(OffsetDateTime value) {
        return DATE_TIME.format(value);
    }
}
