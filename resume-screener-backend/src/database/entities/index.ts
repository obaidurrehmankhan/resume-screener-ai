import { User } from '../../modules/user/user.entity';
import { Draft } from './draft.entity';
import { Analysis } from './analysis.entity';
import { Rewrite } from './rewrite.entity';
import { File } from './file.entity';

export const ENTITIES = [User, Draft, Analysis, Rewrite, File];

export { User, Draft, Analysis, Rewrite, File };
