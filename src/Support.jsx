import { useEffect, useState } from "react";
import { MapPin, Phone, ShoppingBasket, Stethoscope, Bus, HeartHandshake, Baby, Building2, HandHeart, ExternalLink, Navigation, Loader2, Lock, Store, RefreshCw } from "lucide-react";
import { useStore } from "./useStore";
import { TopBar, Photo, Sheet } from "./ui";
import { validZip, lookupZip, healthCenters, snapStores, resourceGroups, mapsLink, telLink } from "./local";

const ICONS = { ShoppingBasket, Stethoscope, Bus, HeartHandshake, Baby, Building2, HandHeart };
const ext = { target: "_blank", rel: "noopener noreferrer" };

function LinkBtn({ label, href }) {
  const tel = href.startsWith("tel:");
  return (
    <a className={tel ? "res-link tel" : "res-link"} href={href} {...(tel ? {} : ext)}>
      {tel ? <Phone size={13} /> : <ExternalLink size={13} />} {label}
    </a>
  );
}

export function Support({ open: open0 = null }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(open0);
  const [input, setInput] = useState(state.zip || "");
  const [editing, setEditing] = useState(!validZip(state.zip));
  const [data, setData] = useState({ status: "idle" });
  const zip = state.zip;

  useEffect(() => {
    if (!validZip(zip)) return;
    let live = true;
    const run = async () => {
      setData({ status: "loading" });
      try {
        const place = await lookupZip(zip);
        const [hc, st] = await Promise.allSettled([healthCenters(place), snapStores(place)]);
        if (live) setData({ status: "ready", place, centers: hc.status === "fulfilled" ? hc.value : null, stores: st.status === "fulfilled" ? st.value : null });
      } catch {
        if (live) setData({ status: "error" });
      }
    };
    run();
    return () => { live = false; };
  }, [zip]);

  const submit = (e) => {
    e.preventDefault();
    if (!validZip(input)) return;
    dispatch({ type: "set", patch: { zip: input } });
    setEditing(false);
  };
  const groups = validZip(zip) ? resourceGroups(zip) : [];
  const cat = groups.find((r) => r.id === open);
  const place = data.place;

  return (
    <div>
      <TopBar title="Support Near You" />
      <div className="pad">
        <Photo name="g-community-meal" pos="50% 30%" h={140} />
        <h1 className="display-sm" style={{ marginTop: 18 }}>Need a little extra support?</h1>
        <p className="muted">Real programs near you: health centers, groceries that take EBT, food banks, WIC and more.</p>

        {editing || !validZip(zip) ? (
          <form className="zip-form" onSubmit={submit}>
            <label htmlFor="zip"><MapPin size={15} /> Your ZIP code</label>
            <div>
              <input id="zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="e.g. 21201" value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))} />
              <button className="btn btn-primary btn-sm" disabled={!validZip(input)}>Find support</button>
            </div>
            <p className="muted small"><Lock size={11} /> Amara saves only your ZIP code, never your address. It's used to search public directories.</p>
          </form>
        ) : (
          <div className="loc">
            <MapPin size={15} /> Showing support near <b>{place ? `${place.city}, ${place.state} ${zip}` : zip}</b>
            <button className="link" onClick={() => setEditing(true)}>Change</button>
          </div>
        )}

        {data.status === "loading" && validZip(zip) && <div className="live-loading"><Loader2 size={18} className="spin" /> Searching public directories near {zip}…</div>}
        {data.status === "error" && validZip(zip) && !editing && (
          <div className="card soft"><p>We couldn't find that ZIP code. Please check it and try again.</p><button className="link" onClick={() => setEditing(true)}>Change ZIP</button></div>
        )}

        {data.status === "ready" && validZip(zip) && (
          <>
            <section className="live">
              <div className="live-head"><Stethoscope size={18} /><div><b>Community health centers</b><small>Prenatal care on a sliding-fee scale · HRSA</small></div></div>
              {data.centers === null && <p className="muted small">Couldn't load health centers right now. <a href="https://findahealthcenter.hrsa.gov/" {...ext}>Search HRSA's finder</a>.</p>}
              {data.centers?.length === 0 && <p className="muted small">No HRSA health centers within 25 miles. <a href="https://findahealthcenter.hrsa.gov/" {...ext}>Search HRSA's finder</a>.</p>}
              {data.centers?.map((c) => (
                <div key={c.name + c.address} className="live-item">
                  <div><b>{c.name}</b><small>{c.org}</small><small>{c.address} · {c.mi.toFixed(1)} mi</small></div>
                  <div className="live-acts">
                    {c.phone && <a href={telLink(c.phone)} aria-label={`Call ${c.name}`}><Phone size={15} /></a>}
                    <a href={mapsLink(`${c.name} ${c.address}`)} {...ext} aria-label="Directions"><Navigation size={15} /></a>
                  </div>
                </div>
              ))}
            </section>

            <section className="live">
              <div className="live-head"><Store size={18} /><div><b>Groceries that accept SNAP/EBT</b><small>Supermarkets & farmers markets · USDA</small></div></div>
              {data.stores === null && <p className="muted small">Couldn't load stores right now. <a href="https://www.fna.usda.gov/snap/retailer-locator" {...ext}>Use USDA's locator</a>.</p>}
              {data.stores?.length === 0 && <p className="muted small">No stores found nearby. <a href="https://www.fna.usda.gov/snap/retailer-locator" {...ext}>Use USDA's locator</a>.</p>}
              {data.stores?.map((s) => (
                <div key={s.name + s.address} className="live-item">
                  <div><b>{s.name}</b><small>{s.type} · {s.address} · {s.mi.toFixed(1)} mi</small></div>
                  <div className="live-acts"><a href={mapsLink(`${s.name} ${s.address}`)} {...ext} aria-label="Directions"><Navigation size={15} /></a></div>
                </div>
              ))}
            </section>
          </>
        )}

        {validZip(zip) && (
          <>
            <p className="eyebrow" style={{ margin: "22px 0 10px" }}>More support near {zip}</p>
            <div className="res-grid">
              {groups.map((r) => {
                const I = ICONS[r.icon] || HandHeart;
                return <button key={r.id} onClick={() => setOpen(r.id)}><I size={20} /><span>{r.label}</span></button>;
              })}
            </div>
          </>
        )}

        <div className="card soft">
          <p className="eyebrow"><Phone size={12} /> Anytime, day or night</p>
          <p><b>National Maternal Mental Health Hotline</b><br />Call or text <a href="tel:18338526262">1-833-TLC-MAMA (1-833-852-6262)</a></p>
          <p className="muted small">Not sure where to start? Call or text 211 for local help. In a crisis, call or text 988. In an emergency, call 911.</p>
        </div>
        <p className="muted small source-note">
          Sources: HRSA Health Center Service Delivery Sites and USDA SNAP Retailer Locator (live public data), plus official program finders.
          Hours and eligibility change, so please call ahead. <button className="link" onClick={() => dispatch({ type: "set", patch: { zip: "" } })}><RefreshCw size={11} /> Clear my ZIP</button>
        </p>
      </div>
      <Sheet open={!!cat} onClose={() => setOpen(null)} title={cat?.label}>
        {cat?.items.map((it) => (
          <div key={it.name} className="res-item">
            <b>{it.name}</b>
            <p className="muted small">{it.detail}</p>
            {it.links.length > 0 && <div className="res-links">{it.links.map(([l, h]) => <LinkBtn key={l} label={l} href={h} />)}</div>}
          </div>
        ))}
        {cat && <p className="muted small" style={{ marginTop: 10 }}>Links open the official program site.</p>}
      </Sheet>
    </div>
  );
}
