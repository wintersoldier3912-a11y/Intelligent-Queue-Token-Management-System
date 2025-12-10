export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  KIOSK = 'KIOSK',
  CUSTOMER = 'CUSTOMER',
}

export enum TokenStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  SERVING = 'SERVING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  counterId?: string; // If operator, assigned counter
}

export interface Service {
  id: string;
  code: string; // e.g., 'D' for Deposit
  name: string;
  description: string;
  estimatedTimeMinutes: number;
}

export interface Counter {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  assignedServiceIds: string[];
  currentOperatorId?: string;
}

export interface Token {
  id: string;
  ticketNumber: string; // e.g., A-101
  serviceId: string;
  counterId?: string;
  status: TokenStatus;
  customerName?: string;
  customerPhone?: string;
  createdAt: number;
  calledAt?: number;
  servedAt?: number;
  completedAt?: number;
}

export interface SystemState {
  services: Service[];
  counters: Counter[];
  tokens: Token[];
  users: User[];
}