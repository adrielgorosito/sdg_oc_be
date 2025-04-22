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

    const normalizeNumber = (value: string) =>
      parseFloat(value.replace(',', '.')).toFixed(2).replace('.', ',');

    const cleanAndExtractNumbers = (line: string): string[] => {
      const matches = [...line.matchAll(/([+-]?\d{1,3}[,.]?\d*)/g)].map(
        (m) => m[1],
      );
      return matches.length >= 3 ? matches.slice(0, 3) : [];
    };

    let odDetected = false;
    let oiDetected = false;

    for (const line of lines) {
      const lower = line.toLowerCase();

      if (!odDetected && /od|o\.d|0\.d|ad/.test(lower)) {
        const numbers = cleanAndExtractNumbers(line);
        if (numbers.length === 3) {
          result.OD = `${normalizeNumber(numbers[0])} ${normalizeNumber(numbers[1])} ${numbers[2]}°`;
          odDetected = true;
          continue;
        }
      }

      if (!oiDetected && /oi|o\.i|0\.i|ai|0\.1/.test(lower)) {
        const numbers = cleanAndExtractNumbers(line);
        if (numbers.length === 3) {
          result.OI = `${normalizeNumber(numbers[0])} ${normalizeNumber(numbers[1])} ${numbers[2]}°`;
          oiDetected = true;
          continue;
        }
      }

      if (
        !odDetected &&
        /^\s*[-+]?\d{3}[-~]\d{3}[-~]\d{3}\s*$/i.test(
          line.replace(/[^\d\-]/g, ''),
        )
      ) {
        const match = line.match(/([-+]?\d{3})[-~]?(\d{3})[-~]?(\d{3})/);
        if (match) {
          const sphere = normalizeNumber((parseInt(match[1]) / 100).toString());
          const cylinder = normalizeNumber(
            (parseInt(match[2]) / 100).toString(),
          );
          const axis = match[3];
          result.OD = `${sphere} ${cylinder} ${axis}°`;
          odDetected = true;
          continue;
        }
      }

      if ((!odDetected || !oiDetected) && /\d/.test(line)) {
        const numbers = cleanAndExtractNumbers(line);
        if (numbers.length === 3) {
          const value = `${normalizeNumber(numbers[0])} ${normalizeNumber(numbers[1])} ${numbers[2]}°`;
          if (!odDetected) {
            result.OD = value;
            odDetected = true;
          } else if (!oiDetected) {
            result.OI = value;
            oiDetected = true;
          }
        }
      }
    }

    return result;
  }

  private processVision(lines: string[]): { OD: string; OI: string } {
    const result = { OD: '', OI: '' };

    const cleanNumber = (n: string): string =>
      n.replace(',', '.').replace(/[^\d.]/g, '');

    const formatVision = (v1: string, v2: string, v3: string): string =>
      `${v1.replace('.', ',')} + ${v2.replace('.', ',')} = ${v3.replace('.', ',')}`;

    const visionPatterns = [
      /(?:OD|OI|O\.D|O\.I|0\.D|0\.I|AD|AI)\s*[:=]?\s*(\d+[,.]?\d*)\s*\+?\s*(\d+[,.]?\d*)\s*=?\s*(\d+[,.]?\d*)/i,
      /(?:OD|OI|O\.D|O\.I|0\.D|0\.I|AD|AI)\s*[:=]?\s*(\d{1,3})\s*\+?\s*(\d{1,3}[,.]?\d*)\s*=?\s*(\d+[,.]?\d*)/i,
    ];

    lines.forEach((line) => {
      for (const pattern of visionPatterns) {
        const match = line.match(pattern);
        if (match) {
          const eye = /(?:OD|O\.D|0\.D|AD)/i.test(line)
            ? 'OD'
            : /(?:OI|O\.I|0\.I|AI|0\.1)/i.test(line)
              ? 'OI'
              : null;

          if (eye && !result[eye]) {
            const v1 = cleanNumber(match[1]);
            const v2 = cleanNumber(match[2]);
            const v3 = cleanNumber(match[3]);
            result[eye] = formatVision(v1, v2, v3);
          }
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
        OD: {} as any,
        OI: {} as any,
      },
    };

    const EYE_REGEX = {
      OD: /^(O\.?\s?D|OD|0\.?D)\b/i,
      OI: /^(O\.?\s?I|OI|0\.?I|0\.1)\b/i,
    };

    const VALUE_REGEX = {
      TRIPLE_VALUES:
        /([+-]?\d+[.,]\d+)[\s\/\-]+([+-]?\d+[.,]\d+)[\s\/\-]+([+-]?\d+[.,]\d+)/,
      DIAM: /(\d{3,})/,
      EJE: /(\d{1,3})°?/,
    };

    const processEye = (eyeType: 'OD' | 'OI') => {
      const eyeData: any = {};
      let eyeSection = false;
      let valueBuffer: string[] = [];

      lines.forEach((line, index) => {
        if (EYE_REGEX[eyeType].test(line)) {
          eyeSection = true;
          valueBuffer = [];
          return;
        }

        if (eyeSection) {
          const tripleMatch = line.match(VALUE_REGEX.TRIPLE_VALUES);
          if (tripleMatch) {
            eyeData.CB = tripleMatch[1].replace('.', ',');
            eyeData.Esf = tripleMatch[2].replace('.', ',');
            eyeData.Cil = tripleMatch[3].replace('.', ',');
          }

          const numbers = line.match(/([+-]?\d+[.,]\d+)/g) || [];
          valueBuffer.push(...numbers.map((n) => n.replace('.', ',')));

          if (valueBuffer.length >= 3 && !eyeData.CB) {
            [eyeData.CB, eyeData.Esf, eyeData.Cil] = valueBuffer.slice(0, 3);
            valueBuffer = [];
          }

          const ejeMatch = line.match(VALUE_REGEX.EJE);
          if (ejeMatch) eyeData.Eje = `${ejeMatch[1]}°`;

          const diamMatch = line.match(VALUE_REGEX.DIAM);
          if (diamMatch) eyeData.Diam = parseInt(diamMatch[1], 10);

          if (index > lines.findIndex((l) => EYE_REGEX[eyeType].test(l)) + 4) {
            eyeSection = false;
          }
        }
      });

      if (!eyeData.Diam) {
        const diamKey = eyeType === 'OD' ? /D/ : /I/;
        const diamLine = lines
          .join(' ')
          .match(new RegExp(`${diamKey.source}.*?(\\d{3,})`, 'i'));
        eyeData.Diam = diamLine ? parseInt(diamLine[1], 10) : null;
      }

      result.lentes_definitivas[eyeType] = eyeData;
    };

    processEye('OD');
    processEye('OI');

    const formatResult = (data: any) => {
      return {
        CB: data.CB || '',
        Esf: data.Esf || '',
        Cil: data.Cil || '',
        Eje: data.Eje || '',
        Diam: data.Diam || '',
      };
    };

    result.lentes_definitivas.OD = formatResult(result.lentes_definitivas.OD);
    result.lentes_definitivas.OI = formatResult(result.lentes_definitivas.OI);

    console.log('\n=== RESULTADO FINAL ===');
    console.log(
      JSON.stringify(result, null, 2).replace(/"(\w+)": null/g, '"$1": ""'),
    );
    return result;
  }
}
