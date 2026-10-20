export default function handler(_req: any, res: any) {
  const payload = {
    status: 'ok',
    service: 'SpidyDashboard API',
    timestamp: new Date().toISOString(),
  };
  if (res.status && res.json) return res.status(200).json(payload);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(payload));
}
