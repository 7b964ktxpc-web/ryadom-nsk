import React, { useState, useEffect, useRef } from "react";
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
  if (m < 60) return `${m}м`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ч`;
  return `${Math.floor(h / 24)}д`;
}

function HeroSection() {
  return (
    <section className="relative hero-gradient overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
      <div className="blob hero-blob-1" />
      <div className="blob hero-blob-2" />
      <div className="blob hero-blob-3" />
      <div className="dots-pattern absolute inset-0" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold text-slate-600 mb-6 slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Новосибирск · 1,247 активных жителей онлайн
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display text-slate-900 mb-4 slide-up" style={{ animationDelay: "0.2s" }}>
          Всё полезное <span className="gradient-text">рядом</span> с вами
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-8 slide-up" style={{ animationDelay: "0.3s" }}>
          Помощь соседей, эксклюзивные скидки и события вашего района — всё в одном месте
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 slide-up" style={{ animationDelay: "0.4s" }}>
          <a href="/create" className="btn-premium px-8 py-4 text-sm">
            <span>✨ Создать объявление</span>
          </a>
          <a href="/" className="btn-ghost px-8 py-4 text-sm">
            📋 Посмотреть ленту
          </a>
        </div>
        <div className="flex items-center justify-center gap-8 mt-12 slide-up" style={{ animationDelay: "0.5s" }}>
          {[
            { n: "15K+", l: "Активных объявлений" },
            { n: "98%", l: "Откликов за час" },
            { n: "50+", l: "Районов города" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 stat-number">{s.n}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-16 slide-up" style={{ animationDelay: "0.6s" }}>
          <div className="scroll-indicator" />
        </div>
      </div>
    </section>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => nav("/")}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-rose-200/60 group-hover:shadow-rose-300/80 group-hover:scale-105 transition-all duration-300">
              Н
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white pulse-ring" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-black text-xl text-slate-900 tracking-tight">РЯДОМ</span>
            <span className="ml-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">НСК</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => nav("/profile")} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass hover:bg-white/80 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-xs font-black shadow-sm">{user.name?.charAt(0) || "У"}</div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors hidden sm:inline">{user.name}</span>
              </button>
              <button onClick={async () => { await logout(); nav("/"); }} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Выйти" aria-label="Выйти">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          ) : (
            <button onClick={() => nav("/login")} className="px-5 py-2.5 btn-premium text-xs flex items-center gap-2">
              <span>Войти</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
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
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, l: "Лента", p: "/" },
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, l: "Создать", p: "/create" },
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, l: "Профиль", p: "/profile" },
    { i: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, l: "Админ", p: "/admin" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden safe-bottom">
      <div className="mx-3 mb-3 bg-white/85 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.1)] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {items.map(it => {
            const active = pathname === it.p;
            return <button key={it.p} onClick={() => nav(it.p)} className={`flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl transition-all duration-200 ${active ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-200/50 scale-105" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50/50"}`}>
              {it.i}
              <span className="text-[9px] font-bold mt-0.5">{it.l}</span>
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
    <div onClick={() => nav(`/post/${p.id}`)} className="premium-card card-lift cursor-pointer overflow-hidden group">
      {p.isBoosted && <div className="h-[3px] bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${cfg.bg}`}>{cfg.emoji} {cfg.label}</span>
          {p.urgency === "high" && <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-500 text-white animate-pulse">СРОЧНО</span>}
          {hasDiscount && <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500 text-white">-{p.discountPercent}%</span>}
          {p.isBoosted && <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">⚡ Вирусное</span>}
        </div>
        <h3 className="font-display font-bold text-[15px] text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors duration-200">{p.title}</h3>
        <p className="text-[12px] text-slate-400 line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {p.district}
          </div>
          <div className="font-display font-black text-base text-slate-900">{p.price ? `${p.price.toLocaleString("ru")} ₽` : <span className="text-emerald-600">Бесплатно</span>}</div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{p.authorName?.charAt(0)}</div>
            <span className="text-[11px] font-semibold text-slate-500">{p.authorName}</span>
            {p.isVerified && <span className="text-emerald-500 text-xs">✓</span>}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5">⭐ {p.authorRating}</span>
            <span>·</span>
            <span>{p.responsesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryFilter({ active, onFilter }) {
  const filters = [
    { k: "all", e: "📋", l: "Все" },
    { k: "request", e: "🆘", l: "Помощь" },
    { k: "deal", e: "🛍", l: "Скидки" },
    { k: "event", e: "🎉", l: "События" },
    { k: "urgent", e: "⚡", l: "Срочно" },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map(x => {
        const isActive = active === x.k;
        return <button key={x.k} onClick={() => onFilter(x.k)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-200/50 scale-105" : "glass text-slate-600 hover:bg-white/90 hover:shadow-md"}`}>
          <span>{x.e}</span> {x.l}
        </button>;
      })}
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
  const filtered = filter === "all" ? posts : filter === "urgent" ? posts.filter(p => p.urgency === "high") : posts.filter(p => p.type === filter);

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="premium-card p-5">
              <div className="skeleton h-5 w-20 mb-3" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <HeroSection />
        {/* Promo strip */}
        <div className="premium-card gradient-border p-4 sm:p-6 mb-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-amber-500/5 to-pink-500/5" />
          <div className="relative flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-rose-200/50 hero-float flex-shrink-0">🎁</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display font-bold text-lg text-slate-900">Неделя скидок<span className="gradient-text-warm"> соседей</span></h3>
              <p className="text-sm text-slate-500 mt-1">Каждую пятницу эксклюзивные предложения от местных бизнесов</p>
            </div>
            <button onClick={() => setFilter("deal")} className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-rose-300/60 hover:scale-105 active:scale-95 transition-all">
              Смотреть скидки
            </button>
          </div>
        </div>

        <div className="mb-5">
          <CategoryFilter active={filter} onFilter={setFilter} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 premium-card">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-2">Ничего не найдено</h3>
            <p className="text-slate-400 text-sm">Попробуйте другой фильтр или создайте первое объявление</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 rounded-3xl flex items-center justify-center text-white font-display font-black text-3xl shadow-2xl shadow-rose-200/40 hero-float">
              Н
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Добро пожаловать</h1>
          <p className="text-slate-400 text-base mt-2">Ваш город — ваши возможности</p>
        </div>

        <div className="premium-card p-6 mb-4">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button onClick={() => setTab("guest")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${tab === "guest" ? "bg-white text-slate-900 shadow-md" : "text-slate-500"}`}>
              Просто зайти
            </button>
            <button onClick={() => setTab("sms")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${tab === "sms" ? "bg-white text-slate-900 shadow-md" : "text-slate-500"}`}>
              По телефону
            </button>
          </div>
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Как вас зовут?" className="input-premium w-full" autoFocus />
            {tab === "sms" && <div className="flex gap-2">
              <span className="bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 flex items-center">+7</span>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="900 123 45 67" className="input-premium flex-1" />
            </div>}
            <button onClick={async () => { setSending(true); try { if (tab === "guest") { await loginAsGuest(name || "Гость"); } else { await login(phone, name || "Житель"); } nav("/"); } catch { setSending(false); } }} disabled={sending || (tab === "sms" && phone.length < 10)} className="w-full py-3.5 btn-premium text-sm">
              {sending ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Входим...</div> : tab === "guest" ? "Зайти и посмотреть" : "Войти"}
            </button>
          </div>
        </div>

        <div className="premium-card p-5">
          <h3 className="font-display font-bold text-slate-900 mb-3 tracking-tight">Что внутри:</h3>
          <div className="space-y-3">
            {[
              { e: "🆘", t: "Мастера рядом — электрик, сантехник, грузчик за минуты", c: "from-rose-500 to-pink-500" },
              { e: "🛍", t: "Скидки кафе и магазинов в вашем районе", c: "from-emerald-500 to-teal-500" },
              { e: "🎉", t: "События — концерты, мастер-классы, ярмарки", c: "from-violet-500 to-purple-500" },
              { e: "🤝", t: "Помощь соседей — без посредников", c: "from-cyan-500 to-blue-500" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${x.c} flex items-center justify-center text-sm flex-shrink-0 shadow-sm hero-float`} style={{ animationDelay: `${i * 1}s` }}>{x.e}</div>
                <span className="text-[12px] text-slate-600 leading-relaxed pt-1">{x.t}</span>
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

  if (!user) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20"><Header /><main className="max-w-xl mx-auto px-4 py-8"><div className="premium-card p-8 text-center"><p className="text-slate-500 mb-4">Войдите, чтобы создать публикацию</p><button onClick={() => nav("/login")} className="px-6 py-3 btn-premium text-sm">Войти</button></div></main></div>;
  if (success) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20"><Header /><main className="max-w-xl mx-auto px-4 py-8"><div className="premium-card p-10 text-center"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div><h2 className="text-2xl font-display font-black text-slate-900">Опубликовано!</h2><p className="text-slate-400 text-sm mt-1">Переходим на главную...</p></div></main></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => nav(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-all"><svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <h2 className="text-xl font-display font-black text-slate-900">Новая публикация</h2>
        </div>
        <div className="premium-card p-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Опишите задачу текстом</label>
              <textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Срочно нужен электрик, розетка на кухне, район Октябрьский, бюджет 2000" className="input-premium w-full h-20 resize-none" />
              <button onClick={parseAI} disabled={aiLoading || !rawText.trim()} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-[11px] rounded-lg hover:shadow-md disabled:opacity-40 transition-all">
                {aiLoading ? <><div className="w-3 h-3 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" /> AI оформляет...</> : <>🤖 Оформить с AI</>}
              </button>
            </div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Заголовок *</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Нужен электрик — замена розетки" className="input-premium w-full" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Категория</label><select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-premium w-full">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Описание</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Подробности задачи..." className="input-premium w-full h-16 resize-none" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Район</label><select value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} className="input-premium w-full">{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Бюджет</label><input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="₽" type="number" className="input-premium w-full" /></div>
              <div className="flex items-end pb-0.5"><button onClick={() => setForm(f => ({...f, urgent: !f.urgent}))} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${form.urgent ? "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-200/50" : "glass text-slate-500 hover:bg-rose-50"}`}>⚡ Срочно</button></div>
            </div>
            <button onClick={submit} disabled={loading || !form.title.trim()} className="w-full py-3.5 btn-premium text-sm">
              {loading ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Публикация...</div> : "Опубликовать"}
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

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-3">😢</div><p className="font-bold text-slate-600">Не найдено</p><button onClick={() => nav("/")} className="mt-3 px-5 py-2.5 btn-premium text-sm">На главную</button></div></div>;
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.request;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Назад
        </button>
        <div className="premium-card p-6 mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${cfg.bg}`}>{cfg.emoji} {cfg.label}</span>
            {post.urgency === "high" && <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-500 text-white animate-pulse">СРОЧНО</span>}
            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{post.category}</span>
          </div>
          <h1 className="text-2xl font-display font-black text-slate-900 mb-3 tracking-tight">{post.title}</h1>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{post.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {post.price !== undefined && post.price > 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl text-sm font-display font-black text-slate-900">💰 {post.price.toLocaleString("ru")} ₽</span>}
            {post.price === 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-xl text-sm font-display font-black text-emerald-700">💰 Бесплатно</span>}
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-500">📍 {post.district}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-500">👁 {post.viewsCount}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-sm font-display font-bold shadow-sm">{post.authorName?.charAt(0)}</div>
            <div><p className="text-xs font-bold text-slate-900">{post.authorName}</p><p className="text-[11px] text-slate-400">⭐ {post.authorRating} · {post.authorCompletedCount} выполнено · {post.authorRole}</p></div>
          </div>
        </div>
        <div className="premium-card p-6 mb-4">
          <h3 className="font-display font-bold text-slate-900 mb-3 text-sm">Отклики ({responses.length})</h3>
          {!Array.isArray(responses) || responses.length === 0 ? <p className="text-slate-400 text-sm">Пока нет откликов. Будьте первым!</p> :
            <div className="space-y-3">{responses.map(r => <div key={r.id} className="bg-slate-50/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1"><span className="font-bold text-xs text-slate-900">{r.userName}</span>{r.offerPrice && <span className="text-[11px] text-rose-600 font-bold">{r.offerPrice.toLocaleString("ru")} ₽</span>}</div>
              <p className="text-[12px] text-slate-500">{r.message}</p>
            </div>)}</div>
          }
        </div>
        {user ? <div className="premium-card p-6">
          <h3 className="font-display font-bold text-slate-900 mb-3 text-sm">Откликнуться</h3>
          {sent ? <div className="text-center py-6"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200/50"><svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div><p className="text-sm font-bold text-emerald-600">Отправлено!</p></div> : <>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Расскажите, чем вы поможете..." className="input-premium w-full h-20 resize-none mb-3" />
            <button onClick={respond} disabled={!msg.trim()} className="w-full py-3.5 btn-premium text-sm">Отправить отклик</button>
          </>}
        </div> : <div className="premium-card p-6 text-center">
          <p className="text-slate-500 text-sm mb-3">Войдите, чтобы откликнуться</p>
          <button onClick={() => nav("/login")} className="px-6 py-2.5 btn-premium text-sm">Войти</button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {user ? <>
          <div className="premium-card p-6 mb-4 gradient-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white font-display font-black text-3xl shadow-xl shadow-rose-200/40">{user.name?.charAt(0) || "У"}</div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">✓</div>
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">{user.name}</h2>
                <p className="text-xs text-slate-400">⭐ {user.rating || 5} · {user.role === "admin" ? "Админ" : user.role === "business" ? "Бизнес" : user.role === "executor" ? "Исполнитель" : "Житель"} · {user.district_name || "Октябрьский"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { v: myPosts.length, l: "Объявл.", c: "from-rose-500 to-pink-500", icon: "📋" },
                { v: user.completed_orders_count || 0, l: "Выполнено", c: "from-emerald-500 to-teal-500", icon: "✅" },
                { v: `⭐${user.rating || 5}`, l: "Рейтинг", c: "from-amber-500 to-orange-500", icon: "🌟" },
              ].map(s => <div key={s.l} className="text-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 card-lift">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-xl font-display font-black text-slate-900 stat-number">{s.v}</div>
                <div className="text-[10px] text-slate-400 font-medium">{s.l}</div>
              </div>)}
            </div>
          </div>
          {myPosts.length > 0 && <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-slate-900 text-sm">Мои публикации</h3>
              <button onClick={() => nav("/create")} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors">+ Новая</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{myPosts.map(p => <PostCard key={p.id} p={p} />)}</div>
          </div>}
          <div className="premium-card p-4 space-y-2">
            <button onClick={() => nav("/create")} className="w-full py-3.5 btn-premium text-sm"><span>➕ Новая публикация</span></button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => nav("/admin")} className="py-3 glass text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all">🔧 Админ-панель</button>
              <button onClick={() => nav("/profile")} className="py-3 glass text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all">⚙️ Настройки</button>
            </div>
            <button onClick={async () => { await logout(); nav("/"); }} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl text-sm transition-all">Выйти</button>
          </div>
        </> : <div className="premium-card p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center text-white font-display font-black text-3xl mx-auto mb-4 shadow-lg">?</div>
          <p className="text-slate-500 mb-3">Войдите, чтобы видеть профиль</p>
          <button onClick={() => nav("/login")} className="px-6 py-2.5 btn-premium text-sm">Войти</button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-display font-black text-slate-900 mb-6 tracking-tight">🔧 Админ-панель</h2>
        {stats && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { l: "Юзеры", v: stats.totalUsers, c: "from-blue-500 to-indigo-500", icon: "👤" },
            { l: "Посты", v: stats.totalPosts, c: "from-rose-500 to-pink-500", icon: "📝" },
            { l: "Отклики", v: stats.totalResponses, c: "from-emerald-500 to-teal-500", icon: "💬" },
            { l: "Бизнес", v: stats.totalBusinesses, c: "from-amber-500 to-orange-500", icon: "🏢" },
            { l: "Жалобы", v: stats.totalReports, c: "from-red-500 to-rose-500", icon: "🚨" },
            { l: "События", v: stats.totalEvents, c: "from-violet-500 to-purple-500", icon: "🎉" },
          ].map(s => <div key={s.l} className="premium-card p-5 text-center card-lift">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} flex items-center justify-center text-white text-sm font-bold mb-2 shadow-sm">{s.icon}</div>
            <div className="text-xl font-display font-black text-slate-900 stat-number">{s.v}</div>
            <div className="text-[10px] text-slate-400 font-medium">{s.l}</div>
          </div>)}
        </div>}
        <div className="premium-card overflow-hidden mb-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900 text-sm">Публикации ({posts.length})</h3>
            <button onClick={() => nav("/create")} className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-bold rounded-lg shadow-sm">+ Создать</button>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {posts.map(p => { const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.request; return <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-sm flex-shrink-0 shadow-sm`}>{cfg.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                <p className="text-[11px] text-slate-400">{p.district} · {p.category} · {timeAgo(p.createdAt)}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => toggleBoost(p.id)} className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${p.isBoosted ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-amber-50"}`}>{p.isBoosted ? "⚡" : "↑"}</button>
                <button onClick={() => nav(`/post/${p.id}`)} className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">→</button>
                <button onClick={() => deletePost(p.id)} className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">✕</button>
              </div>
            </div>;})}
          </div>
        </div>
        {Array.isArray(auditLogs) && auditLogs.length > 0 && <div className="premium-card overflow-hidden">
          <div className="p-5 border-b border-slate-100"><h3 className="font-display font-bold text-slate-900 text-sm">Журнал ({auditLogs.length})</h3></div>
          <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">{auditLogs.map((l: any) => <div key={l.id} className="p-4 flex items-center gap-3 text-xs">
            <span className="text-slate-400 w-14">{new Date(l.timestamp).toLocaleTimeString("ru")}</span>
            <span className="font-bold text-slate-700">{l.action}</span>
            <span className="text-slate-500">{l.user}</span>
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
