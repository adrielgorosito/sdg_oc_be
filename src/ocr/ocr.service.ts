import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OcrService {
  private client: ImageAnnotatorClient;

  constructor() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS =
      'solid-arcadia-457111-j2-e731a067c429.json';
    this.client = new ImageAnnotatorClient();
  }

  async processImage(imageBuffer: Buffer): Promise<any> {
    try {
      const [result] = await this.client.textDetection({
        image: { content: imageBuffer },
      });

      const textAnnotations = result.textAnnotations;
      if (!textAnnotations || textAnnotations.length === 0) {
        throw new Error('No se detectó texto en la imagen.');
      }

      const fullText = textAnnotations[0].description;
      const lines = fullText.split('\n').filter((line) => line.trim() !== '');

      console.log('=== TEXTO DETECTADO ===');
      lines.forEach((line, i) => {
        console.log(`${(i + 1).toString().padStart(2, '0')}: ${line}`);
      });

      return this.processOptometryText(lines);
    } catch (error) {
      console.error('Error en el procesamiento OCR:', error);
      throw new Error('Error al procesar la imagen con OCR');
    }
  }

  private processOptometryText(lines: string[]): any {
    const result = {
      oftalmometria: { OD: [], OI: [] },
      observaciones: '',
    };

    // 1. Procesar oftalmometría (Keratometría) - Versión mejorada
    this.processKeratometry(lines, result.oftalmometria);

    // 2. Procesar graduación con gafas - Versión mejorada
    const graduacion = this.processGraduacion(lines);

    // 3. Procesar visión binocular - Versión mejorada
    const vision = this.processVision(lines);

    // Construir observaciones
    result.observaciones = `graduacion_con_gafas:
    OD: ${graduacion.OD || 'No detectado'}
    OI: ${graduacion.OI || 'No detectado'}
    vision_binocular:
    OD: ${vision.OD || 'No detectado'}
    OI: ${vision.OI || 'No detectado'}`;

    return result;
  }

  private processKeratometry(lines: string[], result: any) {
    // Primero buscamos las líneas que contienen OD/OI y sus valores
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detección para OD (Ojo Derecho)
      if (/(?:0\.D|OD|O\.D|O\.O)/i.test(line)) {
        // Buscamos los dos valores en la misma línea o en la siguiente
        const currentLineMatch = line.match(
          /(?:0\.D|OD|O\.D)[^\d]*(\d{2})(?:[^\d]*(\d{2}))?/i,
        );

        if (currentLineMatch && currentLineMatch[1] && currentLineMatch[2]) {
          result.OD = [currentLineMatch[1], currentLineMatch[2]];
        } else {
          // Si no encontramos dos valores, buscamos en la línea siguiente
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.match(/^\d{2}$/)) {
            const firstValue = line.match(/(\d{2})/);
            if (firstValue) {
              result.OD = [firstValue[0], nextLine.trim()];
            }
          }
        }
      }

      // Detección para OI (Ojo Izquierdo)
      if (/(?:0\.I|OI|O\.I|AI|0\.1|01|O\.\s)/i.test(line)) {
        // Buscamos los dos valores en la misma línea o en la siguiente
        const currentLineMatch = line.match(
          /(?:0\.I|OI|O\.I|0\.1|01|O\.\s)[^\d]*(\d{2})(?:[^\d]*(\d{2}))?/i,
        );
        if (currentLineMatch && currentLineMatch[1] && currentLineMatch[2]) {
          result.OI = [currentLineMatch[1], currentLineMatch[2]];
        } else {
          // Si no encontramos dos valores, buscamos en la línea siguiente
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.match(/^\d{2}$/)) {
            const firstValue = line.match(/(\d{2})/);
            if (firstValue) {
              result.OI = [firstValue[0], nextLine.trim()];
            }
          }
        }
      }
    }

    // Si no encontramos en el formato estándar, buscamos patrones alternativos
    if (result.OD.length === 0 || result.OI.length === 0) {
      const allText = lines.join(' ');

      // Patrón alternativo para OD: cualquier mención de OD/AD seguido de dos números de 2 dígitos
      const odMatch = allText.match(
        /(?:OD|O\.D|AD)[^\d]*(\d{2})[^\d]+(\d{2})/i,
      );
      if (odMatch) result.OD = [odMatch[1], odMatch[2]];

      // Patrón alternativo para OI: cualquier mención de OI/AI/01 seguido de dos números de 2 dígitos
      const oiMatch = allText.match(
        /(?:OI|O\.I|AI|0\.1|01)[^\d]*(\d{2})[^\d]+(\d{2})/i,
      );
      if (oiMatch) result.OI = [oiMatch[1], oiMatch[2]];
    }

    // Validación final - los valores deben ser números entre 30 y 60 (rango típico de queratometría)
    if (result.OD.length === 2) {
      if (parseInt(result.OD[0]) < 30 || parseInt(result.OD[0]) > 60)
        result.OD = [];
      if (parseInt(result.OD[1]) < 30 || parseInt(result.OD[1]) > 60)
        result.OD = [];
    }
    if (result.OI.length === 2) {
      if (parseInt(result.OI[0]) < 30 || parseInt(result.OI[0]) > 60)
        result.OI = [];
      if (parseInt(result.OI[1]) < 30 || parseInt(result.OI[1]) > 60)
        result.OI = [];
    }
  }

  private processGraduacion(lines: string[]): { OD: string; OI: string } {
    const result = { OD: '', OI: '' };
    const graduacionPatterns = [
      // Patrón para OD/OI con formato: -4,00 -2,75 180
      /(?:OD|OI|0\.D|0\.I|AD|AI)\s*[:=]?\s*([+-]?\d+[,.]\d+)\s*([+-]?\d+[,.]\d+)\s*(\d+)/i,
      // Patrón para líneas que comienzan directamente con los valores
      /^\s*([+-]?\d+[,.]\d+)\s*[~-]\s*(\d+[,.]\d+)\s*[~-]\s*(\d+)/i,
      // Patrón para valores pegados: -4,00-2,75-180
      /([+-]?\d+[,.]\d+)[~-](\d+[,.]\d+)[~-](\d+)/i,

      /([+~-]?\d+[,.]?\d+)\s*[+~-](\d+[,.]\d+)\s*[+~-](\d+)/i,
    ];

    lines.forEach((line) => {
      for (const pattern of graduacionPatterns) {
        const match = line.match(pattern);
        if (match) {
          const eye =
            line.includes('OD') || line.includes('0.D') || line.includes('AD')
              ? 'OD'
              : line.includes('OI') ||
                  line.includes('0.I') ||
                  line.includes('AI') ||
                  line.includes('0.1')
                ? 'OI'
                : null;

          if (eye) {
            const sphere = match[1].replace(',', '.');
            const cylinder = match[2].replace(',', '.');
            const axis = match[3];

            result[eye] =
              `${parseFloat(sphere).toFixed(2).replace('.', ',')} ${parseFloat(
                cylinder,
              )
                .toFixed(2)
                .replace('.', ',')} ${axis}`;
            break;
          } else if (!result.OD && !result.OI) {
            // Asignar alternativamente si no se ha detectado ninguno
            const sphere = match[1].replace(',', '.');
            const cylinder = match[2].replace(',', '.');
            const axis = match[3];

            const value = `${parseFloat(sphere).toFixed(2).replace('.', ',')} ${parseFloat(
              cylinder,
            )
              .toFixed(2)
              .replace('.', ',')} ${axis}`;

            if (!result.OD) result.OD = value;
            else if (!result.OI) result.OI = value;
            break;
          }
        }
      }
    });

    return result;
  }

  private processVision(lines: string[]): { OD: string; OI: string } {
    const result = { OD: '', OI: '' };
    const visionPatterns = [
      // Patrón estándar: OD: 7,70 +1,00 =8.7
      /(?:OD|OI|0\.D|0\.I|AD|AI)\s*[:=]\s*(\d+[,.]\d+)\s*[+]\s*(\d+[,.]\d+)\s*=\s*(\d+[,.]\d+)/i,
      // Patrón sin espacios: OD:7,70+1,00=8.7
      /(?:OD|OI|0\.D|0\.I|AD|AI)\s*[:=]\s*(\d+[,.]\d+)\+(\d+[,.]\d+)=(\d+[,.]\d+)/i,
      // Patrón con espacios irregulares
      /(?:OD|OI|0\.D|0\.I|AD|AI)\s*[:=]?\s*(\d+[,.]\d+)\s*[+]\s*(\d+[,.]\d+)\s*=\s*(\d+[,.]\d+)/i,
    ];

    lines.forEach((line) => {
      for (const pattern of visionPatterns) {
        const match = line.match(pattern);
        if (match) {
          const eye =
            line.includes('OD') || line.includes('0.D') || line.includes('AD')
              ? 'OD'
              : line.includes('OI') ||
                  line.includes('0.I') ||
                  line.includes('AI') ||
                  line.includes('0.1')
                ? 'OI'
                : null;

          if (eye) {
            const value1 = match[1].replace(',', '.');
            const value2 = match[2].replace(',', '.');
            const resultValue = match[3].replace(',', '.');

            result[eye] =
              `${value1.replace('.', ',')} + ${value2.replace('.', ',')} = ${resultValue.replace('.', ',')}`;
            break;
          }
        }
      }
    });

    return result;
  }
}
