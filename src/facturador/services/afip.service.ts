import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AfipAuthError } from '../errors/afip.errors';
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
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgZHN0PSJDTj13c2ZlLCBPPUFGSVAsIEM9QVIiIHVuaXF1ZV9pZD0iMjM4NjI3NjI4MyIgZ2VuX3RpbWU9IjE3NDAxNTk5NDUiIGV4cF90aW1lPSIxNzQwMjAzMjA1Ii8+CiAgICA8b3BlcmF0aW9uIHR5cGU9ImxvZ2luIiB2YWx1ZT0iZ3JhbnRlZCI+CiAgICAgICAgPGxvZ2luIGVudGl0eT0iMzM2OTM0NTAyMzkiIHNlcnZpY2U9IndzZmUiIHVpZD0iU0VSSUFMTlVNQkVSPUNVSVQgMjA0MDk2Njc0ODIsIENOPW9wdGljYWNyaWFkb3Rlc3RpbmciIGF1dGhtZXRob2Q9ImNtcyIgcmVnbWV0aG9kPSIyMiI+CiAgICAgICAgICAgIDxyZWxhdGlvbnM+CiAgICAgICAgICAgICAgICA8cmVsYXRpb24ga2V5PSIyMDQwOTY2NzQ4MiIgcmVsdHlwZT0iNCIvPgogICAgICAgICAgICA8L3JlbGF0aW9ucz4KICAgICAgICA8L2xvZ2luPgogICAgPC9vcGVyYXRpb24+Cjwvc3NvPgo=';
  private sign: string | null =
    'Z7Nvu4tWQ2lAGBKyJXSP8ufkPeAifo3wKWKnq8SIEIHwKC5AiGePJl3OYK0lF42gqeq0Ev5ETFfBsGSeu+If9mO/F0cZaS/Cqv3azWiXZ+/BOftQSxB9aupalhYx94vhmLQ/bNcCL0aejyOMm5CakdgZ9bvJtmQWSF1W+bVfvdM=';
  private tokenExpiration: Date | null = new Date(
    '2025-02-22T02:46:45.602-03:00',
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
        Token: this.token,
        Sign: this.sign,
        Cuit: cuit,
      };
    }
    const responseFromAfip: ILoginResponse = await this.getTokensFromNetwork();

    this.token = responseFromAfip.credentials.token;
    this.sign = responseFromAfip.credentials.sign;
    this.tokenExpiration = new Date(responseFromAfip.header.expirationTime);

    return {
      Token: this.token,
      Sign: this.sign,
      Cuit: cuit,
    };
  }

  public async getTokensFromNetwork(): Promise<ILoginResponse> {
    const signedData = await signMessage(
      await generateLoginXml(),
      this.soapConfig,
    );
    return (await this.execMethod(WsServicesNamesEnum.LoginCms, {
      certBase64: signedData,
    })) as ILoginResponse;
  }

  public async execMethod(method: WsServicesNamesEnum, params: IDatosAfip) {
    if (method !== WsServicesNamesEnum.LoginCms) {
      const Auth = await this.getToken();
      if (!Auth) {
        throw new AfipAuthError('No se pudo obtener el token');
      }
      params.Auth = Auth;
    }

    const content = generateSoapRequest(method, params);

    const response = await fetch(
      method === WsServicesNamesEnum.LoginCms ? getLoginURL() : getServiceURL(),
      content,
    );
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Error en servicio AFIP ${method}: ${response.status} - ${response.statusText}`,
      );
    }
    const xmlResponse = await response.text();

    return await generateResponse(xmlResponse, method);
  }
}
