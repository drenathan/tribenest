import { BaseService } from "../baseService";

export class SessionService extends BaseService {
  public async findById(id: string) {
    return this.models.Session.findById(id);
  }

  public async deleteSession(id: string) {
    return this.models.Session.findByIdAndDelete(id);
  }
}
