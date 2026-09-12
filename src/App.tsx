import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useNavigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConsentProvider } from "./contexts/ConsentContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CookieConsent } from "./components/CookieConsent";
import { OnboardingModal } from "./components/OnboardingModal";

const API = "";
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
const fetcher = (url: string) => fetch(`${API}${url}`).then(r => r.json());

interface Post { id: string; type: string; title: string; description: string; category: string; district: string; approxAddress: string; price?: number; originalPrice?: number; discountPercent?: number; urgency: string; status: string; isBoosted: boolean; isPro: boolean; isVerified: boolean; viewsCount: number; responsesCount: number; createdAt: string; authorId: string; authorName: string; authorAvatar: string; authorRating: number; authorCompletedCount: number; authorRole: string; businessName?: string; }
interface Resp { id: string; postId: string; userId: string; userName: string; userAvatar: string; userRating: number; userCompletedCount: number; message: string; offerPrice?: number; createdAt: string; status: string; }
interface User { id: string; name: string; phone: string; role: string; rating: number; district_name: string; completed_orders_count: number; responses_count: number; avatar_url: string | null; }

const TYPE_CONFIG: Record<string, { emoji: string; label: string; gradient: string; bg: string }> = {
  request: { emoji: "🆘", label: "Помощь", gradient: "from-rose-500 to-pink-600", bg: "bg-rose-50 text-rose-700" },
  deal: { emoji: "🛍", label: "Скидка", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 text-emerald-700" },
  event: { emoji: "🎉", label: "Событие", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50 text-violet-700" },
  alert: { emoji: "⚡", label: "Важно", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50 text-amber-700" },
  neighbor: { emoji: "🤝", label: "Соседи", gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 text-cyan-700" },
};

const DISTRICTS = ["Октябрьский", "Центральный", "Железнодорожный", "Заельцовский", "Ленинский", "Кировский", "Калининский", "Дзержинский", "Первомайский", "Советский"];
const CATEGORIES = ["Электрик", "Ремонт", "Перевозка", "Уборка", "Сборка мебели", "Компьютер", "Сантехник", "Животные", "Авто", "Другое"];

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}м назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ч назад`;
  return `${Math.floor(h / 24)}д назад`;
}

function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => nav("/")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-rose-200/50 group-hover:shadow-rose-300/60 transition-all duration-300 group-hover:scale-105">НСК</div>
          <div className="hidden sm:block"><span className="font-black text-base text-slate-900 tracking-tight">РЯДОМ</span><span className="ml-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">НСК</span></div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => nav("/profile")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-slate-200/60 hover:border-rose-200 hover:bg-white transition-all duration-200 group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">{user.name?.charAt(0) || "У"}</div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors hidden sm:block">{user.name}</span>
              </button>
              <button onClick={async () => { await logout(); nav("/"); }} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Выйти">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          ) : (
            <button onClick={() => nav("/login")} className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-rose-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">Войти</button>
          )}
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const nav = useNavigate();
  const { pathname } = window.location;
  const items = [
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, l: "Лента", p: "/" },
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, l: "Создать", p: "/create" },
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, l: "Профиль", p: "/profile" },
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, l: "Админ", p: "/admin" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <div className="mx-3 mb-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {items.map(it => {
            const active = pathname === it.p;
            return <button key={it.p} onClick={() => nav(it.p)} className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 ${active ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-200/50 scale-105" : "text-slate-400 hover:text-rose-500"}`}>
              {it.i}
              <span className="text-[9px] font-bold">{it.l}</span>
            </button>;
          })}
        </div>
      </div>
    </nav>
  );
}

function PostCard({ p }: { p: Post; key?: string }) {
  const nav = useNavigate();
  const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.request;
  const hasDiscount = p.originalPrice && p.discountPercent;

  return (
    <div onClick={() => nav(`/post/${p.id}`)} className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98]">
      {p.isBoosted && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${cfg.bg}`}>{cfg.emoji} {cfg.label}</span>
          {p.urgency === "high" && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-500 text-white animate-pulse">СРОЧНО</span>}
          {hasDiscount && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500 text-white">-{p.discountPercent}%</span>}
        </div>
        <h3 className="font-extrabold text-[13px] text-slate-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">{p.title}</h3>
        <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {p.district}
          </div>
          <div className="font-black text-sm text-slate-900">{p.price ? `${p.price.toLocaleString("ru")} ₽` : <span className="text-emerald-600">Бесплатно</span>}</div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[8px] font-bold text-white">{p.authorName?.charAt(0)}</div>
            <span className="text-[10px] font-semibold text-slate-500">{p.authorName}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5">⭐ {p.authorRating}</span>
            <span>·</span>
            <span>{p.responsesCount} откл.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const [filter, setFilter] = useState("all");
  const urgent = posts.filter(p => p.urgency === "high").length;
  const deals = posts.filter(p => p.type === "deal").length;
  const events = posts.filter(p => p.type === "event").length;
  const reqs = posts.filter(p => p.type === "request").length;
  const filters = [
    { k: "all", e: "📋", l: "Все", c: posts.length },
    { k: "request", e: "🆘", l: "Помощь", c: reqs },
    { k: "deal", e: "🛍", l: "Скидки", c: deals },
    { k: "event", e: "🎉", l: "События", c: events },
    { k: "urgent", e: "⚡", l: "Срочно", c: urgent },
  ];
  const filtered = filter === "all" ? posts : filter === "urgent" ? posts.filter(p => p.urgency === "high") : posts.filter(p => p.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-100 shadow-sm mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500">Новосибирск · Online</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Всё полезное <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">рядом</span></h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Помощь соседей, скидки кафе и события в шаговой доступности</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
          {filters.map(x => (
            <button key={x.k} onClick={() => setFilter(x.k)} className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${filter === x.k ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-200/50 scale-105" : "bg-white/80 text-slate-600 border border-slate-100 hover:border-rose-200 hover:shadow-sm"}`}>
              <span>{x.e}</span> {x.l}
              <span className={`text-[9px] min-w-[18px] text-center px-1 py-0.5 rounded-full font-black ${filter === x.k ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{x.c}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-medium">Загрузка...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-slate-100 backdrop-blur-sm">
            <div className="text-5xl mb-3">🏘</div>
            <p className="text-slate-600 font-bold text-sm">Пока пусто в этом разделе</p>
            <p className="text-slate-400 text-xs mt-1">Загляните позже или создайте первое объявление</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => <PostCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <BottomNav />
      <CookieConsent />
    </div>
  );
}

function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tab, setTab] = useState<"guest" | "sms">("guest");
  const [sending, setSending] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <Header />
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-2xl shadow-rose-200/50 rotate-3 hover:rotate-0 transition-transform duration-500">НСК</div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Добро пожаловать</h1>
          <p className="text-slate-400 text-sm mt-1">Ваш город — ваши возможности</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 p-5 mb-4">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
            <button onClick={() => setTab("guest")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${tab === "guest" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Просто зайти</button>
            <button onClick={() => setTab("sms")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${tab === "sms" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>По телефону</button>
          </div>

          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Как вас зовут?" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all" autoFocus />
            {tab === "sms" && <div className="flex gap-2">
              <span className="bg-slate-100 border border-slate-100 rounded-xl px-3 py-3 text-sm font-bold text-slate-600">+7</span>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="900 123 45 67" className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all" />
            </div>}
            <button onClick={async () => { setSending(true); try { if (tab === "guest") { await loginAsGuest(name || "Гость"); } else { await login(phone, name || "Житель"); } nav("/"); } catch { setSending(false); } }} disabled={sending || (tab === "sms" && phone.length < 10)} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 text-sm">
              {sending ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Входим...</div> : tab === "guest" ? "Зайти и посмотреть" : "Войти"}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-300 mt-3">Нажимая кнопку вы соглашаетесь с условиями сервиса</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-100">
          <h3 className="font-bold text-slate-900 text-xs mb-3 tracking-tight">Что внутри:</h3>
          <div className="space-y-2.5">
            {[{ e: "🆘", t: "Мастера рядом — электрик, сантехник, грузчик за минуты", c: "from-rose-500 to-pink-500" }, { e: "🛍", t: "Скидки кафе и магазинов в вашем районе", c: "from-emerald-500 to-teal-500" }, { e: "🎉", t: "События — концерты, мастер-классы, ярмарки", c: "from-violet-500 to-purple-500" }, { e: "🤝", t: "Помощь соседей — без посредников", c: "from-cyan-500 to-blue-500" }].map((x, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${x.c} flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>{x.e}</div>
                <span className="text-[11px] text-slate-600 leading-relaxed pt-1">{x.t}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function CreatePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { invalidateQueries } = useQueryClient();
  const [rawText, setRawText] = useState("");
  const [form, setForm] = useState({ title: "", category: "Электрик", description: "", price: "", urgent: false, district: "Октябрьский" });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const parseAI = async () => {
    if (!rawText.trim()) return;
    setAiLoading(true);
    try {
      const r = await fetch(`${API}/api/ai/parse-request`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawText }) });
      const d = await r.json();
      if (d.parsed) setForm(f => ({ ...f, title: d.parsed.title || f.title, category: d.parsed.category || f.category, description: d.parsed.description || f.description, price: d.parsed.price ? String(d.parsed.price) : f.price, urgent: d.parsed.urgency === "high" || f.urgent, district: d.parsed.district || f.district }));
    } catch {}
    setAiLoading(false);
  };

  const submit = async () => {
    if (!user || !form.title.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        type: form.urgent ? "request" : "deal", title: form.title, category: form.category, description: form.description || form.title,
        district: form.district, approxAddress: `район ${form.district}`, price: form.price ? Number(form.price) : undefined,
        urgency: form.urgent ? "high" : "normal", coordinates: [82.9204, 55.0084],
        authorId: user.id, authorName: user.name, authorAvatar: user.avatar_url || "",
        authorRating: user.rating || 5, authorCompletedCount: user.completed_orders_count || 0, authorRole: user.role || "user",
      })});
      invalidateQueries({ queryKey: ["posts"] }); setSuccess(true); setTimeout(() => nav("/"), 1500);
    } catch {} setLoading(false);
  };

  if (!user) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30"><Header /><main className="max-w-xl mx-auto px-4 py-8"><div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 text-center border border-white/20"><p className="text-slate-500 mb-4">Войдите, чтобы создать публикацию</p><button onClick={() => nav("/login")} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200/50">Войти</button></div></main></div>;
  if (success) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30"><Header /><main className="max-w-xl mx-auto px-4 py-8"><div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 text-center border border-white/20"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div><p className="text-lg font-black text-slate-900">Опубликовано!</p><p className="text-slate-400 text-xs mt-1">Переходим на главную...</p></div></main></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30"><Header />
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 p-5">
          <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Новая публикация</h2>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Опишите задачу</label>
              <textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Срочно нужен электрик, розетка на кухне, район Октябрьский, бюджет 2000" className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" />
              <button onClick={parseAI} disabled={aiLoading || !rawText.trim()} className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-[10px] rounded-lg hover:shadow-md disabled:opacity-40 transition-all">
                {aiLoading ? <><div className="w-3 h-3 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" /> AI оформляет...</> : <>🤖 Оформить с AI</>}
              </button>
            </div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Заголовок *</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Нужен электрик — замена розетки" className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Категория</label><select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Описание</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Подробности задачи..." className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Район</label><select value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all">{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div className="flex gap-2">
              <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Бюджет</label><input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="₽" type="number" className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" /></div>
              <div className="flex items-end pb-0.5"><button onClick={() => setForm(f => ({...f, urgent: !f.urgent}))} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${form.urgent ? "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-200/50" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>⚡ Срочно</button></div>
            </div>
            <button onClick={submit} disabled={loading || !form.title.trim()} className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 text-sm">
              {loading ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Публикация...</div> : "Опубликовать"}
            </button>
          </div>
        </div>
      </main><BottomNav />
    </div>
  );
}

function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const { invalidateQueries } = useQueryClient();
  const { data: post, isLoading } = useQuery<Post>({ queryKey: ["post", id], queryFn: () => fetcher(`/api/posts/${id}`), enabled: !!id });
  const { data: responses = [] } = useQuery<Resp[]>({ queryKey: ["responses", id], queryFn: () => fetcher(`/api/posts/${id}/respond`), enabled: !!id });
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const respond = async () => {
    if (!user || !msg.trim() || !id) return;
    await fetch(`${API}/api/posts/${id}/respond`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, userName: user.name, userAvatar: user.avatar_url || "", userRating: user.rating || 5, userCompletedCount: user.completed_orders_count || 0, message: msg }) });
    setMsg(""); setSent(true); invalidateQueries({ queryKey: ["responses", id] }); setTimeout(() => setSent(false), 2000);
  };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 flex items-center justify-center"><div className="text-center"><div className="text-5xl mb-3">😢</div><p className="font-bold text-slate-600">Не найдено</p><button onClick={() => nav("/")} className="mt-3 px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-200/50">На главную</button></div></div>;
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.request;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Назад</button>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${cfg.bg}`}>{cfg.emoji} {cfg.label}</span>
            {post.urgency === "high" && <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-red-500 text-white animate-pulse">СРОЧНО</span>}
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{post.category}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{post.title}</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{post.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {post.price !== undefined && post.price > 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl text-sm font-black text-slate-900">💰 {post.price.toLocaleString("ru")} ₽</span>}
            {post.price === 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-xl text-sm font-black text-emerald-700">💰 Бесплатно</span>}
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-500">📍 {post.district}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-500">👁 {post.viewsCount}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">{post.authorName?.charAt(0)}</div>
            <div><p className="text-xs font-bold text-slate-900">{post.authorName}</p><p className="text-[10px] text-slate-400">⭐ {post.authorRating} · {post.authorCompletedCount} выполнено · {post.authorRole}</p></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 p-5 mb-4">
          <h3 className="font-bold text-slate-900 mb-3 text-sm">Отклики ({Array.isArray(responses) ? responses.length : 0})</h3>
          {!Array.isArray(responses) || responses.length === 0 ? <p className="text-slate-400 text-xs">Пока нет откликов. Будьте первым!</p> :
            <div className="space-y-2">{responses.map(r => <div key={r.id} className="bg-slate-50/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1"><span className="font-bold text-xs text-slate-900">{r.userName}</span>{r.offerPrice && <span className="text-[10px] text-rose-600 font-bold">{r.offerPrice.toLocaleString("ru")} ₽</span>}</div>
              <p className="text-[11px] text-slate-500">{r.message}</p>
            </div>)}</div>
          }
        </div>

        {user ? <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 p-5">
          <h3 className="font-bold text-slate-900 mb-3 text-sm">Откликнуться</h3>
          {sent ? <div className="text-center py-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-200/50"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div><p className="text-sm font-bold text-emerald-600">Отправлено!</p></div> : <>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Расскажите, чем вы поможете..." className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all mb-3" />
            <button onClick={respond} disabled={!msg.trim()} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-rose-300/60 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 transition-all text-sm">Отправить отклик</button>
          </>}
        </div> : <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-5 text-center border border-white/20">
          <p className="text-slate-500 text-sm mb-3">Войдите, чтобы откликнуться</p>
          <button onClick={() => nav("/login")} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-200/50">Войти</button>
        </div>}
      </main>
      <BottomNav />
    </div>
  );
}

function ProfilePage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const myPosts = user ? posts.filter(p => p.authorId === user.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {user ? <>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 p-5 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-rose-200/50">{user.name?.charAt(0) || "У"}</div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                <p className="text-xs text-slate-400">⭐ {user.rating || 5} · {user.role === "admin" ? "Админ" : user.role === "business" ? "Бизнес" : user.role === "executor" ? "Исполнитель" : "Житель"} · {user.district_name || "Октябрьский"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[{ v: myPosts.length, l: "Объявл.", c: "from-rose-500 to-pink-500" }, { v: user.completed_orders_count || 0, l: "Выполнено", c: "from-emerald-500 to-teal-500" }, { v: `⭐${user.rating || 5}`, l: "Рейтинг", c: "from-amber-500 to-orange-500" }].map(s => <div key={s.l} className="text-center p-3 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100"><div className="text-lg font-black text-slate-900">{s.v}</div><div className="text-[10px] text-slate-400 font-medium">{s.l}</div></div>)}
            </div>
          </div>
          {myPosts.length > 0 && <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Мои публикации</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{myPosts.map(p => <PostCard key={p.id} p={p} />)}</div>
          </div>}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-4 space-y-2">
            <button onClick={() => nav("/create")} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-200/50 hover:scale-[1.01] active:scale-[0.99] transition-all">➕ Новая публикация</button>
            <button onClick={() => nav("/admin")} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-all">🔧 Админ-панель</button>
            <button onClick={async () => { await logout(); nav("/"); }} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl text-sm transition-all">Выйти</button>
          </div>
        </> : <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 text-center border border-white/20">
          <p className="text-slate-500 mb-3">Войдите, чтобы видеть профиль</p>
          <button onClick={() => nav("/login")} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200/50">Войти</button>
        </div>}
      </main>
      <BottomNav />
    </div>
  );
}

function AdminPage() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetcher("/api/admin/stats") });
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: () => fetcher("/api/admin/reports") });
  const { data: auditLogs = [] } = useQuery({ queryKey: ["audit"], queryFn: () => fetcher("/api/admin/audit") });
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const nav = useNavigate();
  const { invalidateQueries } = useQueryClient();

  const toggleBoost = async (id: string) => { await fetch(`${API}/api/posts/${id}/boost`, { method: "POST" }); invalidateQueries({ queryKey: ["posts"] }); invalidateQueries({ queryKey: ["admin-stats"] }); };
  const deletePost = async (id: string) => { if (!confirm("Удалить?")) return; await fetch(`${API}/api/posts/${id}`, { method: "DELETE" }); invalidateQueries({ queryKey: ["posts"] }); invalidateQueries({ queryKey: ["admin-stats"] }); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">🔧 Админ-панель</h2>
        {stats && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[{ l: "Юзеры", v: stats.totalUsers, c: "from-blue-500 to-indigo-500" }, { l: "Посты", v: stats.totalPosts, c: "from-rose-500 to-pink-500" }, { l: "Отклики", v: stats.totalResponses, c: "from-emerald-500 to-teal-500" }, { l: "Бизнес", v: stats.totalBusinesses, c: "from-amber-500 to-orange-500" }, { l: "Жалобы", v: stats.totalReports, c: "from-red-500 to-rose-500" }, { l: "События", v: stats.totalEvents, c: "from-violet-500 to-purple-500" }].map(s => <div key={s.l} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.c} flex items-center justify-center text-white text-xs font-bold mb-2 shadow-sm`}>{s.v}</div>
            <div className="text-[10px] text-slate-400 font-medium">{s.l}</div>
          </div>)}
        </div>}

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/20 overflow-hidden mb-4">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-slate-900 text-sm">Публикации ({posts.length})</h3><button onClick={() => nav("/create")} className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold rounded-lg shadow-sm">+ Создать</button></div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {posts.map(p => { const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.request; return <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-sm flex-shrink-0 shadow-sm`}>{cfg.emoji}</div>
              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-900 truncate">{p.title}</p><p className="text-[10px] text-slate-400">{p.district} · {p.category} · {timeAgo(p.createdAt)}</p></div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleBoost(p.id)} className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all ${p.isBoosted ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-amber-50"}`}>{p.isBoosted ? "⚡" : "↑"}</button>
                <button onClick={() => nav(`/post/${p.id}`)} className="px-2 py-1 text-[9px] font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">→</button>
                <button onClick={() => deletePost(p.id)} className="px-2 py-1 text-[9px] font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">✕</button>
              </div>
            </div>;})}
          </div>
        </div>

        {Array.isArray(auditLogs) && auditLogs.length > 0 && <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-sm">Журнал ({auditLogs.length})</h3></div>
          <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">{auditLogs.map((l: any) => <div key={l.id} className="p-3 flex items-center gap-3 text-xs"><span className="text-slate-400 w-12">{new Date(l.timestamp).toLocaleTimeString("ru")}</span><span className="font-bold text-slate-700">{l.action}</span><span className="text-slate-500">{l.user}</span></div>)}</div>
        </div>}
      </main>
      <BottomNav />
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/create", element: <CreatePage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "/post/:id", element: <PostDetailPage /> },
]);

export default function App() {
  return <QueryClientProvider client={qc}>
    <ConsentProvider><AuthProvider>
      <RouterProvider router={router} />
      <OnboardingModal />
    </AuthProvider></ConsentProvider>
  </QueryClientProvider>;
}
