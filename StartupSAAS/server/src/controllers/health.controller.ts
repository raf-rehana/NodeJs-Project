import { Request, Response } from 'express';
import { connectedClients, connectedEmployees } from '../sockets/chat';

export class HealthController {
  static getHealth(req: Request, res: Response) {
    res.json({
      status: 'ok',
      mode: 'SANDBOX',
      timestamp: new Date().toISOString()
    });
  }

  static getOnlineClients(req: Request, res: Response) {
    const clients = Array.from(connectedClients.keys()).map(clientId => ({
      clientId,
      connected: true
    }));
    res.json(clients);
  }

  static getOnlineEmployees(req: Request, res: Response) {
    const employees = Array.from(connectedEmployees.keys()).map(employeeId => ({
      employeeId,
      connected: true
    }));
    res.json(employees);
  }
}
