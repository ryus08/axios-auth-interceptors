import { Cache } from 'cache-manager';

// Cache is defined wrong. Doesn't allow for dynamic ttl. PR filed
export interface CorrectCache extends Cache {
  wrap<T>(key: string, wrapper: (callback: (error: any, result: T) => void) => void, options: CorrectCachingConfig, callback: (error: any, result: T) => void): void;
  wrap<T>(key: string, wrapper: (callback: (error: any, result: T) => void) => void, callback: (error: any, result: T) => void): void;
  wrap<T>(key: string, wrapper: (callback: (error: any, result: T) => void) => any, options: CorrectCachingConfig): Promise<any>;
  wrap<T>(key: string, wrapper: (callback: (error: any, result: T) => void) => void): Promise<any>;
}

export interface CorrectCachingConfig {
  ttl: number | TtlFunction;
}

export interface TtlFunction {
  (result: any): number;
}
