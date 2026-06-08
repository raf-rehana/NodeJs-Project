import { Request } from 'express';

export function getBackendUrl(req: Request): string {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
}

export function getFrontendUrl(req: Request): string {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  const host = req.get('host') || 'localhost:4000';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:4200';
  }
  return 'https://saas-startupsaas.vercel.app';
}
