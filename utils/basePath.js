// Must stay in sync with `basePath` in next.config.js.
// Next.js's basePath is applied automatically to next/link and next/image,
// but NOT to plain <img>/<link> tags with hardcoded src/href values —
// those need this prefix added manually.
export const basePath = '/draft-helper3'

export const withBasePath = (path) => `${basePath}${path.startsWith('/') ? path : `/${path}`}`
