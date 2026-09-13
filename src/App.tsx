import React, { useState, useEffect, useRef } from "react";
import { createBrowserRouter, RouterProvider, useNavigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConsentProvider } from "./contexts/ConsentContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CookieConsent } from "./components/CookieConsent";
import { OnboardingModal } from "./components/OnboardingModal";
import {
  Search, Plus, User, Settings, ArrowLeft, Check, X, Zap,
  MapPin, Clock, Star, MessageCircle, Filter, Menu,
  TrendingUp, Shield, Gift, Users, Activity, Compass,
  Sparkles, ArrowRight, Bell, ChevronDown, Loader2,
  Heart, Share2, Flag, ArrowUp, CheckCheck,
  FileText, Store, Calendar
} from "lucide-react";

const API = "";
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
const fetcher = (url: string) => fetch(`${API}${url}`).then(r => r.json());

interface Post { id: string; type: string; title: string; description: string; category: string; district: string; approxAddress: string; price?: number; originalPrice?: number; discountPercent?: number; urgency: string; status: string; isBoosted: boolean; isPro: boolean; isVerified: boolean; viewsCount: number; responsesCount: number; createdAt: string; authorId: string; authorName: string; authorAvatar: string; authorRating: number; authorCompletedCount: number; authorRole: string; businessName?: string; }
interface Resp { id: string; postId: string; userId: string; userName: string; userAvatar: string; userRating: number; userCompletedCount: number; message: string; offerPrice?: number; createdAt: string; status: string; }
interface User { id: string; name: string; phone: string; role: string; rating: number; district_name: string; completed_orders_count: number; responses_count: number; avatar_url: string | null; }

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; bg: string; border: string }> = {
  request: { icon: <Zap size={14} />, label: "Помощь", bg: "bg-red-500/10 text-red-400", border: "border-red-500/20" },
  deal: { icon: <Gift size={14} />, label: "Скидка", bg: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20" },
  event: { icon: <Activity size={14} />, label: "Событие", bg: "bg-violet-500/10 text-violet-400", border: "border-violet-500/20" },
  alert: { icon: <Bell size={14} />, label: "Важно", bg: "bg-amber-500/10 text-amber-400", border: "border-amber-500/20" },
  neighbor: { icon: <Users size={14} />, label: "Соседи", bg: "bg-cyan-500/10 text-cyan-400", border: "border-cyan-500/20" },
};

const DISTRICTS = ["Октябрьский", "Центральный", "Железнодорожный", "Заельцовский", "Ленинский", "Кировский", "Калининский", "Дзержинский", "Первомайский", "Советский"];
const CATEGORIES = ["Электрик", "Ремонт", "Перевозка", "Уборка", "Сборка мебели", "Компьютер", "Сантехник", "Животные", "Авто", "Другое"];

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}м`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ч`;
  return `${Math.floor(h / 24)}д`;
}

function LogoMark() {
  return (
    <div className="logo-mark">Р</div>
  );
}

function MeshBackground() {
  return (
    <>
      <div className="mesh-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-pattern absolute inset-0" />
    </>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "glass py-2 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" : "bg-transparent py-4"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => nav("/")}>
          <LogoMark />
          <div className="hidden sm:block">
            <span className="font-display font-bold text-lg tracking-tight text-white">РЯДОМ</span>
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">НСК</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => nav("/profile")} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass hover:bg-white/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-black text-bg shadow-sm">{user.name?.charAt(0) || "У"}</div>
                <span className="text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors hidden sm:inline">{user.name}</span>
              </button>
              <button onClick={async () => { await logout(); nav("/"); }} className="p-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label="Выйти">
                <Settings size={18} className="rotate-45" />
              </button>
            </>
          ) : (
            <button onClick={() => nav("/login")} className="px-5 py-2.5 btn-primary text-xs flex items-center gap-2">
              <span>Войти</span>
              <ArrowRight size={14} />
            </button>
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
    { i: <Compass size={20} />, l: "Лента", p: "/" },
    { i: <Plus size={20} />, l: "Создать", p: "/create" },
    { i: <User size={20} />, l: "Профиль", p: "/profile" },
    { i: <Settings size={20} />, l: "Админ", p: "/admin" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden safe-bottom">
      <div className="mx-3 mb-3 glass rounded-2xl border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {items.map(it => {
            const active = pathname === it.p;
            return <button key={it.p} onClick={() => nav(it.p)} className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${active ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text hover:bg-white/5"}`}>
              {it.i}
              <span className="text-[9px] font-semibold mt-0.5">{it.l}</span>
            </button>;
          })}
        </div>
      </div>
    </nav>
  );
}

function PostCard({ p, key }: { p: Post; key?: string }) {
  const nav = useNavigate();
  const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.request;
  const hasDiscount = p.originalPrice && p.discountPercent;

  return (
    <div onClick={() => nav(`/post/${p.id}`)} className="card cursor-pointer overflow-hidden relative group">
      {p.isBoosted && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-primary to-accent" />}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge ${cfg.bg} border ${cfg.border}`}>{cfg.icon} {cfg.label}</span>
          {p.urgency === "high" && <span className="badge badge-accent flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Срочно</span>}
          {hasDiscount && <span className="badge badge-primary">-{p.discountPercent}%</span>}
          {p.isBoosted && <span className="badge badge-warning"><TrendingUp size={10} />Вирусное</span>}
          {p.isVerified && <span className="badge badge-ghost"><CheckCheck size={10} />Проверен</span>}
        </div>
        <h3 className="font-display font-bold text-[15px] text-text mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">{p.title}</h3>
        <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin size={12} />
            {p.district}
          </div>
          <div className="font-display font-bold text-sm text-text">{p.price ? `${p.price.toLocaleString("ru")} ₽` : <span className="text-primary">Бесплатно</span>}</div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-[7px] font-black text-text">{p.authorName?.charAt(0)}</div>
            <span className="text-[11px] font-medium text-text-secondary">{p.authorName}</span>
            {p.isVerified && <CheckCheck size={12} className="text-primary" />}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400 fill-amber-400" /> {p.authorRating}</span>
            <span>{p.responsesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ active, onFilter }) {
  const filters = [
    { k: "all", l: "Все" },
    { k: "request", l: "Помощь" },
    { k: "deal", l: "Скидки" },
    { k: "event", l: "События" },
    { k: "urgent", l: "Срочно" },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map(x => {
        const isActive = active === x.k;
        return <button key={x.k} onClick={() => onFilter(x.k)} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive ? "bg-primary/10 text-primary border border-primary/20" : "glass text-text-secondary hover:text-text hover:bg-white/5"}`}>
          {x.l}
        </button>;
      })}
    </div>
  );
}

function HeroSection() {
  const nav = useNavigate();
  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center pt-20 pb-16">
      <div className="hero-ring hero-ring-1" />
      <div className="hero-ring hero-ring-2" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-semibold text-text-secondary mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          Новосибирск · {Math.floor(Math.random() * 2000 + 1000)} жителей онлайн
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display text-white mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Всё полезное <span className="gradient-text-mixed">рядом</span> с вами
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Помощь соседей, эксклюзивные скидки и события вашего района — всё в одном месте
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <button onClick={() => nav("/create")} className="btn-primary px-8 py-4 text-sm flex items-center gap-2">
            <span>✦ Создать объявление</span>
            <Sparkles size={16} />
          </button>
          <button onClick={() => nav("/")} className="btn-ghost px-8 py-4 text-sm flex items-center gap-2">
            <Compass size={16} />
            <span>Посмотреть ленту</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-14 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          {[
            { n: "15K+", l: "Объявлений" },
            { n: "98%", l: "Откликов за час" },
            { n: "50+", l: "Районов" },
          ].map((s, i) => (
            <div key={i} className="stat-card text-center animate-fade-in-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white">{s.n}</div>
              <div className="text-xs text-text-muted mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-16 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <span className="text-[10px] tracking-widest uppercase">Скролл</span>
            <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const [filter, setFilter] = useState("all");
  const urgent = posts.filter(p => p.urgency === "high").length;
  const deals = posts.filter(p => p.type === "deal").length;
  const events = posts.filter(p => p.type === "event").length;
  const reqs = posts.filter(p => p.type === "request").length;
  const filtered = filter === "all" ? posts : filter === "urgent" ? posts.filter(p => p.urgency === "high") : posts.filter(p => p.type === filter);
  const nav = useNavigate();

  if (isLoading) return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <HeroSection />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 w-16 mb-3" />
              <div className="skeleton h-5 w-full mb-2" />
              <div className="skeleton h-4 w-3/4 mb-4" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <MeshBackground />
      <Header />
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <HeroSection />
        <div className="glass-primary rounded-2xl p-5 mb-6 border border-primary/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xl text-bg shadow-lg shadow-primary/20 animate-float flex-shrink-0">
              <Sparkles size={22} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display font-bold text-lg text-white">Неделя скидок <span className="gradient-text-warm">соседей</span></h3>
              <p className="text-sm text-text-secondary mt-1">Каждую пятницу эксклюзивные предложения от местных бизнесов</p>
            </div>
            <button onClick={() => { setFilter("deal"); nav("/"); }} className="px-5 py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20 hover:bg-primary/20 transition-all">
              Смотреть
            </button>
          </div>
        </div>
        <div className="mb-5">
          <FilterBar active={filter} onFilter={setFilter} />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-text-muted" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Ничего не найдено</h3>
            <p className="text-text-secondary text-sm">Попробуйте другой фильтр</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="min-h-screen bg-bg">
      <MeshBackground />
      <Header />
      <main className="relative z-10 max-w-md mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-10 animate-scale-in">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-bg font-display font-black text-4xl shadow-[0_8px_40px_rgba(0,212,170,0.3)] animate-float">Р</div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 bg-bg animate-pulse-glow" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Добро пожаловать</h1>
          <p className="text-text-secondary text-base mt-2">Ваш город — ваши возможности</p>
        </div>
        <div className="card p-6 mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
            <button onClick={() => setTab("guest")} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${tab === "guest" ? "bg-primary/10 text-primary" : "text-text-muted"}`}>
              Просто зайти
            </button>
            <button onClick={() => setTab("sms")} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${tab === "sms" ? "bg-primary/10 text-primary" : "text-text-muted"}`}>
              По телефону
            </button>
          </div>
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Как вас зовут?" className="input-field" autoFocus />
            {tab === "sms" && <div className="flex gap-2">
              <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-text-secondary flex items-center">+7</span>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="900 123 45 67" className="input-field flex-1" />
            </div>}
            <button onClick={async () => { setSending(true); try { if (tab === "guest") { await loginAsGuest(name || "Гость"); } else { await login(phone, name || "Житель"); } nav("/"); } catch { setSending(false); } }} disabled={sending || (tab === "sms" && phone.length < 10)} className="w-full py-3.5 btn-primary text-sm flex items-center justify-center gap-2">
              {sending ? <Loader2 size={18} className="animate-spin" /> : tab === "guest" ? "Зайти и посмотреть" : "Войти"}
            </button>
          </div>
        </div>
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="font-display font-bold text-white mb-3 tracking-tight">Что внутри:</h3>
          <div className="space-y-3">
            {[
              { icon: <Zap size={18} />, t: "Мастера рядом — электрик, сантехник, грузчик за минуты", color: "text-primary", bg: "bg-primary/10" },
              { icon: <Gift size={18} />, t: "Скидки кафе и магазинов в вашем районе", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: <Activity size={18} />, t: "События — концерты, мастер-классы, ярмарки", color: "text-violet-400", bg: "bg-violet-500/10" },
              { icon: <Users size={18} />, t: "Помощь соседей — без посредников", color: "text-cyan-400", bg: "bg-cyan-500/10" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`feature-icon ${x.bg} ${x.color} flex-shrink-0`}>{x.icon}</div>
                <span className="text-[12px] text-text-secondary leading-relaxed pt-0.5">{x.t}</span>
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
      await fetch(`${API}/api/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: form.urgent ? "request" : "deal", title: form.title, category: form.category, description: form.description || form.title, district: form.district, approxAddress: `район ${form.district}`, price: form.price ? Number(form.price) : undefined, urgency: form.urgent ? "high" : "normal", coordinates: [82.9204, 55.0084], authorId: user.id, authorName: user.name, authorAvatar: user.avatar_url || "", authorRating: user.rating || 5, authorCompletedCount: user.completed_orders_count || 0, authorRole: user.role || "user", }) });
      invalidateQueries({ queryKey: ["posts"] }); setSuccess(true); setTimeout(() => nav("/"), 1500);
    } catch {} setLoading(false);
  };

  if (!user) return <div className="min-h-screen bg-bg"><MeshBackground /><Header /><main className="relative z-10 max-w-xl mx-auto px-4 py-8"><div className="card p-8 text-center"><p className="text-text-secondary mb-4">Войдите, чтобы создать публикацию</p><button onClick={() => nav("/login")} className="px-6 py-3 btn-primary text-sm">Войти</button></div></main></div>;
  if (success) return <div className="min-h-screen bg-bg"><MeshBackground /><Header /><main className="relative z-10 max-w-xl mx-auto px-4 py-8"><div className="card p-10 text-center animate-scale-in"><div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"><Check size={28} className="text-white" /></div><h2 className="text-2xl font-display font-bold text-white">Опубликовано!</h2><p className="text-text-secondary text-sm mt-1">Переходим на главную...</p></div></main></div>;

  return (
    <div className="min-h-screen bg-bg">
      <MeshBackground />
      <Header />
      <main className="relative z-10 max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
          <button onClick={() => nav(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-all"><ArrowLeft size={18} className="text-text-muted" /></button>
          <h2 className="text-xl font-display font-bold text-white">Новая публикация</h2>
        </div>
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Опишите задачу текстом</label>
              <textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Срочно нужен электрик, розетка на кухне, район Октябрьский, бюджет 2000" className="input-field h-24 resize-none" />
              <button onClick={parseAI} disabled={aiLoading || !rawText.trim()} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-lg hover:bg-violet-500/20 transition-all disabled:opacity-40">
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : "🤖"} Оформить с AI
              </button>
            </div>
            <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Заголовок *</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Нужен электрик — замена розетки" className="input-field" /></div>
            <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Категория</label><select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-field">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Описание</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Подробности задачи..." className="input-field h-16 resize-none" /></div>
            <div><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Район</label><select value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} className="input-field">{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Бюджет</label><input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="₽" type="number" className="input-field" /></div>
              <div className="flex items-end pb-0.5"><button onClick={() => setForm(f => ({...f, urgent: !f.urgent}))} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${form.urgent ? "bg-red-500/10 text-red-400 border border-red-500/20" : "glass text-text-muted hover:bg-white/5"}`}><Zap size={16} className="inline mr-1" />Срочно</button></div>
            </div>
            <button onClick={submit} disabled={loading || !form.title.trim()} className="w-full py-3.5 btn-primary text-sm flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Опубликовать"}
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
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

  if (isLoading) return <div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 size={32} className="text-primary animate-spin" /></div>;
  if (!post) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-center"><div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Search size={32} className="text-text-muted" /></div><h3 className="font-display font-bold text-xl text-white mb-3">Не найдено</h3><button onClick={() => nav("/")} className="px-5 py-2.5 btn-primary text-sm">На главную</button></div></div>;
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.request;

  return (
    <div className="min-h-screen bg-bg">
      <MeshBackground />
      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
          <ArrowLeft size={16} />Назад
        </button>
        <div className="card p-6 mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`badge ${cfg.bg} border ${cfg.border}`}>{cfg.icon} {cfg.label}</span>
            {post.urgency === "high" && <span className="badge badge-accent flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Срочно</span>}
            <span className="badge badge-ghost">{post.category}</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">{post.title}</h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{post.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {post.price !== undefined && post.price > 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-xl text-sm font-display font-bold text-white">💰 {post.price.toLocaleString("ru")} ₽</span>}
            {post.price === 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 rounded-xl text-sm font-display font-bold text-emerald-400">💰 Бесплатно</span>}
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-xl text-xs text-text-muted"><MapPin size={12} />{post.district}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-white text-sm font-display font-bold">{post.authorName?.charAt(0)}</div>
            <div><p className="text-xs font-semibold text-white">{post.authorName}</p><p className="text-[11px] text-text-muted">⭐ {post.authorRating} · {post.authorCompletedCount} выполнено · {post.authorRole}</p></div>
          </div>
        </div>
        <div className="card p-6 mb-4">
          <h3 className="font-display font-bold text-white mb-3 text-sm">Отклики ({responses.length})</h3>
          {!Array.isArray(responses) || responses.length === 0 ? <p className="text-text-muted text-sm">Пока нет откликов. Будьте первым!</p> :
<div className="space-y-3">{responses.map(r => <div key={r.id} className="bg-white/[0.03] rounded-xl p-4">
               <div className="flex items-center justify-between mb-1"><span className="font-semibold text-xs text-white">{r.userName}</span>{r.offerPrice && <span className="text-[11px] text-primary font-bold">{r.offerPrice.toLocaleString("ru")} ₽</span>}</div>
               <p className="text-xs text-text-secondary">{r.message}</p>
             </div>)}</div>
           }
         </div>
        {user ? <div className="card p-6">
          <h3 className="font-display font-bold text-white mb-3 text-sm">Откликнуться</h3>
          {sent ? <div className="text-center py-6"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20"><Check size={28} className="text-white" /></div><p className="text-sm font-bold text-emerald-400">Отправлено!</p></div> : <>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Расскажите, чем вы поможете..." className="input-field h-20 resize-none mb-3" />
            <button onClick={respond} disabled={!msg.trim()} className="w-full py-3.5 btn-primary text-sm">Отправить отклик</button>
          </>}
        </div> : <div className="card p-6 text-center">
          <p className="text-text-secondary text-sm mb-3">Войдите, чтобы откликнуться</p>
          <button onClick={() => nav("/login")} className="px-6 py-2.5 btn-primary text-sm">Войти</button>
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
    <div className="min-h-screen bg-bg">
      <MeshBackground />
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {user ? <>
          <div className="card p-6 mb-4 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-bg font-display font-black text-3xl shadow-lg shadow-primary/20">{user.name?.charAt(0) || "У"}</div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full border-2 bg-bg flex items-center justify-center"><Check size={14} className="text-bg" /></div>
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">{user.name}</h2>
                <p className="text-xs text-text-muted">⭐ {user.rating || 5} · {user.role === "admin" ? "Админ" : user.role === "business" ? "Бизнес" : user.role === "executor" ? "Исполнитель" : "Житель"} · {user.district_name || "Октябрьский"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { v: myPosts.length, l: "Объявл.", icon: <FileText size={16} /> },
                { v: user.completed_orders_count || 0, l: "Выполнено", icon: <CheckCheck size={16} /> },
                { v: `⭐${user.rating || 5}`, l: "Рейтинг", icon: <Star size={16} /> },
              ].map(s => <div key={s.l} className="text-center p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-primary/15 transition-all cursor-pointer">
                <div className="text-text-muted mb-1 flex justify-center">{s.icon}</div>
                <div className="text-xl font-display font-bold text-white">{s.v}</div>
                <div className="text-[10px] text-text-muted font-medium">{s.l}</div>
              </div>)}
            </div>
          </div>
          {myPosts.length > 0 && <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-white text-sm">Мои публикации</h3>
              <button onClick={() => nav("/create")} className="text-[11px] font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-1"><Plus size={12} />Новая</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{myPosts.map(p => <PostCard key={p.id} p={p} />)}</div>
          </div>}
          <div className="card p-4 space-y-2">
            <button onClick={() => nav("/create")} className="w-full py-3.5 btn-primary text-sm flex items-center justify-center gap-2"><span>➤ Новая публикация</span></button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => nav("/admin")} className="py-3 glass text-text-secondary font-semibold text-sm rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"><Settings size={16} />Админ</button>
              <button className="py-3 glass text-text-secondary font-semibold text-sm rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"><Bell size={16} />Уведомления</button>
            </div>
            <button onClick={async () => { await logout(); nav("/"); }} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">Выйти</button>
          </div>
        </> : <div className="card p-8 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4"><User size={32} className="text-text-muted" /></div>
          <p className="text-text-secondary mb-3">Войдите, чтобы видеть профиль</p>
          <button onClick={() => nav("/login")} className="px-6 py-2.5 btn-primary text-sm">Войти</button>
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

  const statItems = stats ? [
    { l: "Юзеры", v: stats.totalUsers, color: "#3b82f6", icon: <User size={16} /> },
    { l: "Посты", v: stats.totalPosts, color: "#00d4aa", icon: <FileText size={16} /> },
    { l: "Отклики", v: stats.totalResponses, color: "#00d4aa", icon: <MessageCircle size={16} /> },
    { l: "Бизнес", v: stats.totalBusinesses, color: "#f59e0b", icon: <Store size={16} /> },
    { l: "Жалобы", v: stats.totalReports, color: "#ff6b6b", icon: <Flag size={16} /> },
    { l: "События", v: stats.totalEvents, color: "#8b5cf6", icon: <Calendar size={16} /> },
  ] : [];

  return (
    <div className="min-h-screen bg-bg">
      <MeshBackground />
      <Header />
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-display font-bold text-white mb-6 tracking-tight flex items-center gap-2">🔧 Админ-панель</h2>
        {stats && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statItems.map(s => (
            <div key={s.l} className="card p-5 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="text-xl font-display font-bold text-white">{s.v}</div>
              <div className="text-[10px] text-text-muted font-medium">{s.l}</div>
            </div>
          ))}
        </div>}
        <div className="card overflow-hidden mb-4">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-sm">Публикации ({posts.length})</h3>
            <button onClick={() => nav("/create")} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all">+ Создать</button>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {posts.map(p => { const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.request; return <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${cfg.bg}`}>{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                <p className="text-[11px] text-text-muted">{p.district} · {p.category} · {timeAgo(p.createdAt)}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => toggleBoost(p.id)} className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${p.isBoosted ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-text-muted hover:bg-amber-500/10"}`}>{p.isBoosted ? "⚡" : "↑"}</button>
                <button onClick={() => nav(`/post/${p.id}`)} className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">→</button>
                <button onClick={() => deletePost(p.id)} className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">✕</button>
              </div>
            </div>;})}
          </div>
        </div>
        {Array.isArray(auditLogs) && auditLogs.length > 0 && <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/5"><h3 className="font-display font-bold text-white text-sm">Журнал ({auditLogs.length})</h3></div>
          <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">{auditLogs.map((l: any) => <div key={l.id} className="p-4 flex items-center gap-3 text-xs">
            <span className="text-text-muted w-14">{new Date(l.timestamp).toLocaleTimeString("ru")}</span>
            <span className="font-semibold text-white">{l.action}</span>
            <span className="text-text-muted">{l.user}</span>
          </div>)}</div>
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
