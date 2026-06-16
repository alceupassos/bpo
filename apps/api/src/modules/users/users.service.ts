import { users } from "../../data/seed";

export class UsersService {
  findAll(companyId?: string | null) {
    const scoped = companyId
      ? users.filter((user) => user.companyId === companyId)
      : users;
    // Nunca expõe a senha demo.
    return scoped.map(({ password, ...rest }) => rest);
  }
}
