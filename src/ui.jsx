import { ChevronLeft, Bookmark, BookmarkCheck, Info, Sparkles, BadgeCheck, ShieldCheck } from "lucide-react";
import { img, NUTRIENTS, DISCLAIMER, PEOPLE } from "./data";
import { useStore } from "./useStore";

export function TopBar({ title, sub, right, back = true, over = false }) {
  const { nav } = useStore();
  return (
    <div className={"topbar" + (over ? " over" : "")}>
      {back ? (
        <button className="icon-btn" onClick={nav.back} aria-label="Back"><ChevronLeft size={22} /></button>
      ) : <span style={{ width: 8 }} />}
      <div className="topbar-title">
        {title && <span>{title}</span>}
        {sub && <small>{sub}</small>}
      </div>
      <div className="topbar-right">{right}</div>
    </div>
  );
}

export function Photo({ name, pos = "50% 50%", h = 180, r = 22, className = "", children, size = 800 }) {
  return (
    <div className={"photo " + className} style={{ height: h, borderRadius: r }}>
      <img src={img(name, size)} alt="" loading="lazy" style={{ objectPosition: pos }} onError={(e) => { e.currentTarget.style.opacity = 0; }} />
      {children && <div className="photo-over">{children}</div>}
    </div>
  );
}

export function Chip({ active, onClick, children, small }) {
  return (
    <button type="button" className={"chip" + (active ? " on" : "") + (small ? " sm" : "")} onClick={onClick} aria-pressed={!!active}>
      {children}
    </button>
  );
}

export function Nutrient({ n, onClick }) {
  const c = NUTRIENTS[n]?.color || "#7A8A5A";
  return (
    <span className="ntag" style={{ "--c": c }} onClick={onClick}>
      <i />{n}
    </span>
  );
}

export function SaveBtn({ on, onClick, label = true }) {
  return (
    <button className={"save-btn" + (on ? " on" : "")} onClick={onClick} aria-pressed={on}>
      {on ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      {label && <span>{on ? "Saved" : "Save"}</span>}
    </button>
  );
}

export function Disclaimer({ text = DISCLAIMER }) {
  return (
    <p className="disclaimer"><Info size={14} /> {text}</p>
  );
}

export function SectionHead({ title, action, onAction, eyebrow }) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h3>{title}</h3>
      </div>
      {action && <button className="link" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Avatar({ who, size = 34 }) {
  const p = PEOPLE[who] || { name: who, tone: "#7A8A5A" };
  const initials = p.anon ? "•" : p.role === "mod" ? "A" : p.name.split(" ")[0][0];
  return (
    <span className="avatar" style={{ width: size, height: size, background: p.tone, fontSize: size * 0.42 }}>{initials}</span>
  );
}

export function RoleBadge({ who }) {
  const p = PEOPLE[who];
  if (!p) return null;
  if (p.role === "expert") return <span className="role role-expert"><BadgeCheck size={12} /> Verified expert</span>;
  if (p.role === "mod") return <span className="role role-mod"><ShieldCheck size={12} /> Moderator</span>;
  if (p.anon) return <span className="role role-anon">Anonymous</span>;
  return null;
}

export function AfyaMark({ size = 36 }) {
  return (
    <span className="afya-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size * 0.62} height={size * 0.62} aria-hidden="true">
        <path d="M20 34c0-9 0-15 0-22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M20 20c-6 0-10-4-10-10 6 0 10 4 10 10Z" fill="currentColor" opacity=".9" />
        <path d="M20 16c5 0 9-3 9-9-5 0-9 3-9 9Z" fill="currentColor" opacity=".65" />
      </svg>
    </span>
  );
}

export function AmaraLogo({ light = false, size = 1 }) {
  return (
    <span className={"logo" + (light ? " light" : "")} style={{ fontSize: `${size}em` }}>
      <span className="logo-word">amara</span>
      <span className="logo-sub">health</span>
    </span>
  );
}

export function Toggle({ on, onClick, label, desc }) {
  return (
    <button className="toggle-row" onClick={onClick} role="switch" aria-checked={on}>
      <span className="toggle-text"><b>{label}</b>{desc && <small>{desc}</small>}</span>
      <span className={"switch" + (on ? " on" : "")}><i /></span>
    </button>
  );
}

export function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <span className="sheet-grip" />
        {title && <h3 className="sheet-title">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function AfyaButton({ q, children = "Ask Afya about this" }) {
  const { nav } = useStore();
  return (
    <button className="btn btn-afya" onClick={() => nav.tab("afya", { ask: q })}>
      <Sparkles size={16} /> {children}
    </button>
  );
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}
