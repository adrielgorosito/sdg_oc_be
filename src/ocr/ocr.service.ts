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

  async processImage1(imageBuffer: Buffer): Promise<any> {
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
      queterometria: { OD: [], OI: [] },
      observaciones: '',
    };

    this.processKeratometry(lines, result.queterometria);

    const graduacion = this.processGraduacion(lines);

    const vision = this.processVision(lines);

    result.observaciones = `graduacion_con_gafas:
    OD: ${graduacion.OD || ' '}
    OI: ${graduacion.OI || ' '}
    vision_binocular:
    OD: ${vision.OD || ' '}
    OI: ${vision.OI || ' '}`;

    return result;
  }

  private processKeratometry(lines: string[], result: any) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/(?:0\.D|OD|O\.D|O\.O)/i.test(line)) {
        const currentLineMatch = line.match(
          /(?:0\.D|OD|O\.D)[^\d]*(\d{2})(?:[^\d]*(\d{2}))?/i,
        );

        if (currentLineMatch && currentLineMatch[1] && currentLineMatch[2]) {
          result.OD = [currentLineMatch[1], currentLineMatch[2]];
        } else {
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.match(/^\d{2}$/)) {
            const firstValue = line.match(/(\d{2})/);
            if (firstValue) {
              result.OD = [firstValue[0], nextLine.trim()];
            }
          }
        }
      }

      if (/(?:0\.I|OI|O\.I|AI|0\.1|01|O\.\s)/i.test(line)) {
        const currentLineMatch = line.match(
          /(?:0\.I|OI|O\.I|0\.1|01|O\.\s)[^\d]*(\d{2})(?:[^\d]*(\d{2}))?/i,
        );
        if (currentLineMatch && currentLineMatch[1] && currentLineMatch[2]) {
          result.OI = [currentLineMatch[1], currentLineMatch[2]];
        } else {
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

    if (result.OD.length === 0 || result.OI.length === 0) {
      const allText = lines.join(' ');

      const odMatch = allText.match(
        /(?:OD|O\.D|AD)[^\d]*(\d{2})[^\d]+(\d{2})/i,
      );
      if (odMatch) result.OD = [odMatch[1], odMatch[2]];

      const oiMatch = allText.match(
        /(?:OI|O\.I|AI|0\.1|01)[^\d]*(\d{2})[^\d]+(\d{2})/i,
      );
      if (oiMatch) result.OI = [oiMatch[1], oiMatch[2]];
    }

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

    const normalizeNumber = (value: string) => {
      const cleaned = value.replace(/\s+/g, '').replace(',', '.');
      const num =
        cleaned.length > 2 && !cleaned.includes('.')
          ? parseFloat(cleaned) / 100
          : parseFloat(cleaned);
      return num.toFixed(2).replace('.', ',');
    };

    for (const line of lines) {
      const lower = line.toLowerCase().trim();

      if (
        !result.OD &&
        /(od|o\.d|0\.d|ad|o\.\s*d|0\.\s*d|o\.\s*b|0\.\s*b|o\s*b|0\s*b|^[\-+]?\d{3}[\-~]\d{3}[\-~]\d{3}$)/i.test(
          lower,
        )
      ) {
        let odMatch = line.match(
          /([-+]?\s*\d+[,.]?\d{2})\s*([-+]?\s*\d+[,.]?\d{2})\s*([-+]?\s*\d+)\s*°?/,
        );

        if (!odMatch) {
          odMatch = line.match(
            /([-+]?\d{3})[\-~]([-+]?\d{3})[\-~]([-+]?\d{1,3})/,
          );
        }

        if (odMatch) {
          const axis = odMatch[3].replace(/\s+/g, '').replace(/[^\d]/g, '');
          result.OD = `${normalizeNumber(odMatch[1])} ${normalizeNumber(odMatch[2])} ${axis}°`;
          continue;
        }
      }

      if (
        !result.OI &&
        /(oi|o\.i|0\.i|ai|0\.1|o\.\s*i|0\.\s*i|o\.\s*1|0\.\s*1|^[\-+]?\d{3}[\-~]\d{3}[\-~]\d{3}$)/i.test(
          lower,
        )
      ) {
        let oiMatch = line.match(
          /([-+]?\s*\d+[,.]?\d{2})\s*([-+]?\s*\d+[,.]?\d{2})\s*([-+]?\s*\d+)\s*°?/,
        );

        if (!oiMatch) {
          oiMatch = line.match(
            /([-+]?\d{3})[\-~]([-+]?\d{3})[\-~]([-+]?\d{1,3})/,
          );
        }

        if (oiMatch) {
          const axis = oiMatch[3].replace(/\s+/g, '').replace(/[^\d]/g, '');
          result.OI = `${normalizeNumber(oiMatch[1])} ${normalizeNumber(oiMatch[2])} ${axis}°`;
          continue;
        }
      }

      if (
        (!result.OD || !result.OI) &&
        /([-+]?\s*\d+[,.]?\d{2}|[-+]?\d{3})[\s\-~]+([-+]?\s*\d+[,.]?\d{2}|[-+]?\d{3})[\s\-~]+([-+]?\s*\d+)/.test(
          line,
        )
      ) {
        const genericMatch = line.match(
          /([-+]?\s*\d+[,.]?\d{2}|[-+]?\d{3})[\s\-~]+([-+]?\s*\d+[,.]?\d{2}|[-+]?\d{3})[\s\-~]+([-+]?\s*\d+)/,
        );
        if (genericMatch) {
          const axis = genericMatch[3]
            .replace(/\s+/g, '')
            .replace(/[^\d]/g, '');
          const value = `${normalizeNumber(genericMatch[1])} ${normalizeNumber(genericMatch[2])} ${axis}°`;
          if (!result.OD) {
            result.OD = value;
          } else if (!result.OI) {
            result.OI = value;
          }
        }
      }
    }

    return result;
  }

  private processVision(lines: string[]): { OD: string; OI: string } {
    const result = { OD: '', OI: '' };

    const cleanNumber = (n: string): string =>
      n
        .replace(/\s+/g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '');

    const formatVision = (v1: string, v2: string, v3: string): string =>
      `${v1.replace('.', ',')} + ${v2.replace('.', ',')} = ${v3.replace('.', ',')}`;

    const odPattern =
      /(?:OD|O\.D|0\.D|AD|O\.{1,}D)\s*[:=.]*\s*(\d[\d\s,.]*)\s*[+]\s*(\d[\d\s,.]*)\s*=\s*(\d[\d\s,.]*)/i;

    const oiPattern =
      /(?:OI|O\.\s*I|0\.\s*I|AI|0\.1|O\.{1,}\s*I)\s*[:=.]*\s*(\d[\d\s,.]*)\s*[+]\s*(\d[\d\s,.]*)\s*=\s*(\d[\d\s,.]*)/i;

    lines.forEach((line) => {
      if (!result.OD) {
        const odMatch = line.match(odPattern);
        if (odMatch) {
          const v1 = cleanNumber(odMatch[1]);
          const v2 = cleanNumber(odMatch[2]);
          const v3 = cleanNumber(odMatch[3]);
          result.OD = formatVision(v1, v2, v3);
        }
      }

      if (!result.OI) {
        const oiMatch = line.match(oiPattern);
        if (oiMatch) {
          const v1 = cleanNumber(oiMatch[1]);
          const v2 = cleanNumber(oiMatch[2]);
          const v3 = cleanNumber(oiMatch[3]);
          result.OI = formatVision(v1, v2, v3);
        }
      }
    });

    return result;
  }

  async processImage2(imageBuffer: Buffer): Promise<any> {
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

      return this.processLentesDefinitivas(lines);
    } catch (error) {
      console.error('Error en el procesamiento OCR:', error);
      throw new Error('Error al procesar la imagen con OCR');
    }
  }

  private processLentesDefinitivas(lines: string[]): any {
    const result = {
      lentes_definitivas: {
        OD: { CB: '', Esf: '', Cil: '', Eje: '', Diam: '' },
        OI: { CB: '', Esf: '', Cil: '', Eje: '', Diam: '' },
      },
    };

    // Expresiones regulares para detectar OD y OI
    const OD_REGEX = /(O\.?\s?D|OD|0\.?D|0\.\s?0\.)/i;
    const OI_REGEX = /(O\.?\s?I|OI|0\.?I|0[.,]?\s?1|O\.?\s?1\.?)/i;

    // Patrón para CB y Esfera (ej: "8,1 -4,00")
    const CB_ESF_REGEX = /(\d+[.,]\d+)\s+([-+]?\d+[.,]\d+)/;

    let oiIndex = -1;

    // Primera pasada: encontrar OD y OI
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Procesamiento para OD
      if (OD_REGEX.test(line)) {
        const match = line.match(CB_ESF_REGEX);
        if (match) {
          result.lentes_definitivas.OD.CB = match[1].replace('.', ',');
          result.lentes_definitivas.OD.Esf = match[2].replace('.', ',');
        }
      }

      // Procesamiento para OI
      if (OI_REGEX.test(line)) {
        const match = line.match(CB_ESF_REGEX);
        if (match) {
          result.lentes_definitivas.OI.CB = match[1].replace('.', ',');
          result.lentes_definitivas.OI.Esf = match[2].replace('.', ',');
          oiIndex = i; // Guardamos la posición donde encontramos OI
        }
        // Búsqueda alternativa para OI si no coincide el patrón completo
        else {
          const altMatch = line.match(/(\d+[.,]\d+)\s+([-+]?\d+[.,]\d+)/);
          if (altMatch) {
            result.lentes_definitivas.OI.CB = altMatch[1].replace('.', ',');
            result.lentes_definitivas.OI.Esf = altMatch[2].replace('.', ',');
            oiIndex = i;
          }
        }
      }
    }

    // Segunda pasada: extraer Cil, Eje y Diam después de OI
    if (oiIndex !== -1 && oiIndex + 6 < lines.length) {
      // Valores para OD (primeros 3 valores después de OI)
      result.lentes_definitivas.OD.Cil = lines[oiIndex + 1].replace('.', ',');
      result.lentes_definitivas.OD.Eje = lines[oiIndex + 2].includes('°')
        ? lines[oiIndex + 2]
        : lines[oiIndex + 2] + '°';
      result.lentes_definitivas.OD.Diam = lines[oiIndex + 3].trim();

      // Valores para OI (siguientes 3 valores)
      result.lentes_definitivas.OI.Cil = lines[oiIndex + 4].replace('.', ',');
      result.lentes_definitivas.OI.Eje = lines[oiIndex + 5].includes('°')
        ? lines[oiIndex + 5]
        : lines[oiIndex + 5] + '°';
      result.lentes_definitivas.OI.Diam = lines[oiIndex + 6].trim();
    }

    return result;
  }
}
