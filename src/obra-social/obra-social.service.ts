import { Injectable } from '@nestjs/common';
import { CreateObraSocialDto } from './dto/obra-social.dto';
import { UpdateObraSocialDto } from './dto/update-obra-social.dto';

@Injectable()
export class ObraSocialService {
  create(createObraSocialDto: CreateObraSocialDto) {
    return 'This action adds a new obraSocial';
  }

  findAll() {
    return `This action returns all obraSocial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} obraSocial`;
  }

  update(id: number, updateObraSocialDto: UpdateObraSocialDto) {
    return `This action updates a #${id} obraSocial`;
  }

  remove(id: number) {
    return `This action removes a #${id} obraSocial`;
  }
}
