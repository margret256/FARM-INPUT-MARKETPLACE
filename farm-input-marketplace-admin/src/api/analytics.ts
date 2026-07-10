import { api } from './client';

export interface MonthlyRevenuePoint {
  label: string;
  value: number;
}

export interface RegionalSalesItem {
  region: string;
  amount: number;
  percent: number;
}

export interface CategorySalesItem {
  category: string;
  amount: number;
  percent: number;
}

export interface AnomalyItem {
  id: string;
  title: string;
  meta: string;
  tone: 'success' | 'warning' | 'danger';
  kind: 'low-stock' | 'revenue-spike';
}

export interface AnalyticsData {
  revenueTrend: MonthlyRevenuePoint[];
  revenueTotal: number;
  revenueChangePercent: number | null;
  regionalSales: RegionalSalesItem[];
  topCategories: CategorySalesItem[];
  activeUsers: number;
  orderVolumeThisMonth: number;
  avgOrderValue: number;
  anomalies: AnomalyItem[];
}

const SUCCESS_PAYMENT_STATUSES = new Set(['SUCCESS', 'COMPLETED', 'PAID', 'SUCCESSFUL']);
const LOW_STOCK_THRESHOLD = 10;
const MONTH_LABELS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getAmount(p: any): number {
  const raw = p?.amount ?? p?.totalAmount ?? p?.total ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function isSuccessfulPayment(p: any): boolean {
  return SUCCESS_PAYMENT_STATUSES.has(String(p?.status ?? '').toUpperCase());
}

async function safeFetch<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    const result = await fn();
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function buildRevenueTrend(payments: any[]): { points: MonthlyRevenuePoint[]; total: number; changePercent: number | null } {
  const now = new Date();
  const buckets: { key: string; label: string; total: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], total: 0 });
  }

  const successful = payments.filter(isSuccessfulPayment);

  for (const p of successful) {
    const created = p?.createdAt ? new Date(p.createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) continue;
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.total += getAmount(p);
  }

  const total = buckets.reduce((sum, b) => sum + b.total, 0);
  const current = buckets[buckets.length - 1]?.total ?? 0;
  const previous = buckets[buckets.length - 2]?.total ?? 0;
  const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : null;

  return {
    points: buckets.map((b) => ({ label: b.label, value: b.total })),
    total,
    changePercent,
  };
}

function buildRegionalSales(orders: any[], dealers: any[]): RegionalSalesItem[] {
  const dealerRegionById = new Map<string, string>();
  for (const d of dealers) {
    if (d?.id) dealerRegionById.set(String(d.id), d?.region ?? d?.district ?? 'Unknown region');
  }

  const totalsByRegion = new Map<string, number>();

  for (const o of orders) {
    const dealerId = o?.dealerId ?? o?.dealer?.id;
    const region = (dealerId && dealerRegionById.get(String(dealerId))) ?? o?.dealer?.region ?? 'Unknown region';
    const amount = getAmount(o);
    totalsByRegion.set(region, (totalsByRegion.get(region) ?? 0) + amount);
  }

  const grandTotal = [...totalsByRegion.values()].reduce((s, v) => s + v, 0);

  return [...totalsByRegion.entries()]
    .map(([region, amount]) => ({
      region,
      amount,
      percent: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
}

function buildTopCategories(orders: any[]): CategorySalesItem[] {
  const totalsByCategory = new Map<string, number>();

  for (const o of orders) {
    const items = Array.isArray(o?.items) ? o.items : [];
    for (const item of items) {
      const category = item?.product?.category ?? item?.category ?? 'Uncategorized';
      const lineTotal = Number(item?.price ?? 0) * Number(item?.quantity ?? 1);
      totalsByCategory.set(category, (totalsByCategory.get(category) ?? 0) + lineTotal);
    }
  }

  const grandTotal = [...totalsByCategory.values()].reduce((s, v) => s + v, 0);

  return [...totalsByCategory.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percent: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
}

function buildAnomalies(products: any[], revenueTrend: MonthlyRevenuePoint[]): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];

  const lowStock = products.filter((p: any) => typeof p?.stock === 'number' && p.stock < LOW_STOCK_THRESHOLD);
  for (const p of lowStock.slice(0, 3)) {
    anomalies.push({
      id: `stock-${p.id}`,
      title: `Inventory low: ${p?.name ?? 'Unnamed product'}`,
      meta: `${p.stock} units remaining`,
      tone: 'warning',
      kind: 'low-stock',
    });
  }

  const current = revenueTrend[revenueTrend.length - 1]?.value ?? 0;
  const prior = revenueTrend.slice(0, -1);
  const avgPrior = prior.length > 0 ? prior.reduce((s, p) => s + p.value, 0) / prior.length : 0;
  if (avgPrior > 0 && current > avgPrior * 1.5) {
    anomalies.push({
      id: 'revenue-spike',
      title: 'Unusual revenue spike this month',
      meta: `${Math.round(((current - avgPrior) / avgPrior) * 100)}% above 5-month average`,
      tone: 'danger',
      kind: 'revenue-spike',
    });
  }

  return anomalies;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const [users, dealers, orders, payments, products] = await Promise.all([
    safeFetch(api.users.getAll),
    safeFetch(api.dealers.getAll),
    safeFetch(api.orders.getAll),
    safeFetch(api.payments.getAll),
    safeFetch(api.products.getAll),
  ]);

  const { points: revenueTrend, total: revenueTotal, changePercent: revenueChangePercent } = buildRevenueTrend(payments);
  const regionalSales = buildRegionalSales(orders, dealers);
  const topCategories = buildTopCategories(orders);
  const activeUsers = users.filter((u: any) => String(u?.status).toUpperCase() === 'ACTIVE').length;

  const now = new Date();
  const ordersThisMonth = orders.filter((o: any) => {
    const created = o?.createdAt ? new Date(o.createdAt) : null;
    return created && created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  });
  const orderVolumeThisMonth = ordersThisMonth.length;
  const revenueThisMonth = ordersThisMonth.reduce((sum: number, o: any) => sum + getAmount(o), 0);
  const avgOrderValue = orderVolumeThisMonth > 0 ? revenueThisMonth / orderVolumeThisMonth : 0;

  const anomalies = buildAnomalies(products, revenueTrend);

  return {
    revenueTrend,
    revenueTotal,
    revenueChangePercent,
    regionalSales,
    topCategories,
    activeUsers,
    orderVolumeThisMonth,
    avgOrderValue,
    anomalies,
  };
}