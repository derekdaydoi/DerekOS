import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Activity, BarChart3, Minus, MoreHorizontal, Plus, Target, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { SERIES, addDays, fmtN, fmtShort, metricView, parse, today, type Metric } from '../lib';
import { useStore } from '../store';
import { Bar, Empty, Field, IconTile, Modal, Mountain, useForm } from '../ui';

type Point = { date: string; value: number };

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current!);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Single-series time line with an optional dashed target line and a hover readout. */
export function LineChart(p: { points: Point[]; target?: number | null; unit?: string; height?: number; compact?: boolean; color?: string; zero?: boolean; rings?: boolean }) {
  const { points, target, unit = '', height = 150, compact, color = SERIES[0] } = p;
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const pad = compact ? { l: 4, r: 8, t: 8, b: 4 } : { l: 40, r: 14, t: 12, b: 24 };

  const xs = points.map((d) => parse(d.date).getTime());
  const vals = [...points.map((d) => d.value), ...(target != null ? [target] : []), ...(p.zero ? [0] : [])];
  const min = Math.min(...vals), max = Math.max(...vals, p.zero ? 1 : -Infinity);
  const margin = (max - min || Math.abs(max) || 1) * 0.12;
  const lo = p.zero ? 0 : min - margin, hi = max + margin;
  const x0 = xs[0], x1 = xs[xs.length - 1];
  const X = (t: number) => pad.l + (x1 === x0 ? 0.5 : (t - x0) / (x1 - x0)) * (w - pad.l - pad.r);
  const Y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (height - pad.t - pad.b);
  const line = points.map((d, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)} ${Y(d.value).toFixed(1)}`).join('');
  const base = height - pad.b;
  const ticks = p.zero ? [0, max / 2, max] : [min, (min + max) / 2, max];

  const move = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * w; // rect is in zoomed pixels
    setHover(xs.reduce((best, t, i) => (Math.abs(X(t) - mx) < Math.abs(X(xs[best]) - mx) ? i : best), 0));
  };
  const hp = hover != null ? points[hover] : null;

  return (
    <div ref={ref} className="chartbox" style={{ height }}>
      {w > 0 && points.length > 0 && (
        <svg width={w} height={height} onMouseMove={move} onMouseLeave={() => setHover(null)}>
          {!compact && ticks.map((v, i) => (min === max && !p.zero && i ? null : (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={Y(v)} y2={Y(v)} className="gridline" />
              <text x={pad.l - 8} y={Y(v) + 4} textAnchor="end" className="axis">{fmtN(+v.toFixed(1))}{p.zero ? unit : ''}</text>
            </g>
          )))}
          {!compact && (p.rings ? points : [points[0], points[points.length - 1]]).map((d, i, a) => (
            <text key={d.date} x={X(parse(d.date).getTime())} y={height - 6} textAnchor={p.rings ? 'middle' : i ? 'end' : 'start'} className="axis">{a.length > 1 || !i ? fmtShort(d.date) : ''}</text>
          ))}
          {target != null && <line x1={pad.l} x2={w - pad.r} y1={Y(target)} y2={Y(target)} className="target" />}
          {target != null && !compact && <text x={w - pad.r} y={Y(target) - 5} textAnchor="end" className="axis">Mục tiêu {fmtN(target)}</text>}
          {points.length > 1 && <path d={`${line}L${X(x1)} ${base}L${X(x0)} ${base}Z`} fill={color} opacity=".08" />}
          <path d={line} className="series" stroke={color} />
          {p.rings ? points.map((d, i) => <circle key={d.date} cx={X(xs[i])} cy={Y(d.value)} r="4" className="ring" stroke={color} />)
            : <circle cx={X(x1)} cy={Y(points[points.length - 1].value)} r="4.5" className="dot" fill={color} />}
          {hp && <line x1={X(xs[hover!])} x2={X(xs[hover!])} y1={pad.t} y2={base} className="cross" />}
          {hp && <circle cx={X(xs[hover!])} cy={Y(hp.value)} r="4.5" className="dot" fill={color} />}
        </svg>
      )}
      {hp && (
        <div className="tip" style={{ left: Math.min(Math.max(X(xs[hover!]), 50), w - 50), top: Math.max(Y(hp.value) - 44, 0) }}>
          <b>{fmtN(hp.value)} {unit}</b>{fmtShort(hp.date)}/{hp.date.slice(0, 4)}
        </div>
      )}
      {!points.length && <Empty>Chưa có số liệu. Ghi giá trị đầu tiên.</Empty>}
    </div>
  );
}

export function Delta({ value, good, unit }: { value: number; good: boolean | null; unit: string }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const color = good == null ? '#98a2b3' : good ? '#12b76a' : '#f04438';
  return (
    <span className="delta">
      <b><Icon size={16} color={color} />{value > 0 ? '+' : ''}{fmtN(value)} {unit}</b>
      <small>{good == null ? 'so với lần trước' : good ? 'đúng hướng' : 'ngược hướng'}</small>
    </span>
  );
}

function MetricModal({ metric, onClose }: { metric: Partial<Metric>; onClose(): void }) {
  const s = useStore();
  const { f, bind } = useForm({
    name: metric.name ?? '', note: metric.note ?? '', unit: metric.unit ?? '',
    start: String(metric.start ?? 0), target: metric.target == null ? '' : String(metric.target),
  });
  const history = s.logs.filter((l) => l.metric_id === metric.id).reverse();
  const save = async () => {
    if (!f.name.trim()) return s.toast('Hãy nhập tên biến số.');
    const v = [f.name.trim(), f.note.trim() || null, f.unit.trim(), +f.start || 0, f.target === '' ? null : +f.target];
    if (metric.id) await s.exec('UPDATE metrics SET name=?, note=?, unit=?, start=?, target=? WHERE id=?', [...v, metric.id]);
    else await s.exec('INSERT INTO metrics(name, note, unit, start, target) VALUES(?,?,?,?,?)', v);
    onClose();
  };
  const del = metric.id ? async () => {
    if (!confirm(`Xoá biến số "${metric.name}" và toàn bộ lịch sử của nó?`)) return;
    await s.exec('DELETE FROM metric_logs WHERE metric_id = ?', [metric.id]);
    if (s.settings.ns_metric_id === String(metric.id)) await s.setSetting('ns_metric_id', '');
    await s.exec('DELETE FROM metrics WHERE id = ?', [metric.id]);
    onClose();
  } : undefined;
  return (
    <Modal title={metric.id ? 'Sửa biến số' : 'Thêm biến số theo dõi'} onClose={onClose} onSave={save} onDelete={del}>
      <Field label="Tên" wide><input autoFocus {...bind('name')} placeholder="VD: Cân nặng, Tiền tiết kiệm, Số buổi chạy" /></Field>
      <Field label="Mô tả ngắn (tuỳ chọn)" wide><input {...bind('note')} placeholder="VD: Theo dõi sức khỏe thể chất" /></Field>
      <Field label="Đơn vị"><input {...bind('unit')} placeholder="kg, giờ, buổi…" /></Field>
      <Field label="Giá trị xuất phát"><input type="number" step="any" {...bind('start')} /></Field>
      <Field label="Mục tiêu (để trống nếu chỉ theo dõi)" wide><input type="number" step="any" {...bind('target')} /></Field>
      {history.length > 0 && (
        <div className="wide history">
          {history.map((l) => (
            <div key={l.id} className="row">
              <span className="meta">{fmtShort(l.date)}/{l.date.slice(0, 4)}</span><span className="title">{fmtN(l.value)} {metric.unit}</span>
              <button type="button" className="icon-btn" title="Xoá lần ghi" onClick={() => s.exec('DELETE FROM metric_logs WHERE id = ?', [l.id])}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function MetricCard({ m, color, onEdit }: { m: Metric; color: string; onEdit(): void }) {
  const s = useStore();
  const v = metricView(m, s.logs);
  const [date, setDate] = useState(today());
  const [value, setValue] = useState('');
  const log = async () => {
    if (value === '' || isNaN(+value)) return s.toast('Hãy nhập một con số.');
    await s.exec('INSERT INTO metric_logs(metric_id, date, value) VALUES(?,?,?) ON CONFLICT(metric_id, date) DO UPDATE SET value = excluded.value', [m.id, date, +value]);
    setValue('');
  };
  const prev = v.pts.length > 1 ? v.pts[v.pts.length - 2] : null;
  const prevValue = prev ? prev.value : m.start;
  const week = v.pts.filter((d) => d.date > addDays(today(), -7));
  const avg = week.length ? week.reduce((a, d) => a + d.value, 0) / week.length : v.cur;
  const range = m.target == null ? 'Chưa đặt mục tiêu' : `${fmtN(m.start)} – ${fmtN(m.target)} ${m.unit}`;
  const facts: [typeof Target, string, string, string, string][] = [
    [Target, '#f79009', 'Mục tiêu', range, ''],
    [TrendingUp, '#1673ff', 'Lần trước', `${fmtN(prevValue)} ${m.unit}`, prev ? `(${fmtShort(prev.date)})` : '(xuất phát)'],
    [Activity, '#12b76a', 'Thay đổi', `${fmtN(v.delta)} ${m.unit}`, `${prevValue ? fmtN((v.delta / prevValue) * 100) : 0}%`],
    [BarChart3, '#8b5cf6', 'Trung bình', `${fmtN(avg)} ${m.unit}`, '7 ngày qua'],
  ];
  return (
    <section className="card metric">
      <header className="head">
        <IconTile color={color} size="lg"><Activity size={22} /></IconTile>
        <div><h2>{m.name}</h2>{m.note && <p>{m.note}</p>}</div>
        <span className="grow" />
        <Delta value={v.delta} good={v.good} unit={m.unit} />
        <button className="icon-btn" title="Sửa và xem lịch sử" onClick={onEdit}><MoreHorizontal size={17} /></button>
      </header>
      <div className="metric-body">
        <div>
          <b className="hero-num">{fmtN(v.cur)}<small>{m.unit}</small></b>
          <small>{range}</small>
          {v.progress != null && <div className="barline"><Bar value={v.progress} color={color} /><b>{v.progress}%</b></div>}
        </div>
        <div className="sparkbox" style={{ background: `linear-gradient(180deg, ${color}0d, ${color}03)` }}>
          <LineChart compact height={140} points={v.pts} target={m.target} unit={m.unit} color={color} />
        </div>
      </div>
      <div className="facts">
        {facts.map(([Icon, c, label, val, sub]) => (
          <div key={label}><Icon size={18} color={c} /><span><small>{label}</small><b>{val}</b><small>{sub}</small></span></div>
        ))}
      </div>
      <form className="logform" onSubmit={(e) => { e.preventDefault(); log(); }}>
        <b className="wide">Ghi giá trị mới</b>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Giá trị (${m.unit})`} />
        <button className="btn primary"><Plus size={15} />Ghi</button>
      </form>
    </section>
  );
}


export function MetricsPage() {
  const s = useStore();
  const [edit, setEdit] = useState<Partial<Metric> | null>(null);
  return (
    <div className="stack">
      <section className="card banner">
        <div>
          <h2>Biến con số thành tiến bộ</h2>
          <p>Ghi số đều đặn, nhìn xu hướng, chỉnh kịp thời.</p>
        </div>
        <Mountain />
        <button className="btn primary lg" onClick={() => setEdit({})}><Plus size={16} />Thêm biến số</button>
      </section>
      <div className="metrics">{s.metrics.map((m, i) => <MetricCard key={m.id} m={m} color={SERIES[i % SERIES.length]} onEdit={() => setEdit(m)} />)}</div>
      {!s.metrics.length && <section className="card"><Empty>Chưa có biến số nào. Ví dụ: cân nặng, thu nhập, số buổi chạy mỗi tuần.</Empty></section>}
      {edit && <MetricModal metric={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}
