# capi

Very simple cache handler.

`npm install @rogierok/capi`

## Features
- Simple to use API for caching
- Supports localStorage and IndexedDB automatically
- TTL for cache entries
- Multiple namespaces

## Functions
- `set(key: string, value: any, options?: { ttl?: number }, namespace?: string): Promise<void>` Set value with optional TTL (ms) and namespace
- `get(key: string, namespace?: string): Promise<any | null>` Get value, optionally from namespace
- `delete(key: string, namespace?: string): Promise<void>` Delete value, optionally from namespace
- `clear(namespace?: string): Promise<void>` Clear all or only a namespace
- `keys(namespace?: string): Promise<string[]>` List all keys, optionally in a namespace
- `has(key: string, namespace?: string): Promise<boolean>` Check if key exists, optionally in a namespace
- `ns(namespace: string): void` Set default namespace for all operations

## License
MIT
