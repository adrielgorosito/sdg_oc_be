import { InternalServerErrorException } from '@nestjs/common';
import { add, compareAsc, format } from 'date-fns';
import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import * as forge from 'node-forge';
import { NtpTimeSync } from 'ntp-time-sync';
import {
  AfipNetworkError,
  AfipValidationError,
  AfipXMLError,
} from '../errors/afip.errors';
import { IConfigService } from '../interfaces/IConfigServices';
import {
  IDatosAfip,
  IFECAESolicitarResult,
  IFECompUltimoAutorizadoResult,
  ILoginResponse,
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
  IRequest,
  ResultadoProcesado,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import {
  PREFIX_BODY_LOGIN,
  PREFIX_BODY_SERVICE,
  PREFIX_ENVELOPE_LOGIN,
  PREFIX_ENVELOPE_SERVICE,
} from './afip.constantes';

export const readFile = fs.readFile;
export const writeFile = fs.writeFile;

export function isExpired(expireStr: string): boolean {
  const now = new Date();
  const expire = new Date(expireStr);
  return compareAsc(now, expire) >= 0;
}
export async function generateLoginXml(): Promise<string> {
  const networkTime = await getNetworkHour();
  const expire = add(networkTime, { hours: 24 });
  const xml = `
          <loginTicketRequest>
          <header>
          <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>
          <generationTime>${format(networkTime, "yyyy-MM-dd'T'HH:mm:ss")}</generationTime>
          <expirationTime>${format(expire, "yyyy-MM-dd'T'HH:mm:ss")}</expirationTime>
          </header>
          <service>wsfe</service>
          </loginTicketRequest>
          `;

  return xml.trim();
}

function validateServiceParams(
  method: WsServicesNamesEnum,
  datosAfip: IDatosAfip,
): void {
  switch (method) {
    case WsServicesNamesEnum.LoginCms:
      if (!datosAfip.certBase64) {
        throw new AfipValidationError(
          'El certificado en base64 es requerido para el método LoginCms',
        );
      }
      break;

    case WsServicesNamesEnum.FECAESolicitar:
      if (!datosAfip.factura) {
        throw new AfipValidationError(
          'Los datos de factura son requeridos para el método FECAESolicitar',
        );
      }
      if (
        !datosAfip.Auth?.Token ||
        !datosAfip.Auth?.Sign ||
        !datosAfip.Auth?.Cuit
      ) {
        throw new AfipValidationError(
          'Los datos de autenticación (token, sign y cuit) son requeridos para FECAESolicitar',
        );
      }
      if (
        !datosAfip.factura?.FeCAEReq?.FeCabReq ||
        !datosAfip.factura?.FeCAEReq?.FeDetReq
      ) {
        throw new AfipValidationError(
          'Los datos de cabecera y detalle de la factura son requeridos para FECAESolicitar',
        );
      }
      break;

    case WsServicesNamesEnum.FECompUltimoAutorizado:
      if (!datosAfip.ultimoAutorizado) {
        throw new AfipValidationError(
          'Los datos de último comprobante autorizado son requeridos para FECompUltimoAutorizado',
        );
      }
      if (
        !datosAfip.Auth.Token ||
        !datosAfip.Auth.Sign ||
        !datosAfip.Auth.Cuit
      ) {
        throw new AfipValidationError(
          'Los datos de autenticación (token, sign y cuit) son requeridos para FECompUltimoAutorizado',
        );
      }
      if (
        !datosAfip.ultimoAutorizado?.PtoVta ||
        !datosAfip.ultimoAutorizado?.CbteTipo
      ) {
        throw new AfipValidationError(
          'El punto de venta y tipo de comprobante son requeridos para FECompUltimoAutorizado',
        );
      }
      break;

    default:
      throw new AfipValidationError(`Método ${method} no soportado`);
  }
}

export function generateSoapRequest(
  method: WsServicesNamesEnum,
  datosAfip: IDatosAfip,
): IRequest {
  validateServiceParams(method, datosAfip);

  let bodyContent = '';
  let soapAction = '';
  let namespace = '';

  switch (method) {
    case WsServicesNamesEnum.LoginCms:
      namespace = 'xmlns:wsaa="http://wsaa.afip.gov.ar/ws/services/LoginCms"';
      soapAction = 'urn:LoginCms';
      bodyContent = `
        <wsaa:loginCms>
          <wsaa:in0>${datosAfip.certBase64}</wsaa:in0>
        </wsaa:loginCms>`;
      break;

    case WsServicesNamesEnum.FECAESolicitar:
      namespace = 'xmlns:ar="http://ar.gov.afip.dif.FEV1/"';
      soapAction = 'http://ar.gov.afip.dif.FEV1/FECAESolicitar';
      bodyContent = `
        <ar:FECAESolicitar>
          ${generateAuthXml(datosAfip.Auth)}
          ${objectToXml(datosAfip.factura)}
        </ar:FECAESolicitar>`;
      break;

    case WsServicesNamesEnum.FECompUltimoAutorizado:
      namespace = 'xmlns:ar="http://ar.gov.afip.dif.FEV1/"';
      soapAction = 'http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado';
      bodyContent = `
        <ar:FECompUltimoAutorizado>
          ${generateAuthXml(datosAfip.Auth)}
          ${objectToXml(datosAfip.ultimoAutorizado)}
        </ar:FECompUltimoAutorizado>`;
      break;

    default:
      throw new AfipValidationError(`Método ${method} no soportado`);
  }

  const xml = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ${namespace}>
    <soapenv:Header/>
    <soapenv:Body>
      ${bodyContent}
    </soapenv:Body>
  </soapenv:Envelope>`;

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: soapAction,
    },
    body: xml.trim(),
  };
}

function generateAuthXml(auth: {
  Token: string;
  Sign: string;
  Cuit: string;
}): string {
  return `
          <ar:Auth>
            <ar:Token>${auth.Token}</ar:Token>
            <ar:Sign>${auth.Sign}</ar:Sign>
            <ar:Cuit>${auth.Cuit}</ar:Cuit>
          </ar:Auth>`;
}
export function generateResponse(
  xml: string,
  method: WsServicesNamesEnum,
): ILoginResponse | IFECAESolicitarResult | IFECompUltimoAutorizadoResult {
  const parsedXml = parseXml<any>(xml);
  switch (method) {
    case WsServicesNamesEnum.LoginCms:
      return extractLoginResponse(parsedXml);
    case WsServicesNamesEnum.FECAESolicitar:
      return extractFECAESolicitar(parsedXml);
    case WsServicesNamesEnum.FECompUltimoAutorizado:
      return extractFECompUltimoAutorizado(parsedXml);
    default:
      throw new AfipValidationError(`Método ${method} no soportado`);
  }
}

export function extractLoginResponse(result: object): ILoginResponse {
  const loginCmsReturn =
    result?.[`${PREFIX_ENVELOPE_LOGIN}`]?.[`${PREFIX_BODY_LOGIN}`]?.[
      'loginCmsResponse'
    ]?.['loginCmsReturn'];

  if (!loginCmsReturn) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró loginCmsReturn',
    );
  }
  const responseObject =
    parseXml<object>(loginCmsReturn)?.['loginTicketResponse'];
  if (!responseObject) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró loginTicketResponse',
    );
  }

  return responseObject;
}

export function extractFECAESolicitar(result: object): IFECAESolicitarResult {
  if (
    !result?.[`${PREFIX_ENVELOPE_SERVICE}`]?.[`${PREFIX_BODY_SERVICE}`]?.[
      'FECAESolicitarResponse'
    ]?.['FECAESolicitarResult']
  ) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró FECAESolicitarResult',
    );
  }
  return result[`${PREFIX_ENVELOPE_SERVICE}`][`${PREFIX_BODY_SERVICE}`]
    .FECAESolicitarResponse.FECAESolicitarResult;
}

export function extractFECompUltimoAutorizado(
  result: object,
): IFECompUltimoAutorizadoResult {
  if (
    !result?.[`${PREFIX_ENVELOPE_SERVICE}`]?.[`${PREFIX_BODY_SERVICE}`]?.[
      'FECompUltimoAutorizadoResponse'
    ]?.['FECompUltimoAutorizadoResult']
  ) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró FECompUltimoAutorizadoResult',
    );
  }
  return result[`${PREFIX_ENVELOPE_SERVICE}`][`${PREFIX_BODY_SERVICE}`]
    .FECompUltimoAutorizadoResponse.FECompUltimoAutorizadoResult;
}
export function parseXml<T>(xml: string): T {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    textNodeName: 'value',
  });
  return parser.parse(xml, true);
}

export async function getNetworkHour(): Promise<Date> {
  try {
    const timeSync = NtpTimeSync.getInstance({
      servers: ['time.afip.gov.ar'],
    });
    const res = await timeSync.getTime();
    return res.now;
  } catch (error) {
    throw new AfipNetworkError(`Error al obtener hora de red: ${error}`);
  }
}

export async function readStringFromFile(
  path: string,
  encoding: BufferEncoding = 'utf8',
): Promise<string> {
  try {
    return (await readFile(path)).toString(encoding);
  } catch (error) {
    throw new InternalServerErrorException(
      `Error al leer el archivo ${path}: ${error}`,
    );
  }
}
export function objectToXml(obj: any): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return '';
      }

      // Manejo especial para arrays
      if (Array.isArray(value)) {
        return value
          .map((item) => `<ar:${key}>${objectToXml(item)}</ar:${key}>`)
          .join('');
      }
      if (typeof value === 'object') {
        return `<ar:${key}>${objectToXml(value)}</ar:${key}>`;
      }
      return `<ar:${key}>${value}</ar:${key}>`;
    })
    .join('');
}
export function parseXmlResponse(xmlString: string) {
  return parseXml(xmlString);
}

export async function signMessage(
  message: string,
  config: IConfigService,
): Promise<string> {
  const privateKey = await readStringFromFile(config.privateKeyPath);
  const certPem = await readStringFromFile(config.certPath);
  const p7 = forge.pkcs7.createSignedData();

  p7.content = forge.util.createBuffer(message, 'utf8');

  const cert = forge.pki.certificateFromPem(certPem);
  p7.addCertificate(cert);

  p7.addSigner({
    key: forge.pki.privateKeyFromPem(privateKey),
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date(),
      },
    ],
  });

  p7.sign();

  const cmsDer = forge.asn1.toDer(p7.toAsn1()).getBytes();

  // Codificar el CMS en Base64
  const cmsBase64 = Buffer.from(cmsDer, 'binary').toString('base64');

  return cmsBase64;
}

export function incrementarComprobante(
  factura: IParamsFECAESolicitar,
  ultimonumero: number,
): IParamsFECAESolicitar {
  return {
    ...factura,
    FeCAEReq: {
      ...factura.FeCAEReq,
      FeDetReq: {
        ...factura.FeCAEReq.FeDetReq,
        FECAEDetRequest: {
          ...factura.FeCAEReq.FeDetReq.FECAEDetRequest,
          CbteDesde: ultimonumero + 1,
          CbteHasta: ultimonumero + 1,
        },
      },
    },
  };
}
export function extraerPuntoVentaYTipoComprobante(
  factura: IParamsFECAESolicitar,
): IParamsFECompUltimoAutorizado {
  return {
    PtoVta: factura.FeCAEReq.FeCabReq.PtoVta,
    CbteTipo: factura.FeCAEReq.FeCabReq.CbteTipo,
  };
}

export function procesarRespuestaAFIP(
  respuesta: IFECAESolicitarResult,
): ResultadoProcesado {
  const { Errors } = respuesta;
  const { Resultado, PtoVta, CbteTipo } = respuesta?.FeCabResp;
  const { CAE, CbteHasta, Observaciones, CbteFch, DocNro, DocTipo, CAEFchVto } =
    respuesta?.FeDetResp?.FECAEDetResponse;

  const numeroComprobante = `${PtoVta.toString().padStart(4, '0')}-${CbteHasta.toString().padStart(8, '0')}`;
  if (Resultado === 'A') {
    return {
      CAE,
      CAEFchVto,
      numeroComprobante,
      cbteTipo: CbteTipo,
      fechaFactura: CbteFch,
      docNro: DocNro,
      docTipo: DocTipo,
    };
  }

  // Si hay errores, los procesamos
  const erroresLimpios: Array<{ codigo: number; mensaje: string }> = [];

  // Procesamos errores generales si existen
  if (Errors) {
    if (Array.isArray(Errors.Err)) {
      erroresLimpios.push(
        ...Errors.Err.map((err) => ({
          codigo: err.Code,
          mensaje: err.Msg,
        })),
      );
    } else if (Errors.Err) {
      // Si es un objeto individual
      erroresLimpios.push({
        codigo: Errors.Err.Code,
        mensaje: Errors.Err.Msg,
      });
    }
  }
  // Procesamos observaciones si existen
  if (Observaciones) {
    if (Array.isArray(Observaciones.Obs)) {
      erroresLimpios.push(
        ...Observaciones.Obs.map((obs) => ({
          codigo: obs.Code,
          mensaje: obs.Msg,
        })),
      );
    } else if (Observaciones.Obs) {
      erroresLimpios.push({
        codigo: Observaciones.Obs.Code,
        mensaje: Observaciones.Obs.Msg,
      });
    }
  }

  return { errores: erroresLimpios };
}
