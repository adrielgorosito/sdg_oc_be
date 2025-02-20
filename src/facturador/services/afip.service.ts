import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AfipError, AfipValidationError } from '../errors/afip.errors';
import {
  IDatosAfip,
  ILoginResponse,
  IParamsAuth,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import { getLoginURL, getServiceURL } from '../utils/afip.urls';
import {
  generateLoginXml,
  generateResponse,
  generateSoapRequest,
  isExpired,
  signMessage,
} from '../utils/helpers';

@Injectable()
export class AfipService {
  private readonly soapConfig = {
    homo: process.env.NODE_ENV === 'production' ? false : true,
    certPath: this.config.get('AFIP_CERT_PATH'),
    privateKeyPath: this.config.get('AFIP_PRIVATE_KEY_PATH'),
    tokensExpireInHours: this.config.get('AFIP_TOKENS_EXPIRE_IN_HOURS'),
  };
  private token: string | null =
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgZHN0PSJDTj13c2ZlLCBPPUFGSVAsIEM9QVIiIHVuaXF1ZV9pZD0iMjQ4MjQ5NzM2NSIgZ2VuX3RpbWU9IjE3NDAwNjUzNTYiIGV4cF90aW1lPSIxNzQwMTA4NjE2Ii8+CiAgICA8b3BlcmF0aW9uIHR5cGU9ImxvZ2luIiB2YWx1ZT0iZ3JhbnRlZCI+CiAgICAgICAgPGxvZ2luIGVudGl0eT0iMzM2OTM0NTAyMzkiIHNlcnZpY2U9IndzZmUiIHVpZD0iU0VSSUFMTlVNQkVSPUNVSVQgMjA0MDk2Njc0ODIsIENOPW9wdGljYWNyaWFkb3Rlc3RpbmciIGF1dGhtZXRob2Q9ImNtcyIgcmVnbWV0aG9kPSIyMiI+CiAgICAgICAgICAgIDxyZWxhdGlvbnM+CiAgICAgICAgICAgICAgICA8cmVsYXRpb24ga2V5PSIyMDQwOTY2NzQ4MiIgcmVsdHlwZT0iNCIvPgogICAgICAgICAgICA8L3JlbGF0aW9ucz4KICAgICAgICA8L2xvZ2luPgogICAgPC9vcGVyYXRpb24+Cjwvc3NvPgo=';
  private sign: string | null =
    'JkTpjLwiLyUJGRbNdcDAtSxMsWCAb8s8mJi5BOE291NKcmWGVNnjOx2o04hepkkpx6ahP4K6K0+eqmkxbGyIguxpX/Hsvev3UpPdgs2qkvawTtyxff/YYWiDhr5WRlajLJkSFLnFfmWC3/lgy8cnhTOz7W6HSGk8Aom/5jch1I8=';
  private tokenExpiration: Date | null = new Date(
    '2025-02-21T00:30:16.319-03:00',
  );

  constructor(private config: ConfigService) {}

  public async getToken(): Promise<IParamsAuth> {
    const cuit = this.config.get('AFIP_CUIT');
    if (
      this.token &&
      this.tokenExpiration &&
      this.sign &&
      !isExpired(this.tokenExpiration.toISOString())
    ) {
      return {
        Auth: {
          Token: this.token,
          Sign: this.sign,
          Cuit: cuit,
        },
      };
    }
    const responseFromAfip: ILoginResponse = await this.getTokensFromNetwork();

    this.token = responseFromAfip.credentials.token;
    this.sign = responseFromAfip.credentials.sign;
    this.tokenExpiration = new Date(responseFromAfip.header.expirationTime);

    return {
      Auth: {
        Token: this.token,
        Sign: this.sign,
        Cuit: cuit,
      },
    };
  }

  public async getTokensFromNetwork(): Promise<ILoginResponse> {
    /*     const dummyResponse = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <soapenv:Body>
        <loginCmsResponse xmlns="http://wsaa.afip.gov.ar/ws/services/LoginCms">
            <loginCmsReturn>
                <loginTicketResponse version="1.0">
                    <header>
                        <source>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</source>
                        <destination>SERIALNUMBER=CUIT 20409667482, CN=opticacriadotesting</destination>
                        <uniqueId>4200677225</uniqueId>
                        <generationTime>2025-02-20T12:30:16.319-03:00</generationTime>
                        <expirationTime>2025-02-21T00:30:16.319-03:00</expirationTime>
                    </header>
                    <credentials>
                        <token>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgZHN0PSJDTj13c2ZlLCBPPUFGSVAsIEM9QVIiIHVuaXF1ZV9pZD0iMjQ4MjQ5NzM2NSIgZ2VuX3RpbWU9IjE3NDAwNjUzNTYiIGV4cF90aW1lPSIxNzQwMTA4NjE2Ii8+CiAgICA8b3BlcmF0aW9uIHR5cGU9ImxvZ2luIiB2YWx1ZT0iZ3JhbnRlZCI+CiAgICAgICAgPGxvZ2luIGVudGl0eT0iMzM2OTM0NTAyMzkiIHNlcnZpY2U9IndzZmUiIHVpZD0iU0VSSUFMTlVNQkVSPUNVSVQgMjA0MDk2Njc0ODIsIENOPW9wdGljYWNyaWFkb3Rlc3RpbmciIGF1dGhtZXRob2Q9ImNtcyIgcmVnbWV0aG9kPSIyMiI+CiAgICAgICAgICAgIDxyZWxhdGlvbnM+CiAgICAgICAgICAgICAgICA8cmVsYXRpb24ga2V5PSIyMDQwOTY2NzQ4MiIgcmVsdHlwZT0iNCIvPgogICAgICAgICAgICA8L3JlbGF0aW9ucz4KICAgICAgICA8L2xvZ2luPgogICAgPC9vcGVyYXRpb24+Cjwvc3NvPgo=</token>
                        <sign>JkTpjLwiLyUJGRbNdcDAtSxMsWCAb8s8mJi5BOE291NKcmWGVNnjOx2o04hepkkpx6ahP4K6K0+eqmkxbGyIguxpX/Hsvev3UpPdgs2qkvawTtyxff/YYWiDhr5WRlajLJkSFLnFfmWC3/lgy8cnhTOz7W6HSGk8Aom/5jch1I8=</sign>
                    </credentials>
                </loginTicketResponse>
            </loginCmsReturn>
        </loginCmsResponse>
    </soapenv:Body>
</soapenv:Envelope>`; */

    const signedData = await signMessage(
      await generateLoginXml(),
      this.soapConfig,
    );
    return (await this.execMethod(WsServicesNamesEnum.LoginCms, {
      certBase64: signedData,
    })) as ILoginResponse;
  }

  public async execMethod(method: WsServicesNamesEnum, params: IDatosAfip) {
    try {
      switch (method) {
        case WsServicesNamesEnum.FECAESolicitar:
          params.factura.Auth = (await this.getToken()).Auth;
          break;
        case WsServicesNamesEnum.FECompUltimoAutorizado:
          params.ultimoAutorizado.Auth = (await this.getToken()).Auth;
          break;
        case WsServicesNamesEnum.LoginCms:
          break;
        default:
          throw new AfipValidationError(`Método ${method} no soportado`);
      }

      const content = generateSoapRequest(method, params);

      const response = await fetch(
        method === WsServicesNamesEnum.LoginCms
          ? getLoginURL()
          : getServiceURL(),
        content,
      );
      if (!response.ok) {
        throw new ServiceUnavailableException(
          `Error en servicio AFIP ${method}: ${response.status} - ${response.statusText}`,
        );
      }
      const xmlResponse = await response.text();
      const fullResponse = await generateResponse(xmlResponse, method);
      return fullResponse;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      } else if (error instanceof AfipError) {
        console.log(error);

        throw error;
      }
      throw new InternalServerErrorException(
        `Error en servicio AFIP: ${error}`,
      );
    }
  }
}
