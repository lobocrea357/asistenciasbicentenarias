import jsPDF from 'jspdf';
import { Tenida } from './data';

export const generateConvocatoriaPDF = (tenida: Tenida) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RESP∴ LOG∴ CABALLEROS DEL SOL DE CARABOBO N° 669', 105, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('OR∴ DE VALENCIA, EDO. CARABOBO', 105, 40, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CONVOCATORIA', 105, 60, { align: 'center' });
  
  // Date of convocation
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Convocatoria: ${today}`, 20, 80);
  
  // Tenida details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES DE LA TENIDA:', 20, 100);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const tenidaDate = new Date(tenida.date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.text(`Tema: ${tenida.theme}`, 20, 120);
  doc.text(`Fecha: ${tenidaDate}`, 20, 135);
  doc.text(`Lugar: ${tenida.location}`, 20, 150);
  doc.text(`Tipo de Tenida: ${tenida.type}`, 20, 165);
  doc.text(`Grado: ${tenida.grade}`, 20, 180);
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Fraternalmente,', 20, 220);
  doc.text('El Venerable Maestro', 20, 235);
  
  doc.text('T∴ A∴ F∴', 20, 260);
  
  // Save the PDF
  doc.save(`Convocatoria_${tenida.theme.replace(/\s+/g, '_')}_${tenida.date}.pdf`);
};