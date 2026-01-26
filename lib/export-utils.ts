import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Exportar hermanos a PDF
export const exportBrothersToPDF = (brothers: any[]) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Resp∴ Log∴ Caballeros Del Sol de Carabobo N°269', 14, 20);
    doc.setFontSize(12);
    doc.text('Lista de Hermanos', 14, 30);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 36);

    // Tabla
    const tableData = brothers.map(b => [
        b.name,
        b.cedula || '-',
        b.grade || '-',
        b.position_name || '-'
    ]);

    autoTable(doc, {
        head: [['Nombre', 'Cédula', 'Grado', 'Cargo']],
        body: tableData,
        startY: 42,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`hermanos_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Exportar asistencias a PDF
export const exportAttendanceToPDF = (attendanceData: any[]) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Resp∴ Log∴ Caballeros Del Sol de Carabobo N°269', 14, 20);
    doc.setFontSize(12);
    doc.text('Reporte de Asistencias', 14, 30);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 36);

    const tableData = attendanceData.map(a => [
        a.brother_name,
        a.brother_grade,
        a.total_attendances?.toString() || '0',
        a.applicable_sessions?.toString() || '0',
        a.applicable_absences?.toString() || '0',
        `${a.attendance_rate || 0}%`
    ]);

    autoTable(doc, {
        head: [['Hermano', 'Grado', 'Asistencias', 'Tenidas', 'Inasistencias', 'Tasa']],
        body: tableData,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`asistencias_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Exportar hermanos a Excel
export const exportBrothersToExcel = (brothers: any[]) => {
    const data = brothers.map(b => ({
        'Nombre': b.name,
        'Cédula': b.cedula || '-',
        'Grado': b.grade || '-',
        'Cargo': b.position_name || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hermanos');

    XLSX.writeFile(wb, `hermanos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Exportar asistencias a Excel
export const exportAttendanceToExcel = (attendanceData: any[]) => {
    const data = attendanceData.map(a => ({
        'Hermano': a.brother_name,
        'Grado': a.brother_grade,
        'Cargo': a.brother_position || '-',
        'Asistencias Totales': a.total_attendances || 0,
        'Tenidas Aplicables': a.applicable_sessions || 0,
        'Inasistencias': a.applicable_absences || 0,
        'Tasa de Asistencia': `${a.attendance_rate || 0}%`,
        'Asistencias por Grado': a.grade_attendances || 0,
        'Tenidas de su Grado': a.grade_sessions || 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');

    XLSX.writeFile(wb, `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`);
};
