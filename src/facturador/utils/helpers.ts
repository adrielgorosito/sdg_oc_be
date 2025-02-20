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
  WsServicesNamesEnum,
} from '../interfaces/ISoap';

export const readFile = fs.readFile;
export const writeFile = fs.writeFile;
const prefixEnvelope = 'soap:Envelope';
const prefixBody = 'soap:Body';

export function isExpired(expireStr: string): boolean {
  const now = new Date();
  const expire = new Date(expireStr);
  return compareAsc(now, expire) >= 0;
}
export async function generateLoginXml(): Promise<string> {
  const networkTime = await getNetworkHour();
  const expire = add(networkTime, { hours: 12 });
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
  datosAfip: {
    certBase64?: string;
    factura?: IParamsFECAESolicitar;
    ultimoAutorizado?: IParamsFECompUltimoAutorizado;
  },
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
        !datosAfip.factura.Auth?.Token ||
        !datosAfip.factura.Auth?.Sign ||
        !datosAfip.factura.Auth?.Cuit
      ) {
        throw new AfipValidationError(
          'Los datos de autenticación (token, sign y cuit) son requeridos para FECAESolicitar',
        );
      }
      if (
        !datosAfip.factura.datosFactura?.FeCAEReq?.FeCabReq ||
        !datosAfip.factura.datosFactura?.FeCAEReq?.FeDetReq
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
        !datosAfip.ultimoAutorizado.Auth?.Token ||
        !datosAfip.ultimoAutorizado.Auth?.Sign ||
        !datosAfip.ultimoAutorizado.Auth?.Cuit
      ) {
        throw new AfipValidationError(
          'Los datos de autenticación (token, sign y cuit) son requeridos para FECompUltimoAutorizado',
        );
      }
      if (
        !datosAfip.ultimoAutorizado.datosUltimoAutorizado?.PtoVta ||
        !datosAfip.ultimoAutorizado.datosUltimoAutorizado?.CbteTipo
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
          ${generateAuthXml(datosAfip.factura.Auth)}
          ${objectToXml(datosAfip.factura.datosFactura)}
        </ar:FECAESolicitar>`;
      break;

    case WsServicesNamesEnum.FECompUltimoAutorizado:
      namespace = 'xmlns:ar="http://ar.gov.afip.dif.FEV1/"';
      soapAction = 'http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado';
      bodyContent = `
        <ar:FECompUltimoAutorizado>
          ${generateAuthXml(datosAfip.ultimoAutorizado.Auth)}
          ${objectToXml(datosAfip.ultimoAutorizado.datosUltimoAutorizado)}
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
  if (
    !result?.[`${prefixEnvelope}`]?.[`${prefixBody}`]?.['loginCmsResponse']?.[
      'loginCmsReturn'
    ]?.['loginTicketResponse']
  ) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró loginCmsReturn',
    );
  }
  return result[`${prefixEnvelope}`][`${prefixBody}`]['loginCmsResponse'][
    'loginCmsReturn'
  ]['loginTicketResponse'];
}

export function extractFECAESolicitar(result: object): IFECAESolicitarResult {
  if (
    !result?.[`${prefixEnvelope}`]?.[`${prefixBody}`]?.[
      'FECAESolicitarResponse'
    ]?.['FECAESolicitarResult']
  ) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró FECAESolicitarResult',
    );
  }
  return result[`${prefixEnvelope}`][`${prefixBody}`].FECAESolicitarResponse
    .FECAESolicitarResult;
}

export function extractFECompUltimoAutorizado(
  result: object,
): IFECompUltimoAutorizadoResult {
  if (
    !result?.[`${prefixEnvelope}`]?.[`${prefixBody}`]?.[
      'FECompUltimoAutorizadoResponse'
    ]?.['FECompUltimoAutorizadoResult']
  ) {
    throw new AfipXMLError(
      'Estructura XML inválida: No se encontró FECompUltimoAutorizadoResult',
    );
  }
  return result[`${prefixEnvelope}`][`${prefixBody}`]
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
  // Método auxiliar para convertir objeto a XML
  return Object.entries(obj)
    .map(([key, value]) => `<ar:${key}>${value}</ar:${key}>`)
    .join('');
}
export function parseXmlResponse(xmlString: string) {
  // Usar parseXml existente y extraer el resultado específico del método
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
