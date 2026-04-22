export type UserRole = 'admin' | 'collaborator' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  clientIds?: string[];
}

export type DataSource = 'omie' | 'conta_azul' | 'excel';

export interface Client {
  id: string;
  name: string;
  dataSource: DataSource;
  omieCreds?: {
    appKey: string;
    appSecret: string;
  };
  contaAzulCreds?: {
    clientId: string;
    clientSecret: string;
  };
  assignedCollaborators?: string[];
  createdAt: string;
}

export type TransactionType = 'revenue' | 'expense';
export type TransactionStatus = 'pending' | 'paid' | 'overdue';

export interface Transaction {
  id: string;
  clientId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  dueDate: string;
  paymentDate?: string;
  status: TransactionStatus;
  source: DataSource;
}

export interface SyncLog {
  id: string;
  clientId: string;
  timestamp: string;
  status: 'success' | 'error';
  message: string;
  userUid: string;
}
