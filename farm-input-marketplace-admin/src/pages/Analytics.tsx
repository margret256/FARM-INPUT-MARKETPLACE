import {
  Tractor,
  BadgeCheck,
  Wallet,
  AlertTriangle,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnanlytics';
import type { AnomalyItem, CategorySalesItem, RegionalSalesItem } from '../api/analytics';

const CATEGORY_ICONS: Record<string, any> = {
  Tractors: Tractor,
  Seeds: BadgeCheck,
  Fertilizer: Wallet,
};
const CATEGORY_TONES = ['green', 'orange', 'yellow'];
const REGION_TONES = ['green', 'green', 'orange', 'yellow'];

function PanelHeading({ title, action }: { title: string; action?: string }) {
  return (
    <div className="panel-heading">
      <h3>{title}</h3>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

function Progress({ label, value, width, tone }: { label: string; value: string; width: string; tone: string }) {
  return (
    <div className="progress-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="progress-track">
        <span className={tone} style={{ width }} />
      </div>
    </div>
  );
}

function CategoryBar({ icon: Icon, label, value, width, tone }: { icon: any; label: string; value: string; width: string; tone: string }) {
  return (
    <div className="category-row">
      <div className={`metric-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <div className="category-content">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
        <div className="progress-track">
          <span className={tone} style={{ width }} />
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, value, body, tone }: { title: string; value: string; body: string; tone: string }) {
  return (
    <section className={`insight-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </section>
  );
}

function AnomalyRow({ item }: { item: AnomalyItem }) {
  const Icon = item.kind === 'low-stock' ? SlidersHorizontal : AlertTriangle;
  return (
    <div className="activity-row">
      <div className={`activity-icon ${item.tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
      </div>
    </div>
  );
}

function LineChart({ points }: { points: { label: string; value: number }[] }) {
  const width = 560;
  const height = 240;
  const chartTop = 20;
  const chartBottom = 210;
  const left = 24;
  const right = 536;

  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? (right - left) / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = left + i * step;
    const y = chartBottom - (p.value / max) * (chartBottom - chartTop);
    return { x, y, label: p.label };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x} ${c.y}`).join(' ');
  const fillPath = `${linePath} L${right} ${chartBottom + 10} L${left} ${chartBottom + 10} Z`;

  return (
    <div className="chart-frame" aria-label="Revenue trend chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <title>Monthly revenue over the last six months.</title>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2E7D32" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#lineFill)" />
        <path d={linePath} fill="none" stroke="#1B5E20" strokeWidth="4" strokeLinecap="round" />
        {coords.map((c) => (
          <text key={c.label} x={c.x - 12} y="232" fontSize="16" fill="#747970">
            {c.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function Analytics() {
  const { data, loading, error, refetch } = useAnalytics();

  if (loading && !data) {
    return <div className="analytics-grid"><section className="panel"><p>Loading analytics…</p></section></div>;
  }

  if (error && !data) {
    return (
      <div className="analytics-grid">
        <section className="panel">
          <p>Couldn't load analytics data</p>
          <p>{error}</p>
          <button onClick={refetch}><RefreshCw size={18} /> Retry</button>
        </section>
      </div>
    );
  }

  const revenueTrend = data?.revenueTrend ?? [];
  const regionalSales: RegionalSalesItem[] = data?.regionalSales ?? [];
  const topCategories: CategorySalesItem[] = data?.topCategories ?? [];
  const anomalies = data?.anomalies ?? [];

  return (
    <div className="analytics-grid">
      <section className="panel chart-panel">
        <div className="chart-heading">
          <div>
            <h3>Revenue Trends</h3>
            <p>Monthly growth and projections</p>
          </div>
          <div className="chart-total">
            <strong>{formatUsd(data?.revenueTotal ?? 0)}</strong>
            <span>
              {data?.revenueChangePercent == null
                ? 'No prior-month data'
                : `${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent.toFixed(1)}% vs last mo.`}
            </span>
          </div>
        </div>
        <LineChart points={revenueTrend} />
      </section>

      <section className="panel region-panel">
        <PanelHeading title="Regional Sales" />
        {regionalSales.length === 0 && <p>No regional data yet.</p>}
        {regionalSales.map((r, i) => (
          <Progress key={r.region} label={r.region} value={`${r.percent}%`} width={`${r.percent}%`} tone={REGION_TONES[i] ?? 'green'} />
        ))}
        <img src="/images/farm.png" alt="Farm landscape" className="regional-image" />
      </section>

      <section className="panel top-categories">
        <PanelHeading title="Top Categories" />
        {topCategories.length === 0 && <p>No category sales data yet.</p>}
        {topCategories.map((c, i) => (
          <CategoryBar
            key={c.category}
            icon={CATEGORY_ICONS[c.category] ?? Wallet}
            label={c.category}
            value={formatUsd(c.amount)}
            width={`${c.percent}%`}
            tone={CATEGORY_TONES[i] ?? 'green'}
          />
        ))}
      </section>

      <div className="insight-stack">
        <InsightCard title="Active Users" value={String(data?.activeUsers ?? 0)} body="Currently active accounts" tone="success" />
        <InsightCard title="Order Volume" value={String(data?.orderVolumeThisMonth ?? 0)} body={`Avg ${formatUsd(data?.avgOrderValue ?? 0)}/order`} tone="orange" />
        <InsightCard title="Lead Conv." value="—" body="Needs leads endpoint" tone="yellow" />
      </div>

      <section className="panel anomaly-panel">
        <PanelHeading title="Anomalous Activity" action="View All Alerts" />
        <div className="activity-list">
          {anomalies.length === 0 && <p>No anomalies detected.</p>}
          {anomalies.map((item) => (
            <AnomalyRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}