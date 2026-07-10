import { useState } from 'react';
import { Download, Search, Filter, Wallet, BarChart3, ClipboardList, ChevronLeft, ChevronRight, TrendingUp, RefreshCw } from 'lucide-react';
import { useTransactions } from '../hooks/useTranscations';
import type { Transaction, TxStatus } from '../api/transcations';

const PAGE_SIZE = 4;
const statusTone: Record<TxStatus, 'success' | 'warning' | 'danger'> = {
  Cleared: 'success',
  Pending: 'warning',
  Review: 'danger',
};

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString('en-US')}`;
}

function toCsv(rows: Transaction[]): string {
  const header = ['Order ID', 'Date', 'Amount (UGX)', 'Commission (UGX)', 'Status'];
  const lines = rows.map((r) => [r.id, r.date, r.amount, r.commission, r.status].join(','));
  return [header.join(','), ...lines].join('\n');
}

function downloadCsv(rows: Transaction[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const { data, loading, error, refetch } = useTransactions();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  if (loading && !data) {
    return (
      <div className="page-content">
        <div className="section-card"><p className="section-title">Loading transactions…</p></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="page-content">
        <div className="section-card">
          <p className="section-title">Couldn't load transactions</p>
          <p className="tool-desc">{error}</p>
          <button className="tool-card" onClick={refetch} style={{ marginTop: 12 }}>
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const allTransactions = data?.transactions ?? [];
  const stats = data?.stats ?? { totalRevenue: 0, commissionEarned: 0, activeOrders: 0 };

  const filtered = allTransactions.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.id.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    setExporting(true);
    downloadCsv(filtered);
    setTimeout(() => setExporting(false), 800);
  };

  return (
    <div className="page-content">
      <div className="tx-title-strip">
        <div>
          <h2 className="tx-title">Transaction Management</h2>
          <p className="tx-subtitle">Overview of your agricultural dealership's financial flow.</p>
        </div>
        <button className="btn-primary" onClick={handleExport} disabled={exporting || filtered.length === 0}>
          <Download size={16} />{exporting ? 'Exporting…' : 'Export Report'}
        </button>
      </div>

      <div className="tx-stats-grid">
        <div className="tx-stat-card">
          <div className="tx-stat-left"><p className="tx-stat-label">Total Revenue</p><p className="tx-stat-value green">{formatUGX(stats.totalRevenue)}</p></div>
          <div className="tx-stat-icon green-bg"><Wallet size={22} /></div>
        </div>
        <div className="tx-stat-card">
          <div className="tx-stat-left"><p className="tx-stat-label">Commission Earned</p><p className="tx-stat-value orange">{formatUGX(stats.commissionEarned)}</p></div>
          <div className="tx-stat-icon orange-bg"><BarChart3 size={22} /></div>
        </div>
        <div className="tx-stat-card">
          <div className="tx-stat-left"><p className="tx-stat-label">Active Orders</p><p className="tx-stat-value orange">{stats.activeOrders}</p></div>
          <div className="tx-stat-icon yellow-bg"><ClipboardList size={22} /></div>
        </div>
      </div>

      <div className="section-card">
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <label className="search-box" style={{ flex: 1 }}>
            <Search size={16} />
            <input type="search" placeholder="Search Order ID or Status..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </label>
          <button className="filter-btn"><Filter size={15} /> Filter</button>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Order ID</th><th>Date</th><th>Amount (UGX)</th><th>Commission</th><th>Status</th></tr>
            </thead>
            <tbody>
              {paginated.length === 0 && <tr><td colSpan={5} className="empty-state">No orders found.</td></tr>}
              {paginated.map(order => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td className="muted-text">{order.date}</td>
                  <td><strong>{order.amount.toLocaleString('en-US')}</strong></td>
                  <td>{order.commission.toLocaleString('en-US')}</td>
                  <td><span className={`pill ${statusTone[order.status]}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span className="muted-text">Showing {filtered.length === 0 ? 0 : Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
          <div className="pagination-controls">
            <button className="icon-btn" onClick={() => setPage(p => p-1)} disabled={page===1}><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
              <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="icon-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="upgrade-band">
        <div className="upgrade-text">
          <div className="upgrade-icon"><TrendingUp size={28} /></div>
          <div>
            <h3 className="upgrade-title">Premium Dealer Analytics</h3>
            <p className="upgrade-desc">Unlock deeper insights into your transaction history. Track seasonal trends and optimize your inventory replenishment based on historical demand data.</p>
            <button className="btn-primary">Upgrade to Premium</button>
          </div>
        </div>
      </div>
    </div>
  );
}