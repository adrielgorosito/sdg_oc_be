import { PartialType } from '@nestjs/mapped-types';
import { CreateObraSocialDTO } from './create-obra-social.dto';

export class UpdateObraSocialDTO extends PartialType(CreateObraSocialDTO) {}
