import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ParametrosService } from 'src/parametros/parametros.service';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
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
  private token: string | null;
  private sign: string | null;
  private tokenExpiration: Date | null;
  constructor(
    private parameterService: ParametrosService,
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async getToken(): Promise<IParamsAuth> {
    const cuit = (await this.parameterService.getParam('AFIP_CUIT')).value;
    let tokenFromDB: Token | null;
    if (
      this.token &&
      this.tokenExpiration?.toISOString() &&
      this.sign &&
      !isExpired(this.tokenExpiration?.toISOString())
    ) {
      return {
        Token: this.token,
        Sign: this.sign,
        Cuit: cuit,
      };
    } else if (!this.token || !this.sign) {
      tokenFromDB = await this.tokenRepository.findOne({
        where: {
          id: 1,
        },
      });
      if (
        tokenFromDB &&
        !isExpired(tokenFromDB.tokenExpiration.toISOString())
      ) {
        this.token = tokenFromDB.token;
        this.sign = tokenFromDB.sign;
        this.tokenExpiration = tokenFromDB.tokenExpiration;
        return {
          Token: tokenFromDB.token,
          Sign: tokenFromDB.sign,
          Cuit: cuit,
        };
      }
    }
    const tokenCredentials = await this.getTokensFromNetwork();

    this.token = tokenCredentials.credentials.token;
    this.sign = tokenCredentials.credentials.sign;
    this.tokenExpiration = new Date(tokenCredentials.header.expirationTime);

    try {
      if (tokenFromDB) {
        await this.tokenRepository.update(
          { id: 1 },
          {
            token: this.token,
            sign: this.sign,
            tokenExpiration: new Date(this.tokenExpiration),
          },
        );
      } else {
        await this.tokenRepository.save({
          id: 1,
          token: this.token,
          sign: this.sign,
          tokenExpiration: this.tokenExpiration,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudo guardar el token' + error,
      );
    }

    return {
      Token: this.token,
      Sign: this.sign,
      Cuit: cuit,
    };
  }

  public async getTokensFromNetwork(): Promise<ILoginResponse> {
    const signedData = await signMessage(
      await generateLoginXml(),
      this.configService,
    );

    const tokenCredentials = (await this.execMethod(
      WsServicesNamesEnum.LoginCms,
      {
        certBase64: signedData,
      },
    )) as ILoginResponse;

    return tokenCredentials;
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
        `Error en servicio AFIP ${method}: ${response.status} - ${response.statusText} \n
        ${await response.text()}`,
      );
    }
    const xmlResponse = await response.text();

    return await generateResponse(xmlResponse, method);
  }
}
