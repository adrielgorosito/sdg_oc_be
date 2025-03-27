import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parametro } from './entities/parametro.entity';

@Injectable()
export class ParametrosService implements OnModuleInit {
  private parametros: Parametro[];
  constructor(
    @InjectRepository(Parametro)
    private configRepository: Repository<Parametro>,
  ) {
    this.parametros = [];
  }

  async onModuleInit() {
    await this.loadInitialConfig();
  }

  async loadInitialConfig() {
    this.parametros = await this.configRepository.find();
  }

  async getParam(key: string): Promise<Parametro | null> {
    let config = this.parametros.find((param) => param.key === key);
    if (config) {
      return config;
    }
    config = await this.configRepository.findOne({ where: { key } });
    if (config) {
      this.parametros.push(config);
      return config;
    }
    return null;
  }

  async setParam(key: string, value: string): Promise<string> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (config) {
      config.value = value;
      await this.configRepository.save(config);
    } else {
      await this.configRepository.save({ key, value });
    }
    return value;
  }

  async getAllParams(): Promise<Record<string, string>> {
    const params = await this.configRepository.find();
    return params.reduce(
      (acc, { key, value }) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
