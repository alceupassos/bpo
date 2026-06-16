import { companies } from "../../data/seed";

export class CompaniesService {
  findAll(companyId?: string | null) {
    if (companyId) {
      return companies.filter((company) => company.id === companyId);
    }
    return companies;
  }

  findOne(id: string) {
    return companies.find((company) => company.id === id);
  }
}
