import { PartialType } from '@nestjs/mapped-types';
import { CreatePostReactDto } from './create-post-react.dto';

export class UpdatePostReactDto extends PartialType(CreatePostReactDto) {}
