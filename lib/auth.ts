export function checkAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const apiKey = authHeader.split('Bearer ')[1];
  
  // 1. Check legacy single key
  const expectedKey = process.env.MEMORIA_API_KEY;
  if (expectedKey && apiKey === expectedKey) {
    return true;
  }

  // 2. Check multi-tenant keys (comma-separated list in MEMORIA_API_KEYS)
  const multiKeys = process.env.MEMORIA_API_KEYS;
  if (multiKeys) {
    const validKeys = multiKeys.split(',').map(k => k.trim());
    if (validKeys.includes(apiKey)) {
      return true;
    }
  }

  // 3. If no keys are configured at all, allow access (for local dev without env vars)
  if (!expectedKey && !multiKeys) {
    return true;
  }

  return false;
}
