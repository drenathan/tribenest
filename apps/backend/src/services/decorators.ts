import { BaseService } from "./baseService";

const ON_EVENT_DECORATOR_KEY = Symbol("event:decorator");

export function onEvent(eventName: string) {
  return function (target: any, methodKey: string) {
    const value = {
      eventName,
      methodKey,
    };
    const currentMetadata = Reflect.getMetadata(ON_EVENT_DECORATOR_KEY, target) || {};
    currentMetadata[`${methodKey}-${eventName}`] = value;
    Reflect.defineMetadata(ON_EVENT_DECORATOR_KEY, currentMetadata, target);
  };
}

export function EventListener<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      const metadata = Reflect.getMetadata(ON_EVENT_DECORATOR_KEY, this) as Record<string, any>;

      Object.values(metadata).forEach((value) => {
        const { eventName, methodKey } = value;
        const method = (this as any)[methodKey];

        if (typeof method !== "function") {
          throw new Error(`Method ${methodKey} is not a function`);
        }
        args[0].emitter.on(eventName, method.bind(this));
      });
    }
  };
}
