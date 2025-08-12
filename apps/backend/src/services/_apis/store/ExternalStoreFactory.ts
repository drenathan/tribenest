import { ExternalStore, ExternalStoreArgs, ExternalStoreProvider } from "./ExternalStore";
import { ExternalStorePrintful } from "./ExternalStorePrintful";

export class ExternalStoreFactory {
  public static create(provider: ExternalStoreProvider, args: ExternalStoreArgs): ExternalStore {
    switch (provider) {
      case ExternalStoreProvider.Printful:
        return new ExternalStorePrintful(args);
      default:
        throw new Error(`External store ${provider} not found`);
    }
  }
}
