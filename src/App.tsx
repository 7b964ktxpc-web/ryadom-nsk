import React, { useState } from "react";
import { createBrowserRouter, RouterProvider, useNavigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConsentProvider } from "./contexts/ConsentContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CookieConsent } from "./components/CookieConsent";
import { OnboardingModal } from "./components/OnboardingModal";

const API = "";
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } });

interface Post { id: string; type: string; title: string; description: string; category: string; district: string; approxAddress: string; price?: number; originalPrice?: number; discountPercent?: number; date?: string; time?: string; urgency: string; status: string; isBoosted: boolean; isPro: boolean; isVerified: boolean; viewsCount: number; responsesCount: number; createdAt: string; authorId: string; authorName: string; authorAvatar: string; authorRating: number; authorCompletedCount: number; authorRole: string; businessName?: string; }
interface Resp { id: string; postId: string; userId: string; userName: string; userAvatar: string; userRating: number; userCompletedCount: number; message: string; offerPrice?: number; phone?: string; createdAt: string; status: string; }
interface User { id: string; name: string; phone: string; role: string; rating: number; district_name: string; completed_orders_count: number; responses_count: number; }

const fetcher = (url: string) => fetch(`${API}${url}`).then(r => r.json());

function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => nav("/")}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-lg">НСК</div>
        <div><span className="font-extrabold text-lg text-slate-900">РЯДОМ</span><span className="bg-rose-50 text-rose-600 text-[11px] font-bold px-1.5 py-0.5 rounded-md border border-rose-100">НСК</span></div>
      </div>
      <div className="flex items-center gap-2">
        {user ? <>
          <span className="text-sm font-bold text-slate-700 hidden sm:block">{user.name}</span>
          <button onClick={() => nav("/profile")} className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">{user.name?.charAt(0) || "У"}</button>
          <button onClick={async () => { await logout(); nav("/"); }} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200">Выход</button>
        </> : <button onClick={() => nav("/login")} className="px-4 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl">Войти</button>}
      </div>
    </div>
  </header>;
}

function BottomNav() {
  const nav = useNavigate();
  return <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 sm:hidden py-1 px-3 shadow-lg">
    <div className="flex items-center justify-around">
      {[{ i: "🏠", l: "Лента", p: "/" }, { i: "➕", l: "Создать", p: "/create" }, { i: "👤", l: "Профиль", p: "/profile" }, { i: "🔧", l: "Админ", p: "/admin" }].map(it => (
        <button key={it.p} onClick={() => nav(it.p)} className="flex flex-col items-center gap-1 py-1 px-3 text-slate-500 hover:text-rose-500">
          <span className="text-lg">{it.i}</span><span className="text-[10px]">{it.l}</span>
        </button>
      ))}
    </div>
  </nav>;
}

const TYPE_EMOJI: Record<string, string> = { request: "🆘", deal: "🛍", event: "🎉", offer: "💼", alert: "⚡", neighbor: "🤝" };

function PostCard({ p }: { p: Post; key?: string }) {
  const nav = useNavigate();
  return <div onClick={() => nav(`/post/${p.id}`)} className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
    <div className="flex items-center gap-2 mb-2">
      {p.urgency === "high" && <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700">СРОЧНО</span>}
      <span className="text-sm">{TYPE_EMOJI[p.type] || "📌"}</span>
      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.category}</span>
      {p.isBoosted && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PRO</span>}
    </div>
    <h3 className="font-extrabold text-sm text-slate-900 mb-1 line-clamp-2">{p.title}</h3>
    <p className="text-xs text-slate-400 line-clamp-1 mb-2">{p.description}</p>
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">📍 {p.district}</span>
      <span className="font-bold text-slate-700">{p.price ? `${p.price.toLocaleString("ru")} ₽` : "Бесплатно"}</span>
    </div>
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
      <span className="font-semibold">{p.authorName}</span>
      <span>⭐{p.authorRating}</span>
      <span>{p.responsesCount} откл.</span>
    </div>
  </div>;
}

function HomePage() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const [filter, setFilter] = useState("all");
  const f = [
    { k: "all", e: "📋", l: "Все", c: posts.length },
    { k: "request", e: "🆘", l: "Помощь", c: posts.filter(p => p.type === "request").length },
    { k: "deal", e: "🛍", l: "Скидки", c: posts.filter(p => p.type === "deal").length },
    { k: "event", e: "🎉", l: "События", c: posts.filter(p => p.type === "event").length },
    { k: "urgent", e: "⚡", l: "Срочно", c: posts.filter(p => p.urgency === "high").length },
  ];
  const filtered = filter === "all" ? posts : filter === "urgent" ? posts.filter(p => p.urgency === "high") : posts.filter(p => p.type === filter);

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-black text-slate-900">РЯДОМ НСК</h1>
        <p className="text-slate-500 text-sm mt-1">Помощь соседей, скидки и события в вашем районе</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {f.map(x => <button key={x.k} onClick={() => setFilter(x.k)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${filter === x.k ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "bg-white text-slate-600 border border-slate-200"}`}>
          {x.e} {x.l} <span className={`text-[10px] px-1 py-0.5 rounded-full ${filter === x.k ? "bg-white/20" : "bg-slate-100"}`}>{x.c}</span>
        </button>)}
      </div>
      {isLoading ? <div className="text-center py-12"><div className="w-8 h-8 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-slate-400 text-sm">Загрузка...</p></div> :
        filtered.length === 0 ? <div className="text-center py-12 bg-white rounded-3xl border border-slate-200"><p className="text-4xl mb-2">🏘</p><p className="text-slate-600 font-bold text-sm">Пока пусто</p></div> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{filtered.map(p => <PostCard key={p.id} p={p} />)}</div>}
    </main>
    <BottomNav />
    <CookieConsent />
  </div>;
}

function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tab, setTab] = useState<"guest" | "sms">("guest");
  const [sending, setSending] = useState(false);

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-amber-500 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg">НСК</div>
        <h1 className="text-2xl font-black text-slate-900">РЯДОМ НСК</h1>
        <p className="text-slate-500 text-sm mt-1">Городской сервис Новосибирска</p>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-5 mb-4">
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab("guest")} className={`flex-1 py-2 rounded-xl text-sm font-bold ${tab === "guest" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}>Просто зайти</button>
          <button onClick={() => setTab("sms")} className={`flex-1 py-2 rounded-xl text-sm font-bold ${tab === "sms" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}>По телефону</button>
        </div>
        {tab === "guest" ? <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" autoFocus />
          <button onClick={async () => { setSending(true); try { await loginAsGuest(name || "Гость"); nav("/"); } catch { setSending(false); } }} disabled={sending} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40">
            {sending ? "Входим..." : "Зайти и посмотреть"}
          </button>
        </div> : <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <div className="flex gap-2">
            <span className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-600">+7</span>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9001234567" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <button onClick={async () => { setSending(true); try { await login(phone, name || "Житель"); nav("/"); } catch { setSending(false); } }} disabled={sending || phone.length < 10} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40">
            {sending ? "..." : "Войти"}
          </button>
        </div>}
      </div>
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm mb-2">Что можно делать:</h3>
        {[{ e: "🆘", t: "Искать помощников — электриков, сантехников, грузчиков" }, { e: "🛍", t: "Находить скидки у кафе и магазинов рядом" }, { e: "🎉", t: "Узнавать о событиях в вашем районе" }, { e: "📢", t: "Размещать объявления бесплатно" }].map((x, i) => <div key={i} className="flex items-start gap-2 mb-1.5"><span>{x.e}</span><span className="text-xs text-slate-600">{x.t}</span></div>)}
      </div>
    </main>
  </div>;
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
      invalidateQueries({ queryKey: ["posts"] });
      setSuccess(true);
      setTimeout(() => nav("/"), 1500);
    } catch {}
    setLoading(false);
  };

  if (!user) return <div className="min-h-screen bg-slate-100/60"><Header /><main className="max-w-xl mx-auto px-4 py-8"><div className="bg-white rounded-3xl shadow-xl p-6 text-center"><p className="text-slate-500 mb-4">Войдите, чтобы создать публикацию</p><button onClick={() => nav("/login")} className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl">Войти</button></div></main></div>;

  if (success) return <div className="min-h-screen bg-slate-100/60"><Header /><main className="max-w-xl mx-auto px-4 py-8"><div className="bg-white rounded-3xl shadow-xl p-8 text-center"><p className="text-5xl mb-3">✅</p><p className="text-lg font-black text-slate-900">Опубликовано!</p><p className="text-sm text-slate-500 mt-1">Переходим на главную...</p></div></main></div>;

  return <div className="min-h-screen bg-slate-100/60"><Header /><main className="max-w-xl mx-auto px-4 py-6">
    <div className="bg-white rounded-3xl shadow-xl p-5">
      <h2 className="text-lg font-black text-slate-900 mb-4">Новая публикация</h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Опишите задачу — AI оформит</label>
          <textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Срочно нужен электрик, заменить розетку, район Октябрьский, бюджет 2000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 resize-none" />
          <button onClick={parseAI} disabled={aiLoading || !rawText.trim()} className="mt-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 font-bold text-xs rounded-lg hover:bg-purple-200 disabled:opacity-40">
            {aiLoading ? "⏳ AI..." : "🤖 Оформить с AI"}
          </button>
        </div>
        <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Заголовок *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
        <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
          {["Электрик","Ремонт","Перевозка","Уборка","Сборка мебели","Компьютер","Сантехник","Животные","Авто","Другое"].map(c => <option key={c}>{c}</option>)}
        </select>
        <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Подробное описание" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-16 resize-none" />
        <select value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
          {["Октябрьский","Центральный","Железнодорожный","Заельцовский","Ленинский","Кировский","Калининский","Дзержинский","Первомайский","Советский"].map(d => <option key={d}>{d}</option>)}
        </select>
        <div className="flex gap-2">
          <input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="Бюджет ₽" type="number" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <button onClick={() => setForm(f => ({...f, urgent: !f.urgent}))} className={`px-4 py-3 rounded-xl text-sm font-bold ${form.urgent ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"}`}>⚡ Срочно</button>
        </div>
        <button onClick={submit} disabled={loading || !form.title.trim()} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40">
          {loading ? "Публикация..." : "Опубликовать"}
        </button>
      </div>
    </div>
  </main><BottomNav /></div>;
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
    setMsg(""); setSent(true); invalidateQueries({ queryKey: ["responses", id] });
    setTimeout(() => setSent(false), 2000);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-100/60 flex items-center justify-center"><div className="w-8 h-8 border-4 border-rose-300 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-screen bg-slate-100/60 flex items-center justify-center"><div className="text-center"><p className="text-4xl mb-2">😢</p><p className="font-bold text-slate-600">Не найдено</p><button onClick={() => nav("/")} className="mt-3 px-4 py-2 bg-rose-500 text-white font-bold rounded-xl text-sm">На главную</button></div></div>;

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => nav(-1)} className="mb-3 text-sm text-slate-500 hover:text-rose-500 font-bold">← Назад</button>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {post.urgency === "high" && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700">СРОЧНО</span>}
          <span className="text-sm">{TYPE_EMOJI[post.type]}</span>
          <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">{post.category}</span>
          <span className="text-xs text-slate-400">📍 {post.district}</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">{post.title}</h1>
        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{post.description}</p>
        <div className="flex items-center gap-3 text-sm font-bold text-slate-700 flex-wrap">
          {post.price !== undefined && post.price > 0 && <span>💰 {post.price.toLocaleString("ru")} ₽</span>}
          {post.price === 0 && post.type === "deal" && <span className="text-green-600">💰 Бесплатно</span>}
          <span>👁 {post.viewsCount}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold">{post.authorName?.charAt(0) || "?"}</div>
          <div><p className="text-xs font-bold text-slate-900">{post.authorName}</p><p className="text-[10px] text-slate-400">⭐ {post.authorRating} · {post.authorCompletedCount} выполнено</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
        <h3 className="font-bold text-slate-900 mb-3">Отклики ({Array.isArray(responses) ? responses.length : 0})</h3>
        {!Array.isArray(responses) || responses.length === 0 ? <p className="text-slate-400 text-xs">Пока нет откликов</p> :
          responses.map(r => <div key={r.id} className="bg-slate-50 rounded-xl p-3 mb-2">
            <div className="flex items-center justify-between mb-1"><span className="font-bold text-sm text-slate-900">{r.userName}</span>{r.offerPrice && <span className="text-xs text-rose-600 font-bold">{r.offerPrice.toLocaleString("ru")} ₽</span>}</div>
            <div className="text-[10px] text-slate-400 mb-1">⭐ {r.userRating} · {r.userCompletedCount} выполнено</div>
            <p className="text-xs text-slate-600">{r.message}</p>
          </div>)}
      </div>

      {user ? <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="font-bold text-slate-900 mb-3">Откликнуться</h3>
        {sent ? <div className="text-center py-4"><p className="text-2xl mb-1">✅</p><p className="text-sm font-bold text-green-600">Отклик отправлен!</p></div> : <>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Расскажите, почему вы поможете..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 resize-none mb-3" />
          <button onClick={respond} disabled={!msg.trim()} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40 text-sm">Отправить отклик</button>
        </>}
      </div> : <div className="bg-white rounded-2xl shadow-md p-5 text-center">
        <p className="text-slate-500 text-sm mb-2">Войдите, чтобы откликнуться</p>
        <button onClick={() => nav("/login")} className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl text-sm">Войти</button>
      </div>}
    </main>
    <BottomNav />
  </div>;
}

function ProfilePage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const myPosts = user ? posts.filter(p => p.authorId === user.id) : [];

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-4xl mx-auto px-4 py-6">
      {user ? <>
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl">{user.name?.charAt(0) || "У"}</div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
              <p className="text-xs text-slate-500">⭐ {user.rating || 5} · {user.role === "admin" ? "Админ" : user.role === "business" ? "Бизнес" : user.role === "executor" ? "Исполнитель" : "Житель"} · {user.district_name || "Октябрьский"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 bg-slate-50 rounded-xl"><div className="text-lg font-black">{myPosts.length}</div><div className="text-[10px] text-slate-500">Моих объявлений</div></div>
            <div className="text-center p-2 bg-slate-50 rounded-xl"><div className="text-lg font-black">{user.completed_orders_count || 0}</div><div className="text-[10px] text-slate-500">Выполнено</div></div>
            <div className="text-center p-2 bg-slate-50 rounded-xl"><div className="text-lg font-black">⭐ {user.rating || 5}</div><div className="text-[10px] text-slate-500">Рейтинг</div></div>
          </div>
        </div>

        {myPosts.length > 0 && <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Мои публикации</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{myPosts.map(p => <PostCard key={p.id} p={p} />)}</div>
        </div>}

        <div className="bg-white rounded-2xl shadow-md p-5 space-y-2">
          <button onClick={() => nav("/create")} className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-sm">➕ Новая публикация</button>
          <button onClick={() => nav("/admin")} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">🔧 Админ-панель</button>
          <button onClick={async () => { await logout(); nav("/"); }} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm">Выйти</button>
        </div>
      </> : <div className="bg-white rounded-2xl shadow-md p-6 text-center">
        <p className="text-slate-500 mb-3">Войдите, чтобы видеть профиль</p>
        <button onClick={() => nav("/login")} className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl">Войти</button>
      </div>}
    </main>
    <BottomNav />
  </div>;
}

function AdminPage() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetcher("/api/admin/stats") });
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: () => fetcher("/api/admin/reports") });
  const { data: auditLogs = [] } = useQuery({ queryKey: ["audit"], queryFn: () => fetcher("/api/admin/audit") });
  const { data: posts = [] } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetcher("/api/posts") });
  const nav = useNavigate();
  const { invalidateQueries } = useQueryClient();

  const toggleBoost = async (id: string) => {
    await fetch(`${API}/api/posts/${id}/boost`, { method: "POST" });
    invalidateQueries({ queryKey: ["posts"] });
    invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const deletePost = async (id: string) => {
    if (!confirm("Удалить публикацию?")) return;
    await fetch(`${API}/api/posts/${id}`, { method: "DELETE" });
    invalidateQueries({ queryKey: ["posts"] });
    invalidateQueries({ queryKey: ["admin-stats"] });
  };

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-black text-slate-900 mb-4">🔧 Админ-панель</h2>
      {stats && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[["Пользователи", stats.totalUsers], ["Публикации", stats.totalPosts], ["Отклики", stats.totalResponses], ["Бизнесы", stats.totalBusinesses], ["Жалобы", stats.totalReports], ["События", stats.totalEvents]].map(([l, v]) => <div key={l} className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-500 mb-0.5">{l}</div><div className="text-lg font-black text-slate-900">{v}</div></div>)}
      </div>}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Все публикации ({posts.length})</h3>
          <button onClick={() => nav("/create")} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg">➕ Новая</button>
        </div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {posts.map(p => <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-slate-50">
            <span className="text-lg">{TYPE_EMOJI[p.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
              <p className="text-[10px] text-slate-400">{p.district} · {p.category} · {p.authorName}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggleBoost(p.id)} className={`px-2 py-1 text-[10px] font-bold rounded ${p.isBoosted ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{p.isBoosted ? "⚡ PRO" : "Boost"}</button>
              <button onClick={() => nav(`/post/${p.id}`)} className="px-2 py-1 text-[10px] font-bold rounded bg-blue-50 text-blue-600">Смотреть</button>
              <button onClick={() => deletePost(p.id)} className="px-2 py-1 text-[10px] font-bold rounded bg-red-50 text-red-600">Удалить</button>
            </div>
          </div>)}
        </div>
      </div>

      {Array.isArray(reports) && reports.length > 0 && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-sm">Жалобы ({reports.length})</h3></div>
        <div className="divide-y divide-slate-100">{reports.map((r: any) => <div key={r.id} className="p-3 flex items-center gap-3"><span className="text-xs text-slate-400 w-16">{r.id.slice(0,6)}</span><span className="text-xs text-slate-600 flex-1">{r.reason}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.status === "open" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{r.status}</span></div>)}</div>
      </div>}

      {Array.isArray(auditLogs) && auditLogs.length > 0 && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-sm">Журнал ({auditLogs.length})</h3></div>
        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">{auditLogs.map((l: any) => <div key={l.id} className="p-3 flex items-center gap-3 text-xs"><span className="text-slate-400">{new Date(l.timestamp).toLocaleTimeString("ru")}</span><span className="font-bold text-slate-700">{l.action}</span><span className="text-slate-500">{l.user}</span></div>)}</div>
      </div>}
    </main>
    <BottomNav />
  </div>;
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
