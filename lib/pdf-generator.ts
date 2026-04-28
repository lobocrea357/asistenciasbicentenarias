import jsPDF from 'jspdf';
import { Brother, Tenida } from './data';

type TenidaWithSubType = Tenida & {
  subType?: string;
  subtype?: string;
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

const normalizeText = (value: string) => value
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const buildTenidaDescription = (tenida: TenidaWithSubType) => {
  const type = tenida.type?.toLowerCase() || 'ordinaria';
  const grade = tenida.grade?.toLowerCase() || '';
  const subType = (tenida.subType || tenida.subtype || '').trim();

  if (!subType || normalizeText(subType) === normalizeText(type)) {
    return `Tenida ${type} en grado de ${grade}`;
  }

  const subTypeNeedsDe = new Set(['iniciacion', 'aumento de salario', 'exaltacion']);
  const separator = subTypeNeedsDe.has(normalizeText(subType)) ? ' de ' : ' ';

  return `Tenida ${type} en grado de ${grade}${separator}${subType}`;
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
  doc.text("A L:. G:. D:. G:. A:. D:.U:.", centerX, yPos, { align: "center" });
  yPos += 5;
  doc.text("(L:.L:.F:.)", centerX, yPos, { align: "center" });
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

  const tenidaDescription = buildTenidaDescription(tenida as TenidaWithSubType);
  const bodyText = `Convocatoria: De parte del V:.M:. Gerardo Enrique Pena Barrera y su cuadro logial, se os convoca para el proximo ${tenidaDateStr}, a una ${tenidaDescription} comenzara a las 06:30 p m (En punto) en nuestro templo ubicado en la Urb. Campo Alegre, calle el parque Casa n° 112- A- 25 Al Or:. de Valencia Edo. Carabobo.`;

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
  const temaLines = doc.splitTextToSize(tema, contentWidth);
  temaLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  yPos += 7;
  doc.text("El acostumbrado toque de puertas comenzará a las 5:00p.m. en punto.", margin, yPos);
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

  // Firma del VM (Gerardo)
  const firmaVMImg = new Image();
  firmaVMImg.src = '/firma-vm.png';
  doc.addImage(firmaVMImg, 'PNG', col1X - 30, yPos - 20, 60, 25, undefined, 'FAST');
  doc.text("Gerardo Enrique Pena Barrera", col1X, yPos, { align: "center" });
  yPos += 5;
  doc.text("V:.M:.", col1X, yPos, { align: "center" });

  // Firma del Secretario (Luis David)  
  const firmaSecImg = new Image();
  firmaSecImg.src = '/firma-sec.png';
  doc.addImage(firmaSecImg, 'PNG', col2X - 30, yPos - 25, 60, 25, undefined, 'FAST');
  doc.text("Luis David Guerra Rivas", col2X, yPos - 5, { align: "center" });
  doc.text("Sec:. G:. SS:. y TT:.", col2X, yPos, { align: "center" });

  doc.save(`Convocatoria_${tenida.date}.pdf`);
};



export const generateNiEntreDichoNiPenado = async (brother: any, secretary: any, vm: any, fiscalSpeaker: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const currentDate = new Date();
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ];

  const dateLiteral = `${currentDate.getDate()} de ${months[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  const brotherCedulaRaw = (brother as Brother & { cedula?: string | number }).cedula;
  const brotherCedula = brotherCedulaRaw
    ? Number(String(brotherCedulaRaw).replace(/[^\d]/g, '')).toLocaleString('es-VE')
    : '____________';

  try {
    const logo = await loadImage('/image_2025-06-26_102007168.png');
    const logoWidth = 24;
    const logoHeight = (logo.height * logoWidth) / logo.width;
    doc.addImage(logo, 'PNG', centerX - (logoWidth / 2), 10, logoWidth, logoHeight);
  } catch (error) {
    console.error('Error cargando logo del documento', error);
  }

  let yPos = 40;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 56, 122);
  doc.text('A L:. G:. D:. G:. A:. D:. U:.', centerX, yPos, { align: 'center' });
  yPos += 6;
  doc.text('L:. L:. F:.', centerX, yPos, { align: 'center' });
  yPos += 6;
  doc.text('Resp:. Log:. Caballeros del Sol de Carabobo N° 269 Instalada el 21 de abril de 2.022 (e:. v:.)', centerX, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Bajo los auspicios de la Muy Resp:. Gr:. Log:. de la República de Venezuela de Jesuitas a Maturín N°5', centerX, yPos, { align: 'center' });
  yPos += 5;
  doc.text('R:. E:. A:. A:.', centerX, yPos, { align: 'center' });

  yPos += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text(`Or:. de Valencia, ${dateLiteral} (e:. v:.)`, margin, yPos);

  yPos += 10;
  doc.text('A todos los QQ:. HH:. que la presente vieren.', margin, yPos);

  yPos += 14;
  doc.setFont('times', 'bold');
  doc.text('S:. F:. U:.', centerX, yPos, { align: 'center' });

  yPos += 12;
  doc.setFont('times', 'normal');
  const bodyText = `En nombre de la Respetable Logia Caballeros del Sol de Carabobo N° 269 se hace constar que nuestro Q:. H:. ${brother.name.toUpperCase()}, cédula de identidad V-${brotherCedula} y miembro activo de este Respetable Taller se encuentra libre de cualquier proceso administrativo y no se encuentra NI ENTRE DICHO NI PENADO, permaneciendo con una labor en Logia encomiable de su título masónico.`;
  const bodyLines = doc.splitTextToSize(bodyText, contentWidth);
  bodyLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 7.5;
  });

  const vmSignatureY = Math.max(yPos + 14, 184);
  try {
    const vmSignature = await loadImage('/firma-vm.png');
    doc.addImage(vmSignature, 'PNG', centerX - 22, vmSignatureY - 16, 44, 18, undefined, 'FAST');
  } catch (error) {
    console.error('Error cargando firma del VM', error);
  }

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.text(`${vm.name} ${vm.last_name}`, centerX, vmSignatureY + 6, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.text('V:.M:.', centerX, vmSignatureY + 12, { align: 'center' });

  const bottomSignY = 240;
  const leftX = pageWidth / 4;
  const rightX = (pageWidth * 3) / 4;

  try {
    const secSignature = await loadImage('/firma-sec.png');
    doc.addImage(secSignature, 'PNG', leftX - 20, bottomSignY - 20, 40, 18, undefined, 'FAST');
  } catch (error) {
    console.error('Error cargando firma del secretario', error);
  }

  doc.setFont('times', 'bold');
  doc.text(`${secretary.name} ${secretary.last_name}`, leftX, bottomSignY + 6, { align: 'center' });
  doc.text('Sec:. GG:. SS:. y TT:.', leftX, bottomSignY + 12, { align: 'center' });

  try {
    const oradorFiscalSignature = await loadImage('/firma-orafis.png');
    doc.addImage(oradorFiscalSignature, 'PNG', rightX - 20, bottomSignY - 20, 40, 18, undefined, 'FAST');
  } catch (error) {
    console.error('Error cargando firma del orador fiscal', error);
  }

  doc.setFont('times', 'normal');
  doc.text('_________________________', rightX, bottomSignY, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.text(`${fiscalSpeaker.name} ${fiscalSpeaker.last_name}`, rightX, bottomSignY + 6, { align: 'center' });
  doc.text('Or:. Fiscal', rightX, bottomSignY + 12, { align: 'center' });

  const safeName = brother.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  doc.save(`Ni_Entre_Dicho_Ni_Penado_${safeName || 'hermano'}.pdf`);
};
