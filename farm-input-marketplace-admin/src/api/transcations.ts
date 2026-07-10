import { api } from './client';

export type TxStatus = 'Cleared' | 'Pending' | 'Review';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  commission: number;
  status: TxStatus;
}

export interface TransactionStats {
  totalRevenue: number;
  commissionEarned: number;
  activeOrders: number;
}

export interface TransactionsData {
  stats: TransactionStats;
  transactions: Transaction[];
}

const COMMISSION_RATE = 0.05;

const CLOSED_ORDER_STATUSES = new Set(['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED']);
const SUCCESS_PAYMENT_STATUSES = new Set(['SUCCESS', 'COMPLETED', 'PAID', 'SUCCESSFUL']);
const REVIEW_PAYMENT_STATUSES = new Set(['FAILED', 'DISPUTED', 'FLAGGED']);

function getAmount(p: any): number {
  const raw = p?.amount ?? p?.totalAmount ?? p?.total ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function mapStatus(p: any): TxStatus {
  const status = String(p?.status ?? '').toUpperCase();
  if (SUCCESS_PAYMENT_STATUSES.has(status)) return 'Cleared';
  if (REVIEW_PAYMENT_STATUSES.has(status)) return 'Review';
  return 'Pending';
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function safeFetch<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    const result = await fn();
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export async function fetchTransactions(): Promise<TransactionsData> {
  const [payments, orders] = await Promise.all([
    safeFetch(api.payments.getAll),
    safeFetch(api.orders.getAll),
  ]);

  const transactions: Transaction[] = payments
    .map((p: any) => {
      const amount = getAmount(p);
      const status = mapStatus(p);
      const commission = status === 'Cleared' ? Math.round(amount * COMMISSION_RATE) : 0;
      const idLabel = p?.orderId ?? p?.id ?? '';
      return {
        id: `#${String(idLabel).slice(-8).toUpperCase()}`,
        date: formatDate(p?.createdAt),
        amount,
        commission,
        status,
        _sortDate: p?.createdAt ? new Date(p.createdAt).getTime() : 0,
      };
    })
    .sort((a: any, b: any) => b._sortDate - a._sortDate)
    .map(({ _sortDate, ...rest }: any) => rest);

  const totalRevenue = transactions
    .filter((t) => t.status === 'Cleared')
    .reduce((sum, t) => sum + t.amount, 0);

  const commissionEarned = transactions.reduce((sum, t) => sum + t.commission, 0);

  const activeOrders = orders.filter(
    (o: any) => !CLOSED_ORDER_STATUSES.has(String(o?.status ?? '').toUpperCase()),
  ).length;

  return {
    stats: { totalRevenue, commissionEarned, activeOrders },
    transactions,
  };
}