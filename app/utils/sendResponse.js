export function sendResponse(
  _res,
  { ok = true, status = 200, message = "", data = null, code = undefined } = {},
) {
  const payload = { ok, status, message, data };
  if (code !== undefined) payload.code = code;
  return payload;
}
