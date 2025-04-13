import { PartialType } from '@nestjs/mapped-types';
import { CreateAudiometriaDTO } from './create-audiometria.dto';

export class UpdateAudiometriaDTO extends PartialType(CreateAudiometriaDTO) {}
