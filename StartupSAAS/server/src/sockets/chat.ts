import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export const connectedClients = new Map<string, Socket>();
export const connectedEmployees = new Map<string, Socket>();

export function setupSockets(io: Server) {
  io.on('connection', (socket: any) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('authenticate-client', ({ clientId, clientName }: any) => {
      socket.clientId = clientId;
      socket.clientName = clientName;
      socket.role = 'client';

      connectedClients.set(clientId, socket);
      socket.join(`client-${clientId}`);
      console.log(`Client authenticated: ${clientName} (${clientId})`);
      io.emit('client-joined', { clientId, clientName });

      setTimeout(() => {
        const welcomeMsg = {
          id: uuidv4(),
          employeeId: 'support-bot',
          employeeName: 'StartupSAAS Support',
          message: `Hello ${clientName}! How can we help you today with your request?`,
          timestamp: new Date().toISOString(),
          type: 'employee'
        };
        socket.emit('new-message', welcomeMsg);
      }, 1000);
    });

    socket.on('authenticate-employee', ({ employeeId, employeeName }: any) => {
      socket.employeeId = employeeId;
      socket.employeeName = employeeName;
      socket.role = 'employee';

      connectedEmployees.set(employeeId, socket);
      socket.join(`employee-${employeeId}`);
      console.log(`Employee authenticated: ${employeeName} (${employeeId})`);
      io.emit('employee-joined', { employeeId, employeeName });
    });

    socket.on('client-message', ({ message, employeeId }: any) => {
      if (socket.role === 'client' && socket.clientId) {
        const messageData = {
          id: uuidv4(),
          clientId: socket.clientId,
          clientName: socket.clientName,
          message,
          timestamp: new Date().toISOString(),
          type: 'client'
        };

        if (employeeId && connectedEmployees.has(employeeId)) {
          io.to(`employee-${employeeId}`).emit('new-message', messageData);
        } else {
          io.to('employees').emit('new-message', messageData);
        }

        socket.emit('new-message', messageData);

        setTimeout(() => {
          const botResponse = {
            id: uuidv4(),
            employeeId: 'support-bot',
            employeeName: 'StartupSAAS Assistant',
            message: `Thanks for the update, ${socket.clientName}! I have successfully logged this inquiry.`,
            timestamp: new Date().toISOString(),
            type: 'employee'
          };
          socket.emit('new-message', botResponse);
        }, 1500);
      }
    });

    socket.on('employee-message', ({ message, clientId }: any) => {
      if (socket.role === 'employee' && socket.employeeId) {
        const messageData = {
          id: uuidv4(),
          employeeId: socket.employeeId,
          employeeName: socket.employeeName,
          message,
          timestamp: new Date().toISOString(),
          type: 'employee'
        };

        if (clientId && connectedClients.has(clientId)) {
          io.to(`client-${clientId}`).emit('new-message', messageData);
        }

        socket.emit('new-message', messageData);
      }
    });

    socket.on('client-typing', ({ employeeId }: any) => {
      if (socket.role === 'client' && socket.clientId) {
        io.to(`employee-${employeeId}`).emit('client-typing', { clientId: socket.clientId });
      }
    });

    socket.on('employee-typing', ({ clientId }: any) => {
      if (socket.role === 'employee' && socket.employeeId) {
        io.to(`client-${clientId}`).emit('employee-typing', { employeeId: socket.employeeId });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.role === 'client' && socket.clientId) {
        connectedClients.delete(socket.clientId);
        io.emit('client-left', { clientId: socket.clientId });
      }

      if (socket.role === 'employee' && socket.employeeId) {
        connectedEmployees.delete(socket.employeeId);
        io.emit('employee-left', { employeeId: socket.employeeId });
      }
    });
  });
}
