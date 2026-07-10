import {
  Users,
  Store,
  Truck,
  Wallet,
  ReceiptText,
  UserCog,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useDashboardData } from '../hooks/usedashboardData';
import type { DealerActivityItem } from '../api/dashboard';

type PageId = 'dashboard' | 'users' | 'dealers' | 'transactions' | 'analytics' | 'profile' | 'about';

const managementTools = [
  { icon: UserCog,     title: 'User Management',  desc: 'Control access and user tiers.',  page: 'users' },
  { icon: ShieldCheck, title: 'Dealer Approvals', desc: 'Review pending applications.',     page: 'dealers' },
  { icon: BarChart3,   title: 'Reports',          desc: 'Export quarterly metrics.',       page: 'analytics' },
  { icon: Wallet,      title: 'Commission',       desc: 'Adjust platform fee rates.',      page: 'transactions' },
] as const;

function formatCurrencyAbbrev(amount: number): string {
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `UGX ${(amount / 1_000).toFixed(1)}k`;
  return `UGX ${amount.toFixed(0)}`;
}

function formatCountAbbrev(count: number): string {
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function mapDealerStatusToTone(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED' || status === 'SUSPENDED') return 'danger';
  return 'warning';
}

function mapDealerStatusToLabel(status: string): string {
  if (status === 'APPROVED') return 'Active';
  if (status === 'REJECTED') return 'Review Needed';
  if (status === 'SUSPENDED') return 'Suspended';
  return 'Pending Review';
}

function toneIcon(tone: 'success' | 'warning' | 'danger') {
  if (tone === 'success') return CheckCircle2;
  if (tone === 'danger') return AlertTriangle;
  return Clock;
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading && !data) {
    return (
      <div className="page-content">
        <div className="section-card">
          <p className="section-title">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="page-content">
        <div className="section-card">
          <p className="section-title">Couldn't load dashboard data</p>
          <p className="tool-desc">{error}</p>
          <button className="tool-card" onClick={refetch} style={{ marginTop: 12 }}>
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentActivity: DealerActivityItem[] = data?.recentDealerActivity ?? [];

  return (
    <div className="page-content">
      <div className="hero-grid">
        <div className="hero-card green-card">
          <div className="hero-card-text">
            <p className="hero-label">Total Revenue</p>
            <h2 className="hero-value">{formatCurrencyAbbrev(metrics?.totalRevenue ?? 0)}</h2>
            <span className="hero-sub">Platform revenue from completed payments</span>
          </div>
          <Wallet size={100} className="hero-icon" />
        </div>
        <div className="hero-card orange-card">
          <div className="hero-card-text">
            <p className="hero-label">Transactions</p>
            <h2 className="hero-value">{formatCurrencyAbbrev(metrics?.totalTransactionVolume ?? 0)}</h2>
            <span className="hero-sub">Processed through AgroWallet</span>
          </div>
          <ReceiptText size={100} className="hero-icon" />
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon-wrap success"><Users size={20} /></div>
            <span className="pill success">Live</span>
          </div>
          <p className="metric-value">{formatCountAbbrev(metrics?.activeUsers ?? 0)}</p>
          <p className="metric-label">Total Active Users</p>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon-wrap warning"><Store size={20} /></div>
            <span className="pill warning">Verified</span>
          </div>
          <p className="metric-value">{formatCountAbbrev(metrics?.registeredDealers ?? 0)}</p>
          <p className="metric-label">Registered Dealers</p>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon-wrap danger"><Truck size={20} /></div>
            <span className="pill danger">Live</span>
          </div>
          <p className="metric-value">{formatCountAbbrev(metrics?.activeOrders ?? 0)}</p>
          <p className="metric-label">Active Orders</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Management Tools</h3>
        </div>
        <div className="tools-grid">
          {managementTools.map(({ icon: Icon, title, desc, page }) => (
            <button key={title} className="tool-card" onClick={() => onNavigate(page)}>
              <div className="tool-icon"><Icon size={26} /></div>
              <p className="tool-title">{title}</p>
              <p className="tool-desc">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Recent Dealer Activity</h3>
          <button className="link-btn" onClick={() => onNavigate('dealers')}>View All <ChevronRight size={14} /></button>
        </div>
        <div className="activity-list">
          {recentActivity.length === 0 && <p className="tool-desc">No recent dealer activity.</p>}
          {recentActivity.map((item) => {
            const tone = mapDealerStatusToTone(item.status);
            const Icon = toneIcon(tone);
            return (
              <div key={item.id} className="activity-row">
                <div className={`activity-icon ${tone}`}><Icon size={18} /></div>
                <div className="activity-text">
                  <p className="activity-name">{item.name}</p>
                  <p className="activity-meta">{item.region} · {timeAgo(item.updatedAt)}</p>
                </div>
                <span className={`pill ${tone}`}>{mapDealerStatusToLabel(item.status)}</span>
                <ChevronRight size={16} className="chevron-muted" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}