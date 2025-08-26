import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';
import { NextRequest } from 'next/server';
import calculateAge from '@/app/services/calculateAge';

export async function POST(request: NextRequest) {
    const { dentista, paciente, medicamentos, observaciones, advertencias, fecha_vencimiento } = await request.json();

    if (!paciente || !paciente.nombre || !paciente.apellido || !medicamentos || !observaciones || !advertencias || !fecha_vencimiento) {
        return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 612;
    const pageHeight = 792;
    const marginX = 60;
    const minY = 100;
    const fontSize = 10;
    const lineHeight = 18;

    const pages: PDFPage[] = [];
    let page = document.addPage([pageWidth, pageHeight]);
    pages.push(page);
    let cursorY = pageHeight - 60;

    const drawCentered = (text: string, size: number, y: number, color = rgb(0, 0, 0), font: PDFFont) => {
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, { x: (pageWidth - textWidth) / 2, y, size, font, color });
    };

    const drawRightAligned = (label: string, value: string | number, y: number) => {
        const labelWidth = bold.widthOfTextAtSize(label, fontSize);
        const valueStr = String(value);
        const valueWidth = font.widthOfTextAtSize(valueStr, fontSize);
        const totalWidth = labelWidth + valueWidth + 4;
        const x = pageWidth - marginX - totalWidth;

        page.drawText(label, { x, y, size: fontSize, font: bold });
        page.drawText(valueStr, { x: x + labelWidth + 2, y, size: fontSize, font });
    };

    const writeMultilineText = (lines: string[]) => {
        for (const line of lines) {
            if (cursorY < minY) {
                page = document.addPage([pageWidth, pageHeight]);
                pages.push(page);
                cursorY = pageHeight - 60;
            }

            page.drawText(line, { x: marginX, y: cursorY, size: 10, font, color: rgb(0, 0, 0) });

            cursorY -= lineHeight;
        }
    };

    // Header
    drawCentered('CLÍNICA ODONTOLÓGICA MAVAREZ & ROMÁN', 12, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 22;
    drawCentered(`Od. ${dentista}`, 12, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 20;
    drawCentered('Barquisimeto, Edo. Lara', 10, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 20;
    page.drawLine({ start: { x: marginX, y: cursorY }, end: { x: pageWidth - marginX, y: cursorY }, thickness: 1, color: rgb(0, 0, 0) });

    // Issue
    cursorY -= 40;
    drawCentered("RÉCIPE", 12, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 40;

    // Patient data
    drawRightAligned('Fecha de vencimiento: ', `${new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(fecha_vencimiento))}`, cursorY);
    cursorY -= 15;
    drawRightAligned('Paciente: ', `${paciente.nombre} ${paciente.apellido}`, cursorY);
    cursorY -= 15;
    drawRightAligned('Cédula de Identidad: ', paciente.cedula || '-', cursorY);
    cursorY -= 15;
    drawRightAligned('Edad: ', `${calculateAge(paciente.fecha_nacimiento)} años`, cursorY);
    cursorY -= 45;

    // Content
    const maxWidth = pageWidth - marginX;
    let lines: string[] = [];

    // Medicines table
    drawCentered("Medicamentos indicados", 12, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 30;

    // Table header
    const colNombreX = marginX;
    const colIndicacionesX = colNombreX + 100;
    const colMarcaX = colIndicacionesX + 300;

    page.drawText("Nombre",       { x: colNombreX,     y: cursorY, size: 11, font: bold });
    page.drawText("Indicaciones", { x: colIndicacionesX, y: cursorY, size: 11, font: bold });
    page.drawText("Marca",        { x: colMarcaX,      y: cursorY, size: 11, font: bold });
    cursorY -= 20;

    // Table body
    medicamentos.forEach((t: { nombre: string, marca?: string, indicaciones: string }) => {
        page.drawText(t.nombre,       { x: colNombreX,     y: cursorY, size: 10, font });
        const indicaciones = t.indicaciones.length > 60
            ? t.indicaciones.slice(0, 57) + "..."
            : t.indicaciones;

        page.drawText(indicaciones,   { x: colIndicacionesX, y: cursorY, size: 10, font });
        page.drawText(t.marca || "-", { x: colMarcaX,      y: cursorY, size: 10, font });
        cursorY -= 18;
    });

    cursorY -= 37;

    // Warnings
    drawCentered("Advertencias al farmacéutico", 12, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 30;

    advertencias.split('\n').forEach((rawLine: string) => {
        const words = rawLine.trim().split(/\s+/);
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, 11);

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) lines.push(currentLine);
    });

    writeMultilineText(lines);

    lines = [];

    cursorY -= 45;

    // Observations
    drawCentered("Observaciones al paciente", 12, cursorY, rgb(0, 0, 0), bold);
    cursorY -= 30;

    observaciones.split('\n').forEach((rawLine: string) => {
        const words = rawLine.trim().split(/\s+/);
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, 11);

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) lines.push(currentLine);
    });

    writeMultilineText(lines);

    // Footer
    const lastPage = pages[pages.length - 1];
    const footerY = 60;
    const fecha = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());

    const dateLabel = 'Fecha de emisión: ';
    const dateLabelWidth = bold.widthOfTextAtSize(dateLabel, fontSize);

    lastPage.drawText(dateLabel, { x: marginX, y: footerY + 120, size: fontSize, font: bold, color: rgb(0.4, 0.4, 0.4) });

    lastPage.drawText(fecha, { x: marginX + dateLabelWidth + 2, y: footerY + 120, size: fontSize, font, color: rgb(0.4, 0.4, 0.4) });

    const drawCenteredFooter = (text: string, y: number, size = 8) => {
        const textWidth = bold.widthOfTextAtSize(text, size);
        lastPage.drawText(text, { x: (pageWidth - textWidth) / 2, y, size, font: bold, color: rgb(0, 0, 0) });
    };

    drawCenteredFooter('_____________________________', footerY + 65, 12);
    drawCenteredFooter('Firma', footerY + 47, 11);
    lastPage.drawLine({ start: { x: marginX, y: footerY + 20 }, end: { x: pageWidth - marginX, y: footerY + 20 }, thickness: 1, color: rgb(0, 0, 0) });
    drawCenteredFooter('Dirección: C.C. El Parral, Piso 1, Oficina 116, Barquisimeto, Edo. Lara, Venezuela', footerY + 5);
    drawCenteredFooter(`Teléfono: ${process.env.PHONE_NUMBER} | Correo electrónico: ${process.env.EMAIL_USER}`, footerY - 5);
    drawCenteredFooter('Lunes a Sábado, de 8:00 AM a 2:00 PM', footerY - 15);

    const pdf = await document.save();

    return new Response(Buffer.from(pdf), { status: 200, headers: { 'Content-Type': 'application/pdf' } });
}