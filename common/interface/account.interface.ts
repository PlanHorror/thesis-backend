import { Role } from 'common/enum';

export interface AccountPayload {
  id: string;
  email?: string;
  role: Role;
}
