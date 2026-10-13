import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Clock, MoreHorizontal, Star, X } from 'lucide-react';
import { CATS, MAX_PRIORITY, fmtH, fmtShort, today, type Task } from './lib';
import { useStore } from './store';

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="#1673ff" strokeWidth="17">
      <path d="M46.1 18.24A32 32 0 1 0 81.82 53.34" />
      <path d="M56.65 18.7A32 32 0 0 1 81.69 45.55" />
      <circle cx="50" cy="50" r="11.5" fill="#1673ff" stroke="none" />
    </svg>
  );
}

// ---------- illustrations ----------
export function Mountain({ className = 'art' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 200" fill="none" aria-hidden>
      <defs>
        <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5b9cff" /><stop offset="1" stopColor="#d5e6ff" /></linearGradient>
        <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b3d1ff" /><stop offset="1" stopColor="#eaf2ff" /></linearGradient>
      </defs>
      <circle cx="140" cy="50" r="20" fill="#ffd9ad" />
      <g fill="#fff" opacity=".95"><ellipse cx="66" cy="74" rx="36" ry="10" /><ellipse cx="282" cy="56" rx="30" ry="9" /><ellipse cx="118" cy="104" rx="24" ry="7" /></g>
      <path d="M30 200 128 96l40 42 28-26 84 88Z" fill="url(#mt2)" />
      <path d="M112 200 216 46l100 154Z" fill="url(#mt1)" />
      <path d="M216 46 197 84l14 9 9-11 13 13 7-11Z" fill="#fff" opacity=".9" />
      <path d="M216 118c-24 12 26 20 0 36s32 22-6 46" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".85" />
      <path d="M216 46V14" stroke="#3b6fd4" strokeWidth="2.5" /><path d="M216 14l24 8-24 8Z" fill="#3b82f6" />
    </svg>
  );
}
export const ProfileArt = () => (
  <svg className="art side-art" viewBox="0 0 220 180" fill="none" aria-hidden>
    <ellipse cx="110" cy="160" rx="100" ry="14" fill="#eaf2ff" /><ellipse cx="170" cy="40" rx="40" ry="26" fill="#eef4ff" />
    <path d="M18 150c-8-30 2-52 18-66 2 26 8 44 20 66Z" fill="#b9d3ff" /><path d="M200 150c8-22 4-40-8-52-4 20-10 34-18 52Z" fill="#cfe1ff" />
    <rect x="52" y="22" width="116" height="128" rx="14" fill="#fff" stroke="#e3ecfb" />
    <circle cx="110" cy="64" r="22" fill="#cfe1ff" /><circle cx="110" cy="58" r="8" fill="#3b82f6" /><path d="M96 78a14 10 0 0 1 28 0Z" fill="#3b82f6" />
    <rect x="80" y="100" width="60" height="7" rx="3.5" fill="#b9d3ff" /><rect x="80" y="116" width="40" height="7" rx="3.5" fill="#dbe8ff" />
    <circle cx="166" cy="132" r="19" fill="#fff" stroke="#e3ecfb" /><path d="m158 140 3-9 10-10 6 6-10 10Z" stroke="#1673ff" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
export const DbArt = () => (
  <svg className="art side-art" viewBox="0 0 220 220" fill="none" aria-hidden>
    <ellipse cx="110" cy="198" rx="96" ry="14" fill="#eaf2ff" /><ellipse cx="140" cy="40" rx="50" ry="28" fill="#eef4ff" />
    {[150, 110, 70].map((y, i) => (
      <g key={y}><path d={`M50 ${y}v34c0 10 27 18 60 18s60-8 60-18v-34Z`} fill={['#7fb0ff', '#9cc3ff', '#b9d3ff'][i]} /><ellipse cx="110" cy={y} rx="60" ry="18" fill={['#a9cbff', '#c4dcff', '#dbe8ff'][i]} /></g>
    ))}
    <circle cx="164" cy="170" r="26" fill="#1673ff" stroke="#fff" strokeWidth="5" />
    <path d="M152 168a12 12 0 0 1 21-7m3 11a12 12 0 0 1-21 7m18-24v6h-6m-10 16v-6h6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Deco = ({ color, kind }: { color: string; kind: 'bars' | 'line' }) => (
  <svg className="deco" viewBox="0 0 80 40" fill="none" aria-hidden>
    {kind === 'line' ? (
      <><path d="M0 34C14 34 16 22 28 24s14 6 24-2 12-18 28-20v38H0Z" fill={color} opacity=".12" /><path d="M0 34C14 34 16 22 28 24s14 6 24-2 12-18 28-20" stroke={color} strokeWidth="2" opacity=".45" /></>
    ) : [12, 20, 28, 38].map((h, i) => <rect key={i} x={28 + i * 13} y={40 - h} width="8" height={h} rx="3" fill={color} opacity={0.18 + i * 0.12} />)}
  </svg>
);

// ---------- small building blocks ----------
export const Tag = ({ label, color }: { label: string; color?: string }) => {
  const c = color ?? CATS[label] ?? '#667085';
  return <span className="tag" style={{ color: c, background: c + '1c' }}>{label}</span>;
};
export const Bar = ({ value, color = '#1673ff' }: { value: number; color?: string }) => (
  <div className="bar"><i style={{ width: `${value}%`, background: color }} /></div>
);
export const Empty = ({ children }: { children: ReactNode }) => <div className="empty">{children}</div>;
export const IconTile = ({ color = '#1673ff', size = '', children }: { color?: string; size?: 'lg' | 'round' | ''; children: ReactNode }) => (
  <span className={`itile ${size}`} style={{ background: color + '1a', color }}>{children}</span>
);

export function StatTile(p: { icon: ReactNode; color: string; label: string; value: string; sub: string; deco?: 'bars' | 'line' }) {
  return (
    <section className="card stat" style={{ background: `linear-gradient(135deg, #fff 55%, ${p.color}14)` }}>
      <IconTile color={p.color} size="round">{p.icon}</IconTile>
      <div><small>{p.label}</small><b>{p.value}</b><small>{p.sub}</small></div>
      <Deco color={p.color} kind={p.deco ?? 'bars'} />
    </section>
  );
}

/** Section header: tinted icon, title and one line of helper text; actions go in children. */
export function Head({ icon, color, title, sub, children }: { icon: ReactNode; color?: string; title: ReactNode; sub?: string; children?: ReactNode }) {
  return (
    <header className="head">
      <IconTile color={color} size="lg">{icon}</IconTile>
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      <span className="grow" />{children}
    </header>
  );
}

export function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={wide ? 'field wide' : 'field'}><span>{label}</span>{children}</label>;
}

export function Modal(p: { title: string; onClose(): void; onSave(): void; onDelete?: () => void; children: ReactNode }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && p.onClose()}>
      <form className="modal" onSubmit={(e) => { e.preventDefault(); p.onSave(); }}>
        <header><h3>{p.title}</h3><button type="button" className="icon-btn" onClick={p.onClose}><X size={18} /></button></header>
        <div className="form">{p.children}</div>
        <footer>
          {p.onDelete && <button type="button" className="btn danger" onClick={p.onDelete}>Xoá</button>}
          <span className="grow" />
          <button type="button" className="btn" onClick={p.onClose}>Huỷ</button>
          <button type="submit" className="btn primary">Lưu</button>
        </footer>
      </form>
    </div>
  );
}

type El = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
/** Form state where every value is kept as a string until save. */
export function useForm<T extends Record<string, string>>(init: T) {
  const [f, setF] = useState(init);
  const bind = (k: keyof T) => ({ value: f[k], onChange: (e: ChangeEvent<El>) => setF({ ...f, [k]: e.target.value }) });
  return { f, setF, bind };
}

export const CatSelect = (p: { value: string; onChange(e: ChangeEvent<HTMLSelectElement>): void }) => (
  <select {...p}>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select>
);
export function TrackSelect(p: { value: string; onChange(e: ChangeEvent<HTMLSelectElement>): void }) {
  const { tracks } = useStore();
  return (
    <select {...p}>
      <option value="">— Không gắn mục tiêu —</option>
      {tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  );
}

// ---------- tasks ----------
export function useTaskActions() {
  const s = useStore();
  const priorityFull = (due: string, exceptId?: number) =>
    s.tasks.filter((t) => t.due === due && t.priority && t.id !== exceptId).length >= MAX_PRIORITY;
  return {
    priorityFull,
    color: (t: Task) => s.tracks.find((k) => k.id === t.track_id)?.color ?? CATS[t.category] ?? '#98a2b3',
    toggle: (t: Task) => s.exec('UPDATE tasks SET done = ?, done_at = ? WHERE id = ?', [t.done ? 0 : 1, t.done ? null : today(), t.id]),
    star: (t: Task) => {
      if (!t.priority && priorityFull(t.due, t.id)) return s.toast(`Focus Filter: mỗi ngày tối đa ${MAX_PRIORITY} việc ưu tiên.`);
      return s.exec('UPDATE tasks SET priority = ? WHERE id = ?', [t.priority ? 0 : 1, t.id]);
    },
  };
}

export function StarBtn({ t }: { t: Task }) {
  const a = useTaskActions();
  return (
    <button className={t.priority ? 'icon-btn on' : 'icon-btn'} title="Ưu tiên trong ngày" onClick={() => a.star(t)}>
      <Star size={16} fill={t.priority ? 'currentColor' : 'none'} />
    </button>
  );
}

/** Compact task line used on the dashboard. */
export function TaskRow({ t, onEdit, showDue }: { t: Task; onEdit(t: Task): void; showDue?: boolean }) {
  const a = useTaskActions();
  return (
    <div className={t.done ? 'row done' : 'row'}>
      <input type="checkbox" checked={!!t.done} onChange={() => a.toggle(t)} />
      <span className="title" onDoubleClick={() => onEdit(t)}>{t.title}</span>
      {t.category && <Tag label={t.category} />}
      {showDue ? <span className={!t.done && t.due < today() ? 'meta late' : 'meta'}>{fmtShort(t.due)}</span>
        : t.est > 0 && <span className="meta"><Clock size={13} />{fmtH(t.est)}</span>}
      <StarBtn t={t} />
      <button className="icon-btn" title="Sửa" onClick={() => onEdit(t)}><MoreHorizontal size={16} /></button>
    </div>
  );
}

export function TaskModal({ task, onClose }: { task: Partial<Task>; onClose(): void }) {
  const s = useStore();
  const a = useTaskActions();
  const { f, setF, bind } = useForm({
    title: task.title ?? '', note: task.note ?? '', category: task.category ?? 'Học tập', track_id: String(task.track_id ?? ''),
    due: task.due ?? today(), est: String(task.est ?? 1), t_start: task.t_start ?? '', t_end: task.t_end ?? '',
    priority: task.priority ? '1' : '',
  });
  const save = async () => {
    if (!f.title.trim()) return s.toast('Hãy nhập tên nhiệm vụ.');
    if (f.priority && a.priorityFull(f.due, task.id)) return s.toast(`Focus Filter: ngày này đã đủ ${MAX_PRIORITY} việc ưu tiên.`);
    const v = [f.title.trim(), f.note.trim() || null, f.category, f.track_id ? +f.track_id : null, f.due, +f.est || 0, f.priority ? 1 : 0, f.t_start || null, f.t_end || null];
    if (task.id) await s.exec('UPDATE tasks SET title=?, note=?, category=?, track_id=?, due=?, est=?, priority=?, t_start=?, t_end=? WHERE id=?', [...v, task.id]);
    else await s.exec('INSERT INTO tasks(title, note, category, track_id, due, est, priority, t_start, t_end) VALUES(?,?,?,?,?,?,?,?,?)', v);
    onClose();
  };
  const del = task.id ? async () => { await s.exec('DELETE FROM tasks WHERE id = ?', [task.id]); onClose(); } : undefined;
  return (
    <Modal title={task.id ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ'} onClose={onClose} onSave={save} onDelete={del}>
      <Field label="Tên nhiệm vụ" wide><input autoFocus {...bind('title')} placeholder="VD: SQL basic 1" /></Field>
      <Field label="Mô tả ngắn (tuỳ chọn)" wide><input {...bind('note')} placeholder="VD: Ôn tập câu lệnh SELECT, WHERE, JOIN cơ bản" /></Field>
      <Field label="Nhãn"><CatSelect {...bind('category')} /></Field>
      <Field label="Gắn với mục tiêu"><TrackSelect {...bind('track_id')} /></Field>
      <Field label="Hạn hoàn thành"><input type="date" required {...bind('due')} /></Field>
      <Field label="Ước lượng (giờ)"><input type="number" min="0" step="0.25" {...bind('est')} /></Field>
      <Field label="Bắt đầu"><input type="time" {...bind('t_start')} /></Field>
      <Field label="Kết thúc"><input type="time" {...bind('t_end')} /></Field>
      <label className="check wide">
        <input type="checkbox" checked={!!f.priority} onChange={(e) => setF({ ...f, priority: e.target.checked ? '1' : '' })} />
        Việc ưu tiên của ngày (tối đa {MAX_PRIORITY})
      </label>
    </Modal>
  );
}
