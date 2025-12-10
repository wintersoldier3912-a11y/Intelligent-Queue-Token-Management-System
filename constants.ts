import { Service, Counter, User, UserRole } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', code: 'D', name: 'Cash Deposit', description: 'Deposit cash into your account', estimatedTimeMinutes: 4 },
  { id: 's2', code: 'W', name: 'Cash Withdrawal', description: 'Withdraw cash from your account', estimatedTimeMinutes: 3 },
  { id: 's3', code: 'P', name: 'Passbook Update', description: 'Update your passbook records', estimatedTimeMinutes: 6 },
  { id: 's4', code: 'L', name: 'Loan Inquiry', description: 'Speak with a loan officer', estimatedTimeMinutes: 15 },
];

export const INITIAL_COUNTERS: Counter[] = [
  { id: 'c1', name: 'Counter 1', status: 'OPEN', assignedServiceIds: ['s1', 's2'] },
  { id: 'c2', name: 'Counter 2', status: 'OPEN', assignedServiceIds: ['s1', 's2', 's3'] },
  { id: 'c3', name: 'Counter 3', status: 'CLOSED', assignedServiceIds: ['s4'] },
];

export const INITIAL_USERS: User[] = [
  { id: 'u0', name: 'System Admin', email: 'admin@bank.com', role: UserRole.ADMIN },
  { id: 'u1', name: 'Alice Operator', email: 'alice@bank.com', role: UserRole.OPERATOR, counterId: 'c1' },
  { id: 'u2', name: 'Bob Operator', email: 'bob@bank.com', role: UserRole.OPERATOR, counterId: 'c2' },
  { id: 'u3', name: 'Charlie Loan', email: 'charlie@bank.com', role: UserRole.OPERATOR, counterId: 'c3' },
];
