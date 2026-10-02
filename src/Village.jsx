import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, MessageCircle, Send, ShieldCheck, Image as ImageIcon, EyeOff, Flag, Ban, Bookmark, Bell, Plus, Users, Info, Sparkles, CalendarDays, ChevronRight, X, BarChart3 } from "lucide-react";
import { useStore } from "./useStore";
import { TopBar, Avatar, RoleBadge, Sheet, Toggle, Photo, Chip, Empty } from "./ui";
import { ROOMS, PEOPLE, LIVE_CHAT, CHAT_REPLIES, EVENTS } from "./data";

const MEDICAL = /bleed|pain|medic|dose|pill|castor|labor|contraction|blood pressure|diabet|cramp|spotting|vitamin|supplement|herb/i;
const roomOf = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0];

function HealthNotice() {
  return (
    <div className="health-notice">
      <Info size={15} />
      <p><b>Health information notice.</b> Experiences shared here may not apply to every pregnancy. For medical concerns, contact your healthcare professional.</p>
    </div>
  );
}

function PostMenu({ post, open, onClose }) {
  const { state, dispatch, notify } = useStore();
  const following = state.following.includes(post?.id);
  return (
    <Sheet open={open} onClose={onClose} title="Post options">
      <div className="menu">
        <button onClick={() => { dispatch({ type: "toggleIn", key: "following", id: post.id }); notify(following ? "Unfollowed" : "Following this conversation"); onClose(); }}><Bell size={18} /> {following ? "Unfollow conversation" : "Follow conversation"}</button>
        <button onClick={() => { notify("Saved to your Village bookmarks"); onClose(); }}><Bookmark size={18} /> Save</button>
        <button onClick={() => { notify("Thanks. A moderator will review this"); onClose(); }}><Flag size={18} /> Report to moderators</button>
        <button className="danger" onClick={() => { notify(`You won't see posts from ${PEOPLE[post.by]?.name || "this member"}`); onClose(); }}><Ban size={18} /> Block member</button>
      </div>
    </Sheet>
  );
}

function Reactions({ post }) {
  const { state, dispatch } = useStore();
  const emojis = Array.from(new Set([...Object.keys(post.reactions), "💛", "🙌", "🫂"])).slice(0, 4);
  return (
    <div className="reactions">
      {emojis.map((e) => (
        <button key={e} className={state.myReactions[post.id + e] ? "on" : ""} onClick={(ev) => { ev.stopPropagation(); dispatch({ type: "react", post: post.id, emoji: e }); }} aria-label={`React ${e}`}>
          {e} <span>{post.reactions[e] || ""}</span>
        </button>
      ))}
    </div>
  );
}

export function PostCard({ post, compact }) {
  const { nav } = useStore();
  const [menu, setMenu] = useState(false);
  const who = PEOPLE[post.by] || PEOPLE.anon;
  return (
    <article className="post" onClick={() => nav.go("thread", { id: post.id })}>
      <header>
        <Avatar who={post.by} />
        <div className="post-who">
          <b>{who.name}</b> <RoleBadge who={post.by} />
          <small>{roomOf(post.room).emoji} {roomOf(post.room).name} · {post.time}{who.week && !who.anon ? ` · ${who.week}` : ""}</small>
        </div>
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setMenu(true); }} aria-label="Post options"><MoreHorizontal size={18} /></button>
      </header>
      <p className="post-text">{post.text}</p>
      {post.photo && <Photo name={post.photo} h={150} r={14} />}
      {post.poll && <div className="poll">{post.poll.map((o) => <span key={o}>{o}</span>)}</div>}
      {post.flagged && !compact && <HealthNotice />}
      <footer>
        <Reactions post={post} />
        <span className="replies"><MessageCircle size={15} /> {post.replies.length}</span>
      </footer>
      <span onClick={(e) => e.stopPropagation()}><PostMenu post={post} open={menu} onClose={() => setMenu(false)} /></span>
    </article>
  );
}

export function Village({ tab: tab0 = "For You" }) {
  const { state, dispatch, nav, notify } = useStore();
  const [tab, setTab] = useState(tab0);
  const joined = ROOMS.filter((r) => state.joined.includes(r.id));

  return (
    <div className="village">
      <header className="village-head">
        <div className="vh-top">
          <div>
            <p className="eyebrow light">The Village</p>
            <h1 className="display-sm">Motherhood was never meant to happen alone.</h1>
          </div>
          <button className="icon-btn light" onClick={() => nav.go("guidelines")} aria-label="Community guidelines"><ShieldCheck size={20} /></button>
        </div>
        <div className="seg">
          {["For You", "Rooms", "Ask", "Events"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => (t === "Ask" ? nav.go("compose") : setTab(t))}>{t}</button>)}
        </div>
      </header>

      {tab === "For You" && (
        <div className="pad">
          <button className="table-card" onClick={() => nav.go("room", { id: "around-the-table" })}>
            <Photo name="g-community-meal" pos="50% 45%" h={170}>
              <span className="pill">🍲 Featured room · 48 here now</span>
              <h3>Around the Table</h3>
              <span className="sub">Share the meals, traditions, recipes, and stories nourishing your family.</span>
            </Photo>
          </button>

          <div className="sec-head"><h3>Your rooms</h3><button className="link" onClick={() => setTab("Rooms")}>Browse all</button></div>
          <div className="h-scroll rooms-row">
            {joined.map((r) => (
              <button key={r.id} className="room-chip" onClick={() => nav.go("room", { id: r.id })}>
                <span className="room-emoji">{r.emoji}</span><b>{r.name}</b><small><i className="live-dot" /> {r.here} here</small>
              </button>
            ))}
          </div>

          <button className="compose-cta" onClick={() => nav.go("compose")}>
            <Avatar who="maya" size={32} /><span>What's on your mind, {state.profile.name}?</span><Plus size={18} />
          </button>

          <div className="sec-head"><h3>For you</h3></div>
          {state.posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      {tab === "Rooms" && (
        <div className="pad">
          <p className="muted">Small, moderated rooms. Join the ones that feel like you.</p>
          {ROOMS.map((r) => {
            const on = state.joined.includes(r.id);
            return (
              <div key={r.id} className={"room-row" + (r.featured ? " featured" : "")}>
                <button className="room-hit" onClick={() => nav.go("room", { id: r.id })}>
                  <span className="room-emoji big">{r.emoji}</span>
                  <span><b>{r.name}</b><small>{r.desc}</small><small className="here"><i className="live-dot" /> {r.here} here now · {r.members.toLocaleString()} members</small></span>
                </button>
                <button className={"btn btn-sm " + (on ? "btn-soft" : "btn-primary")} onClick={() => { dispatch({ type: "toggleIn", key: "joined", id: r.id }); notify(on ? `Left ${r.name}` : `Joined ${r.name}`); }}>{on ? "Joined" : "Join"}</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Events" && <EventsList />}
    </div>
  );
}

export const Rooms = () => <Village tab="Rooms" />;

function EventsList() {
  const { state, dispatch, notify } = useStore();
  return (
    <div className="pad">
      <p className="muted">Gather live, with mamas and experts who get it.</p>
      {EVENTS.map((e) => {
        const going = state.rsvps.includes(e.id);
        return (
          <div key={e.id} className="event">
            <Photo name={e.img} pos={e.pos} h={120} r={16}><span className="pill">{e.kind}</span></Photo>
            <div className="event-body">
              <p className="eyebrow"><CalendarDays size={13} /> {e.when}</p>
              <h4>{e.title}</h4>
              <p className="muted small">Hosted by {e.host} · {e.going + (going ? 1 : 0)} going</p>
              <button className={"btn btn-sm " + (going ? "btn-soft" : "btn-primary")} onClick={() => { dispatch({ type: "toggleIn", key: "rsvps", id: e.id }); notify(going ? "RSVP removed" : "You're going! We'll remind you"); }}>{going ? "Going ✓" : "RSVP"}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Events() {
  return (
    <div>
      <TopBar title="Village events" />
      <EventsList />
    </div>
  );
}

function ChatMsg({ m }) {
  if (m.kind === "tip") {
    return (
      <div className="chat-tip">
        <p className="eyebrow"><Sparkles size={13} /> Amara nutrition tip</p>
        <p>{m.text}</p>
      </div>
    );
  }
  const who = PEOPLE[m.by] || PEOPLE.anon;
  const mine = m.mine;
  return (
    <div className={"chat-msg" + (mine ? " mine" : "") + (who.role === "expert" ? " expert" : "")}>
      {!mine && <Avatar who={m.by} size={30} />}
      <div className="chat-bubble">
        {!mine && <span className="chat-name">{who.name} <RoleBadge who={m.by} /></span>}
        {mine && m.anon && <span className="chat-name">Anonymous (you)</span>}
        <p>{m.text}</p>
      </div>
    </div>
  );
}

export function Room({ id = "working-mamas" }) {
  const { state, dispatch, nav, notify } = useStore();
  const room = roomOf(id);
  const isLive = id === "working-mamas";
  const posts = state.posts.filter((p) => p.room === id);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(state.privacy.anonymousDefault);
  const [typing, setTyping] = useState(null);
  const [menu, setMenu] = useState(false);
  const endRef = useRef();
  const replyIdx = useRef(0);
  const msgs = [...LIVE_CHAT, ...state.chat];
  const joined = state.joined.includes(id);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length, typing]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "chat", msg: { by: "maya", mine: true, anon, text: text.trim() } });
    setText("");
    const r = CHAT_REPLIES[replyIdx.current++ % CHAT_REPLIES.length];
    setTimeout(() => setTyping(PEOPLE[r.by].name), 700);
    setTimeout(() => { setTyping(null); dispatch({ type: "chat", msg: r }); }, 2200);
  };

  return (
    <div className={"room" + (isLive ? " live" : "")}>
      <TopBar
        title={`${room.emoji} ${room.name}`}
        sub={<><i className="live-dot" /> {room.here} mamas here</>}
        right={<button className="icon-btn" onClick={() => setMenu(true)} aria-label="Room options"><MoreHorizontal size={20} /></button>}
      />
      {isLive ? (
        <>
          <div className="chat">
            <div className="chat-banner"><ShieldCheck size={15} /> Moderated room · Be kind · No medical advice. Share experiences, not prescriptions.</div>
            {msgs.map((m, k) => <ChatMsg key={k} m={m} />)}
            {typing && <div className="chat-typing">{typing} is typing<span className="dots"><i /><i /><i /></span></div>}
            <div ref={endRef} />
          </div>
          <form className="chat-composer" onSubmit={send}>
            <button type="button" className={"anon-toggle" + (anon ? " on" : "")} onClick={() => setAnon(!anon)} aria-pressed={anon} title="Post anonymously"><EyeOff size={18} /></button>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={anon ? "Message anonymously…" : "Message Working Mamas…"} aria-label="Message" />
            <button className="send" disabled={!text.trim()} aria-label="Send"><Send size={18} /></button>
          </form>
        </>
      ) : (
        <div className="pad">
          <p className="muted">{room.desc}</p>
          <div className="actions">
            <button className={"btn " + (joined ? "btn-soft" : "btn-primary")} onClick={() => { dispatch({ type: "toggleIn", key: "joined", id }); notify(joined ? "Left room" : `Joined ${room.name}`); }}>{joined ? "Joined" : "Join room"}</button>
            <button className="btn btn-ghost" onClick={() => nav.go("compose", { room: id })}><Plus size={16} /> Post here</button>
          </div>
          {id === "around-the-table" && (
            <div className="card table-prompt">
              <p className="eyebrow">This week at the table</p>
              <p className="serif-lg">What dish did someone you love make for you when you were growing up?</p>
              <button className="link" onClick={() => nav.go("compose", { room: id, type: "Share a meal" })}>Share your story <ChevronRight size={14} /></button>
            </div>
          )}
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
          {!posts.length && <Empty>Be the first to start a conversation here.</Empty>}
          <button className="btn btn-soft btn-block" onClick={() => nav.go("room", { id: "working-mamas" })}><Users size={16} /> Try a live room: Working Mamas</button>
        </div>
      )}
      <Sheet open={menu} onClose={() => setMenu(false)} title={room.name}>
        <div className="menu">
          <button onClick={() => { setMenu(false); nav.go("guidelines"); }}><ShieldCheck size={18} /> Community guidelines</button>
          <button onClick={() => { notify("Notifications muted for this room"); setMenu(false); }}><Bell size={18} /> Mute notifications</button>
          <button onClick={() => { notify("A moderator has been notified"); setMenu(false); }}><Flag size={18} /> Contact a moderator</button>
        </div>
      </Sheet>
    </div>
  );
}

export function Thread({ id }) {
  const { state, dispatch, notify } = useStore();
  const post = state.posts.find((p) => p.id === id) || state.posts[0];
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(state.privacy.anonymousDefault);
  const following = state.following.includes(post.id);
  const medical = post.flagged || MEDICAL.test(post.text);
  return (
    <div>
      <TopBar title="Conversation" right={<button className={"btn btn-sm " + (following ? "btn-soft" : "btn-ghost")} onClick={() => { dispatch({ type: "toggleIn", key: "following", id: post.id }); notify(following ? "Unfollowed" : "Following"); }}>{following ? "Following" : "Follow"}</button>} />
      <div className="pad thread-pad">
        <PostCard post={post} compact />
        {medical && <HealthNotice />}
        <p className="field-label">{post.replies.length} replies</p>
        {post.replies.map((r, k) => {
          const who = PEOPLE[r.by] || PEOPLE.anon;
          return (
            <div key={k} className={"reply" + (who.role ? " " + who.role : "")}>
              <Avatar who={r.by} size={30} />
              <div>
                <span className="chat-name">{r.anon ? "Anonymous (you)" : who.name} <RoleBadge who={r.by} />{who.title && <small> · {who.title}</small>}</span>
                <p>{r.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form className="chat-composer sticky" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; dispatch({ type: "reply", post: post.id, reply: { by: anon ? "anon" : "maya", anon, text: text.trim() } }); setText(""); notify("Reply posted"); }}>
        <button type="button" className={"anon-toggle" + (anon ? " on" : "")} onClick={() => setAnon(!anon)} aria-pressed={anon} title="Reply anonymously"><EyeOff size={18} /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={anon ? "Reply anonymously…" : "Add a kind reply…"} aria-label="Reply" />
        <button className="send" disabled={!text.trim()} aria-label="Send"><Send size={18} /></button>
      </form>
    </div>
  );
}

const TYPES = ["Ask a question", "Share a win", "Share a meal", "Ask for ideas", "Create a poll"];

export function Compose({ room: room0 = "second-tri", type: type0 = "Ask a question" }) {
  const { state, dispatch, nav, notify } = useStore();
  const [type, setType] = useState(type0);
  const [room, setRoom] = useState(room0);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(state.privacy.anonymousDefault);
  const [photo, setPhoto] = useState(null);
  const [poll, setPoll] = useState(["Beans & lentils", "Eggs & dairy"]);
  const medical = MEDICAL.test(text);

  const submit = () => {
    const post = { id: "p" + Date.now(), room, by: anon ? "anon" : "maya", time: "now", text: text.trim(), reactions: { "💛": 0 }, replies: [], photo, poll: type === "Create a poll" ? poll.filter(Boolean) : null };
    dispatch({ type: "post", post });
    dispatch({ type: "addTo", key: "following", id: post.id });
    notify(anon ? "Posted anonymously" : "Posted to the Village");
    nav.replace("thread", { id: post.id });
  };

  return (
    <div className="compose">
      <div className="compose-top">
        <button className="icon-btn" onClick={nav.back} aria-label="Close"><X size={20} /></button>
        <b>New post</b>
        <button className="btn btn-sm btn-primary" disabled={!text.trim()} onClick={submit}>Post</button>
      </div>
      <div className="pad">
        <h1 className="display-sm">What's on your mind?</h1>
        <div className="chips">{TYPES.map((t) => <Chip small key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
        <div className={"compose-as" + (anon ? " anon" : "")}>
          {anon ? <span className="avatar anon-av"><EyeOff size={16} /></span> : <Avatar who="maya" size={34} />}
          <div><b>{anon ? "Anonymous mama" : state.profile.name}</b><small>{anon ? "Your name and profile are hidden from members" : `Week ${state.profile.week} · visible to room members`}</small></div>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="e.g. I'm 26 weeks and suddenly don't want meat. What are you all eating for protein?" aria-label="Post text" />
        {type === "Create a poll" && (
          <div className="poll-edit">
            {poll.map((o, k) => <input key={k} value={o} onChange={(e) => setPoll(poll.map((x, j) => (j === k ? e.target.value : x)))} placeholder={`Option ${k + 1}`} />)}
            {poll.length < 4 && <button className="link" onClick={() => setPoll([...poll, ""])}><Plus size={14} /> Add option</button>}
          </div>
        )}
        {photo && <div className="photo-prev"><Photo name={photo} h={130} r={14} /><button className="icon-btn soft" onClick={() => setPhoto(null)} aria-label="Remove photo"><X size={16} /></button></div>}
        <div className="compose-tools">
          <button onClick={() => setPhoto("g-meal-bowl")}><ImageIcon size={18} /> Add photo</button>
          <button onClick={() => setType("Create a poll")}><BarChart3 size={18} /> Poll</button>
        </div>
        <p className="field-label">Post in</p>
        <div className="chips">{ROOMS.slice(0, 8).map((r) => <Chip small key={r.id} active={room === r.id} onClick={() => setRoom(r.id)}>{r.emoji} {r.name}</Chip>)}</div>
        <div className="list"><Toggle label="Post anonymously" desc="Great for sensitive questions. Moderators can still keep the space safe." on={anon} onClick={() => setAnon(!anon)} /></div>
        {medical && <div className="health-notice soft"><Info size={15} /><p>Community experiences can be helpful, but they don't replace medical advice.</p></div>}
        <button className="link guide-link" onClick={() => nav.go("guidelines")}><ShieldCheck size={14} /> Community guidelines</button>
      </div>
    </div>
  );
}

export function Guidelines() {
  return (
    <div>
      <TopBar title="Keeping the Village safe" />
      <div className="pad">
        <h1 className="display-sm">A space built on trust.</h1>
        <div className="guide">
          {[
            ["Kindness first", "Every pregnancy, body, culture and choice is respected here."],
            ["Experiences, not prescriptions", "Share what worked for you. Leave medical advice to professionals."],
            ["Verified experts", "Look for the verified badge. Registered dietitians, midwives and clinicians are verified by Amara."],
            ["Moderated rooms", "Trained moderators review reports quickly and can remove harmful content."],
            ["Misinformation safeguards", "Posts that may be risky get a health information notice and moderator review."],
            ["Anonymous posting", "Ask anything without your name attached."],
            ["Report & block", "Use the ⋯ menu on any post. Blocking is private, so the member isn't notified."],
            ["Your privacy", "Never share anyone's personal or medical details outside the Village."],
          ].map(([a, b]) => <div key={a}><ShieldCheck size={18} /><p><b>{a}</b>{b}</p></div>)}
        </div>
      </div>
    </div>
  );
}
