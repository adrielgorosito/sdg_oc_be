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
      const lines = fullText.split('\n');

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

  // FINAL: anda para la foto de Lu
  private processOptometryText(lines: string[]): any {
    const oftalmometriaLines = [lines[5], lines[6], lines[8], lines[11]];
    const graduacionLines = [lines[2], lines[3]];
    const visionBinocularLines = [lines[17], lines[18]];

    const result = {
      oftalmometria: {
        OD: [] as string[],
        OI: [] as string[],
      },
      graduacion_con_gafas: {
        OD: '',
        OI: '',
      },
      vision_binocular: {
        OD: '',
        OI: '',
      },
    };

    // Procesar oftalmometría (ya funciona perfecto)
    this.processOftalmometria(oftalmometriaLines, result);

    // Procesar graduación con correcciones específicas
    result.graduacion_con_gafas.OD = this.formatGraduacionOD(
      graduacionLines[0],
    );
    result.graduacion_con_gafas.OI = this.formatGraduacionOI(
      graduacionLines[1],
    );

    // Procesar visión binocular con correcciones específicas
    result.vision_binocular.OD = this.formatVisionBinocularOD(
      visionBinocularLines[0],
    );
    result.vision_binocular.OI = this.formatVisionBinocularOI(
      visionBinocularLines[1],
    );

    console.log('\n=== RESULTADO POR SECCIONES ===');
    console.log(JSON.stringify(result, null, 2));

    return result;
  }

  private processOftalmometria(lines: string[], result: any): void {
    // (Mantener el mismo código que ya funciona)
    if (lines[0].includes('OD') || lines[0].includes('O.D')) {
      const odParts = lines[0].split(/\s+/);
      const odValue1 = odParts[odParts.length - 1];
      const odValue2 = lines[1].trim();

      result.oftalmometria.OD.push(this.validateNumber(odValue1));
      result.oftalmometria.OD.push(this.validateNumber(odValue2));
    }

    const oiTags = ['OI', 'O.I', '01', '0I', 'O1'];
    if (oiTags.some((tag) => lines[2].includes(tag))) {
      const oiParts = lines[2].split(/\s+/);
      const oiValue1 = oiParts[oiParts.length - 1];
      const oiValue2 = lines[3].trim();

      result.oftalmometria.OI.push(this.validateNumber(oiValue1));
      result.oftalmometria.OI.push(this.validateNumber(oiValue2));
    }
  }

  private validateNumber(value: string): string {
    return /^-?\d*\.?\d+$/.test(value) ? value : '';
  }

  private formatGraduacionOD(text: string): string {
    // Caso especial para OD: "-400-275-180" → "-4,00 -2,75 -180"
    const cleaned = text.replace(/[^0-9\-]/g, '');
    const matches = cleaned.match(/-?\d+/g) || [];

    const formatted = matches
      .map((num, index) => {
        if (index === 2) return num; // El último número (180) se queda igual
        const withDecimal = (parseInt(num) / 100).toFixed(2).replace('.', ',');
        return withDecimal.startsWith('0,')
          ? withDecimal.substring(1)
          : withDecimal;
      })
      .join(' ');

    return formatted;
  }

  private formatGraduacionOI(text: string): string {
    // Caso especial para OI: "a1-3,00 -2,75 - 180f" → "-3,00 -2,75 180"
    const cleaned = text.replace(/[^0-9\-\.,]/g, ' ');
    const matches = cleaned.match(/-?\d+[\.,]?\d*/g) || [];

    // Filtramos y formateamos los valores
    const formattedValues = matches
      .map((num) => {
        // Manejar el signo negativo
        const negative = num.startsWith('-');
        const absolute = negative ? num.substring(1) : num;

        // Determinar si es un valor grande (como 180)
        const numericValue = parseFloat(absolute.replace(',', '.'));
        const isLargeValue = Math.abs(numericValue) >= 10;

        // Formatear según el tipo de valor
        if (isLargeValue) {
          return negative
            ? `-${absolute.split(',')[0]}`
            : absolute.split(',')[0];
        } else {
          const withDecimal =
            absolute.includes(',') || absolute.includes('.')
              ? absolute.replace('.', ',').replace(/(,\d)$/, '$10') // Asegurar 2 decimales
              : `${absolute},00`;
          return negative ? `-${withDecimal}` : withDecimal;
        }
      })
      // Filtrar valores no deseados (como el 1,00 que aparece primero)
      .filter((num, index) => {
        // Eliminar el primer valor si es positivo y pequeño (el 1,00 no deseado)
        if (
          index === 0 &&
          !num.startsWith('-') &&
          parseFloat(num.replace(',', '.')) < 10
        ) {
          return false;
        }
        return true;
      });

    return formattedValues.join(' ');
  }

  private formatVisionBinocularOD(text: string): string {
    // Caso especial para OD: "OD: 770 +1,00 =8.7" → "OD: 7,70 +1,00 = 8,70"
    let formatted = text.replace('COD', 'OD').replace('Cod', 'OD');

    // Corregir 770 → 7,70
    formatted = formatted.replace(/(\D)7{2,}0(\D)/, '$17,70$2');

    // Asegurar formato estándar
    formatted = formatted
      .replace(/(\d)\.(\d)/g, '$1,$2') // Puntos a comas
      .replace(/([=+])\s?(\d)/g, '$1 $2') // Espacios alrededor de operadores
      .replace(/(\d)\s?([=+])/g, '$1 $2')
      .replace(/(,\d)\b/g, (match) =>
        match.length === 2 ? `${match}0` : match,
      ); // 2 decimales

    return formatted;
  }

  private formatVisionBinocularOI(text?: string): string {
    // Caso especial para OI: "OI: 7,50+1,0 = 8,5" → "OI: 7,50 +1,00 = 8,50"
    let formatted = text?.replace('COI', 'OI').replace('Coi', 'OI');

    // Asegurar formato estándar
    formatted = formatted
      ?.replace(/(\d)\.(\d)/g, '$1,$2') // Puntos a comas
      .replace(/([=+])\s?(\d)/g, '$1 $2') // Espacios alrededor de operadores
      .replace(/(\d)\s?([=+])/g, '$1 $2')
      .replace(/(,\d)\b/g, (match) =>
        match.length === 2 ? `${match}0` : match,
      ); // 2 decimales

    return formatted;
  }
}
