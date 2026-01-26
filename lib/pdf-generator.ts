import jsPDF from 'jspdf';
import { Tenida } from './data';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export const generateConvocatoriaPDF = async (tenida: Tenida, templeName: string) => {
  const doc = new jsPDF();

  // 1. Cargar logo de la logia
  try {
    const img = await loadImage('/image_2025-06-26_102007168.png');
    // Logo más pequeño para evitar superposición
    const imgWidth = 30;
    const imgHeight = (img.height * imgWidth) / img.width;
    const xPosition = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
    doc.addImage(img, 'PNG', xPosition, 10, imgWidth, imgHeight);
  } catch (error) {
    console.error("Error cargando la imagen", error);
  }

  // Configuración de fuente base
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  let yPos = 45; // Posición vertical inicial después de la imagen (reducida)

  const centerX = doc.internal.pageSize.getWidth() / 2;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // 2. Encabezados
  doc.text("A L:. G:. D:. G:. A:. D:.U:. ( L:.L:.F:.", centerX, yPos, { align: "center" });
  yPos += 7;

  doc.text(`Resp:. Log:. Caballeros Del Sol de Carabobo N°269 Instalada el 23 de abril de 2022 (E:.V:.)`, centerX, yPos, { align: "center" });
  yPos += 7;

  doc.text("Bajo los auspicios de la Muy Respetable Gran Logia de la Republica de", centerX, yPos, { align: "center" });
  yPos += 5;
  doc.text("Venezuela de Jesuitas a Maturin N°5", centerX, yPos, { align: "center" });
  yPos += 7;

  doc.text("R:.E:.A:.A:.", centerX, yPos, { align: "center" });
  yPos += 15;

  // 3. Fecha y Lugar (Alineado a la derecha)
  doc.setFont("times", "normal");
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Or:. Valencia ${dateStr} (e:.v:.)`, pageWidth - margin, yPos, { align: "right" });
  yPos += 10;

  // 4. Saludo
  doc.setFont("times", "bold");
  doc.text("A todos los QQ:.HH:. Que la presente", centerX, yPos, { align: "center" });
  yPos += 5;
  doc.text("vieren.", centerX, yPos, { align: "center" });
  yPos += 10;

  doc.text("S:.F:.U:.", centerX, yPos, { align: "center" });
  yPos += 15;

  // 5. Cuerpo de la convocatoria
  doc.setFont("times", "normal");
  // Formatear fecha de la tenida
  const tenidaDate = new Date(tenida.date + 'T00:00:00');
  const tenidaDateStr = tenidaDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const bodyText = `Convocatoria: De parte del V:.M:. Gerardo Enrique Pena Barrera y su cuadro logial, se os convoca para el proximo ${tenidaDateStr} del presente año, a una Tenida ${tenida.type} en el Grado de ${tenida.grade} comenzara a las 06:30 p m (En punto) en nuestro templo ubicado en la Urb. Campo Alegre, calle el parque Casa n° 112- A- 25 Al Or:. de Valencia Edo. Carabobo.`;

  const bodyLines = doc.splitTextToSize(bodyText, contentWidth);
  bodyLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  yPos += 5;

  // 6. Puntos a tratar
  doc.setFont("times", "bold");
  doc.text("Puntos a tratar:", margin, yPos);
  yPos += 7;
  doc.setFont("times", "normal");
  const tema = tenida.theme || "El Gran Incendio de Londres";
  doc.text(tema, margin, yPos);
  yPos += 15;

  // 7. Cierre
  doc.text("Esperando de ustedes la maxima puntualidad y participacion.", margin, yPos);
  yPos += 7;
  doc.text("Me despido con los SS:. PP:. y TT:. Que nos son conocidos y un caluroso T:.A:.F:.", margin, yPos);
  yPos += 30;

  // 8. Firmas en dos columnas
  const col1X = pageWidth / 4;
  const col2X = (pageWidth * 3) / 4;

  doc.setFont("times", "bold");

  doc.text("Gerardo Enrique Pena Barrera", col1X, yPos, { align: "center" });
  doc.text("Luis David Guerra Rivas", col2X, yPos, { align: "center" });
  yPos += 5;

  doc.text("V:.M:.", col1X, yPos, { align: "center" });
  doc.text("Sec:. G:. SS:. y TT:.", col2X, yPos, { align: "center" });

  doc.save(`Convocatoria_${tenida.date}.pdf`);
};