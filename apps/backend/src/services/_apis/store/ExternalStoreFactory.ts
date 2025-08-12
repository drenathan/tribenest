import { ExternalStore, ExternalStoreArgs, ExternalStoreName } from "./ExternalStore";
import { ExternalStorePrintful } from "./ExternalStorePrintful";

export class ExternalStoreFactory {
  public static create(name: ExternalStoreName, args: ExternalStoreArgs): ExternalStore {
    switch (name) {
      case ExternalStoreName.Printful:
        return new ExternalStorePrintful(args);
      default:
        throw new Error(`External store ${name} not found`);
    }
  }
}
