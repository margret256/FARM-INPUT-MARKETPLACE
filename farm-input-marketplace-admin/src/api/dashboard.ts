import { api } from './client';

export interface DashboardMetrics {
  totalRevenue: number;
  totalTransactionVolume: number;
  activeUsers: number;
  registeredDealers: number;
  activeOrders: number;
}

export interface DealerActivityItem {
  id: string;
  name: string;
  region: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentDealerActivity: DealerActivityItem[];
}

const SUCCESS_STATUSES = new Set(['SUCCESS', 'COMPLETED', 'PAID', 'SUCCESSFUL']);
const CLOSED_ORDER_STATUSES = new Set(['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED']);

function getPaymentAmount(p: any): number {
  const raw = p?.amount ?? p?.total ?? p?.totalAmount ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function isSuccessfulPayment(p: any): boolean {
  const status = String(p?.status ?? '').toUpperCase();
  return SUCCESS_STATUSES.has(status);
}

function isActiveOrder(o: any): boolean {
  const status = String(o?.status ?? '').toUpperCase();
  return !CLOSED_ORDER_STATUSES.has(status);
}

function getDealerName(d: any): string {
  return d?.businessName ?? d?.name ?? d?.companyName ?? 'Unnamed Dealer';
}

async function safeFetch<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    const result = await fn();
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [users, dealers, orders, payments] = await Promise.all([
    safeFetch(api.users.getAll),
    safeFetch(api.dealers.getAll),
    safeFetch(api.orders.getAll),
    safeFetch(api.payments.getAll),
  ]);

  const activeUsers = users.filter((u: any) => String(u?.status).toUpperCase() === 'ACTIVE').length;

  const registeredDealers = dealers.filter(
    (d: any) => String(d?.status).toUpperCase() === 'APPROVED',
  ).length;

  const activeOrders = orders.filter(isActiveOrder).length;

  const totalRevenue = payments
    .filter(isSuccessfulPayment)
    .reduce((sum: number, p: any) => sum + getPaymentAmount(p), 0);

  const totalTransactionVolume = payments.reduce(
    (sum: number, p: any) => sum + getPaymentAmount(p),
    0,
  );

  const recentDealerActivity: DealerActivityItem[] = [...dealers]
    .sort((a: any, b: any) => {
      const dateA = new Date(a?.updatedAt ?? a?.createdAt ?? 0).getTime();
      const dateB = new Date(b?.updatedAt ?? b?.createdAt ?? 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3)
    .map((d: any) => ({
      id: String(d?.id ?? ''),
      name: getDealerName(d),
      region: d?.region ?? d?.district ?? 'Unknown region',
      status: String(d?.status ?? 'PENDING').toUpperCase(),
      createdAt: d?.createdAt ?? new Date().toISOString(),
      updatedAt: d?.updatedAt ?? d?.createdAt ?? new Date().toISOString(),
    }));

  return {
    metrics: {
      totalRevenue,
      totalTransactionVolume,
      activeUsers,
      registeredDealers,
      activeOrders,
    },
    recentDealerActivity,
  };
}