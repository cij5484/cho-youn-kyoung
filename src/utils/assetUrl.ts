const externalAssetPattern = /^(https?:|data:|blob:)/;

export function assetUrl(path?: string) {
  if (!path) return undefined;
  if (externalAssetPattern.test(path)) return path;

  const baseUrl = import.meta.env.BASE_URL;
  const normalizedPath = path.replace(/^\/+/, '');
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (path === baseUrl || path.startsWith(normalizedBase)) return path;

  return `${normalizedBase}${normalizedPath}`;
}
