import { Services } from "@src/services";
import { Workers } from "@src/workers";

export interface IBaseControllerArgs {
  services: Services;
  workers: Workers;
}

export class BaseController {
  constructor(
    public readonly services: Services,
    public readonly workers: Workers,
  ) {}
}
