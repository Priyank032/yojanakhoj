const ok = (data, statusCode = 200) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(data),
});

const err = (code, message, statusCode = 400) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify({ error: true, code, message }),
});

module.exports = { ok, err };
