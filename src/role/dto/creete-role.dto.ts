import PermissionDto from './create-permission.dto';

export default class RoleDto {
  name: string;
  permissions: PermissionDto[];
}
