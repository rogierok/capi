# capi

Very simple browser storage/cache handler, keeping it simple and easy to understand.

With the countless differences between localStorage and IndexedDB it can be a headache to manage your cache data, with capi you don't even have to think about it, it just works!

*This library is browser-only. It relies on `localStorage` and `IndexedDB`, which are not available in Node.js environments.*

`npm install @rogierok/capi`

## Features

- Simple API for caching with promises
- Automatically uses `localStorage` for small items and uses `IndexedDB` for large or complex data, including fallback's or storage failure
- Supports **chunking** large values to avoid size limits in IndexedDB
- Supports **TTL (time-to-live)** expiration for cache entries (in seconds) with automatic background cleanup
- Supports **namespaces** to avoid key collisions and organize cached data
- Background handling of localStorage and IndexedDB without changing any syntax

---

## API

```javascript
import capi from '@rogierok/capi';
```

### `set(key, value, options?, namespace?)`

Stores a value under `key` with optional TTL and chunking.

- **key** (`string`) — The key to store the value under
- **value** (`any`) — The value to store (any JSON-serializable data)
- **options** (`object`) — Optional settings:
  - `ttl` (`number`) — Time-to-live in seconds (after which cache expires)
  - `chunk` (`boolean | number`) — Controls chunking behavior for large values:
    - `true` (default): chunk large values automatically (default chunk size 512 KB)
    - `false`: disable chunking  
    - `number`: chunk size in KB (e.g. `256` for 256 KB chunks)  
- **namespace** (`string`) — Optional namespace to isolate keys  

```javascript
// Example: Store a lion object in the 'mammals' namespace
await capi.set('lion', {name: 'Simba', habitat: 'Savannah'}, 'mammals');

// Example: Store a large zebra family with 256kb chunks
const zebraFamily = Array(100000).fill('zebra');
await capi.set('zebra', zebraFamily, {chunk: 256}, 'mammals');

// Example: Store a seal that gets released in 1 hour (ttl: 1 hour)
await capi.set('seal', {name: 'Neil', habitat: 'Pool'}, {ttl: 3600}, 'mammals');
```

---

### `get(key, namespace?)`

Retrieves the cached value for `key` or only within the specified namespace

- Returns the parsed value or `null` if not found or expired.

```javascript
// Example: Retrieve the lion object from the 'mammals' namespace
const lion = await capi.get('lion', 'mammals');
console.log(lion); // {name: 'Lion', habitat: 'Savannah'}
```

---

### `delete(key, namespace?)`

Deletes the cached value and any chunks stored under `key` or only within the specified namespace.

```javascript
// Example: Delete the lion object from the 'mammals' namespace
await capi.delete('lion', 'mammals');
```

---

### `clear(namespace?)`

Clears all cached entries globally or only within the specified namespace.

```javascript
// Example: Clear all animals in the 'mammals' namespace
await capi.clear('mammals');
```

---

### `keys(namespace?)`

Returns a list of all cached keys or only within the specified namespace.

```javascript
// Example: List all animal keys in the 'birds' namespace
const birdKeys = await capi.keys('birds');
console.log(birdKeys); // ['parrot', 'eagle', ...]
```

---

### `has(key, namespace?)`

Checks if a non-expired cache entry exists for `key` or only within the specified namespace.

Returns `true` or `false`.

```javascript
// Example: Check if an elephant exists in the 'mammals' namespace
const hasElephant = await capi.has('elephant', 'mammals');
console.log(hasElephant); // true or false
```

---

## Storage behavior

- Values that serialize to JSON and are small enough are stored in `localStorage` for fast access.
- Large values (by default over 1MB) are stored in IndexedDB.
- Very large values (2.5MB or above) are **split into chunks** (default 512 KB) and stored as separate records in IndexedDB to work around browser limits.
- Expired entries are cleaned up automatically every minute.
- Namespaces prefix keys with `{namespace}::` to avoid collisions.

---

## License
MIT
