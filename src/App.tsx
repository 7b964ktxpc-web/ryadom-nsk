import React, { useState } from "react";
import { createBrowserRouter, RouterProvider, useNavigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConsentProvider } from "./contexts/ConsentContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CookieConsent } from "./components/CookieConsent";
import { OnboardingModal } from "./components/OnboardingModal";

const API = "";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } });

interface Post {
  id: string; type: string; title: string; description: string; category: string;
  district: string; approxAddress: string; price?: number; originalPrice?: number;
  discountPercent?: number; date?: string; time?: string; urgency: "high" | "normal";
  status: string; isBoosted: boolean; isPro: boolean; isVerified: boolean;
  viewsCount: number; responsesCount: number; createdAt: string; authorId: string;
  authorName: string; authorAvatar: string; authorRating: number;
  authorCompletedCount: number; authorRole: string; businessName?: string; businessLogo?: string;
}

interface Resp {
  id: string; postId: string; userId: string; userName: string; userAvatar: string;
  userRating: number; userCompletedCount: number; message: string; offerPrice?: number;
  phone?: string; createdAt: string; status: string;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-lg">НСК</div>
        <div><span className="font-extrabold text-lg text-slate-900">РЯДОМ</span><span className="bg-rose-50 text-rose-600 text-[11px] font-bold px-1.5 py-0.5 rounded-md border border-rose-100">НСК</span></div>
      </div>
      <div className="flex items-center gap-3">
        {user ? <span className="text-sm font-bold text-slate-700">{user.name}</span> : <button onClick={() => navigate("/login")} className="px-4 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl">Войти</button>}
        {user && <button onClick={async () => { await logout(); navigate("/"); }} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200">Выход</button>}
      </div>
    </div>
  </header>;
}

function BottomNav() {
  const navigate = useNavigate();
  const items = [
    { icon: "🏠", label: "Лента", path: "/" },
    { icon: "➕", label: "Создать", path: "/create" },
    { icon: "👤", label: "Профиль", path: "/profile" },
    { icon: "🔧", label: "Админ", path: "/admin" },
  ];
  return <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 sm:hidden py-1 px-3 shadow-lg">
    <div className="flex items-center justify-around">
      {items.map((it) => (
        <button key={it.path} onClick={() => navigate(it.path)} className="flex flex-col items-center gap-1 py-1 px-3 text-slate-500 hover:text-rose-500">
          <span className="text-lg">{it.icon}</span>
          <span className="text-[10px]">{it.label}</span>
        </button>
      ))}
    </div>
  </nav>;
}

interface PostCardProps { p: Post; onClick?: () => void; key?: string; }
function PostCard({ p, onClick }: PostCardProps) {
  const navigate = useNavigate();
  const typeEmoji: Record<string, string> = { request: "🆘", deal: "🛍", event: "🎉", offer: "💼", alert: "⚡", neighbor: "🤝" };
  return <div onClick={() => navigate(`/post/${p.id}`)} className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
    <div className="flex items-center gap-2 mb-3">
      {p.urgency === "high" && <span className="text-xs font-black px-2 py-0.5 rounded-md bg-red-100 text-red-700">СРОЧНО</span>}
      <span className="text-sm font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">{typeEmoji[p.type] || "📌"}</span>
      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{p.category}</span>
      {p.isBoosted && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">⚡ PRO</span>}
    </div>
    <h3 className="font-extrabold text-base text-slate-900 mb-1 line-clamp-2">{p.title}</h3>
    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{p.description}</p>
    <div className="flex items-center justify-between text-xs text-slate-400">
      <span>📍 {p.district}{p.approxAddress ? ` · ${p.approxAddress}` : ""}</span>
      <span className="font-bold text-slate-700">{p.price ? `${p.price.toLocaleString("ru")} ₽` : "Бесплатно"}</span>
    </div>
    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
      <span>{p.authorName || "Аноним"}</span>
      <span>·</span>
      <span>⭐ {p.authorRating || 5}</span>
      <span>·</span>
      <span>{p.viewsCount} просм.</span>
    </div>
  </div>;
}

function HomePage() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({ queryKey: ["posts"], queryFn: () => fetch(`${API}/api/posts`).then(r => r.json()) });
  const [filter, setFilter] = useState<string>("all");

  const deals = posts.filter(p => p.type === "deal");
  const requests = posts.filter(p => p.type === "request");
  const events = posts.filter(p => p.type === "event");
  const urgent = posts.filter(p => p.urgency === "high");

  const filters = [
    { key: "all", label: "Все", emoji: "📋", count: posts.length },
    { key: "request", label: "Нужна помощь", emoji: "🆘", count: requests.length },
    { key: "deal", label: "Скидки", emoji: "🛍", count: deals.length },
    { key: "event", label: "События", emoji: "🎉", count: events.length },
    { key: "urgent", label: "Срочно", emoji: "⚡", count: urgent.length },
  ];

  const filtered = filter === "all" ? posts : filter === "urgent" ? urgent : posts.filter(p => p.type === filter);

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-slate-900">РЯДОМ НСК</h1>
        <p className="text-slate-500 mt-2">Всё полезное в шаговой доступности</p>
        <p className="text-xs text-slate-400 mt-1">Новосибирск — помощь соседей, скидки, события рядом с вами</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${filter === f.key ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "bg-white text-slate-600 border border-slate-200 hover:border-rose-300"}`}>
            <span>{f.emoji}</span>
            <span>{f.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-slate-100"}`}>{f.count}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Загрузка...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-4xl mb-3">🏘</p>
          <p className="text-slate-600 font-bold mb-1">Пока нет публикаций</p>
          <p className="text-slate-400 text-sm">Будьте первым — создайте публикацию!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <PostCard key={p.id} p={p} />)}
        </div>
      )}
    </main>
    <BottomNav />
    <CookieConsent />
  </div>;
}

function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [tab, setTab] = useState<"guest" | "sms">("guest");

  const handleGuest = async () => {
    setSending(true);
    try { await loginAsGuest(guestName || "Гость"); navigate("/"); } catch { setSending(false); }
  };

  const handleLogin = async () => {
    if (!phone || phone.length < 10) return;
    setSending(true);
    try { await login(phone, name || "Житель НСК"); navigate("/"); } catch { setSending(false); }
  };

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-amber-500 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-lg">НСК</div>
        <h1 className="text-3xl font-black text-slate-900">РЯДОМ НСК</h1>
        <p className="text-slate-500 text-sm mt-2">Всё полезное рядом с тобой</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 mb-4">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("guest")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === "guest" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}>
            Просто зайти
          </button>
          <button onClick={() => setTab("sms")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === "sms" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}>
            По телефону
          </button>
        </div>

        {tab === "guest" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Ознакомьтесь с проектом, просматривайте объявления, создавайте свои</p>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Как вас зовут?</label>
              <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Ваше имя" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" autoFocus />
            </div>
            <button onClick={handleGuest} disabled={sending} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40 shadow-lg shadow-rose-200">
              {sending ? "Входим..." : "Зайти и посмотреть"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Войдите по телефону для полного доступа</p>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Имя</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Как вас зовут?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Телефон</label>
              <div className="flex gap-2">
                <span className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-600">+7</span>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9001234567" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <button onClick={handleLogin} disabled={sending || phone.length < 10} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40">
              {sending ? "Отправка SMS..." : "Получить код"}
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-400 mt-4">Нажимая кнопку вы соглашаетесь с условиями сервиса и политикой конфиденциальности</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Что можно делать в РЯДОМ:</h3>
        <div className="space-y-2">
          {[
            { icon: "🆘", text: "Искать помощников — электриков, сантехников, грузчиков" },
            { icon: "🛍", text: "Находить скидки у кафе и магазинов рядом" },
            { icon: "🎉", text: "Узнавать о событиях в вашем районе" },
            { icon: "🤝", text: "Помогать соседям и находить нужное" },
            { icon: "📢", text: "Размещать свои объявления бесплатно" },
          ].map((item, i) => <div key={i} className="flex items-start gap-2">
            <span className="text-lg mt-0.5">{item.icon}</span>
            <span className="text-sm text-slate-600">{item.text}</span>
          </div>)}
        </div>
      </div>
    </main>
  </div>;
}

function CreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [rawText, setRawText] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Электрик", description: "", price: "", urgent: false, district: "Октябрьский" });
  const [submitting, setSubmitting] = useState(false);

  const parseWithAI = async () => {
    if (!rawText.trim()) return;
    setUseAI(true);
    try {
      const res = await fetch(`${API}/api/ai/parse-request`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawText }) });
      const data = await res.json();
      if (data.parsed) {
        setForm(f => ({
          ...f,
          title: data.parsed.title || f.title,
          category: data.parsed.category || f.category,
          description: data.parsed.description || f.description,
          price: data.parsed.price ? String(data.parsed.price) : f.price,
          urgent: data.parsed.urgency === "high" || f.urgent,
          district: data.parsed.district || f.district,
        }));
      }
    } catch { /* fallback — keep manual form */ }
    setUseAI(false);
  };

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API}/api/posts`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.urgent ? "request" : "deal",
          title: form.title, category: form.category, description: form.description || form.title,
          district: form.district, approxAddress: `район ${form.district}`,
          price: form.price ? Number(form.price) : undefined,
          urgency: form.urgent ? "high" : "normal",
          coordinates: [82.9204, 55.0084],
          authorId: user.id, authorName: user.name, authorAvatar: user.avatar_url || "",
          authorRating: user.rating || 5, authorCompletedCount: user.completed_orders_count || 0,
          authorRole: user.role || "user", isPro: false, isVerified: false,
        }),
      });
      qc.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-xl font-black text-slate-900 mb-4">Создать публикацию</h2>
        {!user ? <div className="text-center p-8 bg-slate-50 rounded-2xl">
          <p className="text-slate-500 mb-4">Для создания публикации войдите</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl">Войти</button>
        </div> : <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Опишите задачу текстом — AI оформит за вас</label>
            <textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Например: Срочно нужен электрик, заменить розетку на кухне, район Октябрьский, бюджет 2000 руб" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 resize-none" />
            <button onClick={parseWithAI} disabled={useAI || !rawText.trim()} className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-200 disabled:opacity-40">
              {useAI ? "⏳ AI обрабатывает..." : "🤖 Оформить с AI"}
            </button>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Заголовок" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-3" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-3">
              {["Электрик", "Ремонт", "Перевозка", "Уборка", "Сборка мебели", "Компьютер", "Сантехник", "Животные", "Авто", "Помощь с ребёнком", "Забрать/доставить", "Другое"].map(c => <option key={c}>{c}</option>)}
            </select>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Описание задачи" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 resize-none mb-3" />
            <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-3">
              {["Октябрьский", "Центральный", "Железнодорожный", "Заельцовский", "Ленинский", "Кировский", "Калининский", "Дзержинский", "Первомайский", "Советский"].map(d => <option key={d}>{d}</option>)}
            </select>
            <div className="flex gap-2 mb-3">
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Бюджет ₽" type="number" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
              <button onClick={() => setForm(f => ({ ...f, urgent: !f.urgent }))} className={`px-4 py-3 rounded-xl text-sm font-bold ${form.urgent ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"}`}>⚡ Срочно</button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={submitting || !form.title.trim()} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40">
            {submitting ? "Публикация..." : "Опубликовать"}
          </button>
        </div>}
      </div>
    </main>
  </div>;
}

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const myPosts = useQuery<Post[]>({ queryKey: ["myPosts"], queryFn: () => fetch(`${API}/api/posts`).then(r => r.json()).then((posts: Post[]) => posts.filter((p: Post) => p.authorId === user?.id)), enabled: !!user?.id });
  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-3xl">{user?.name?.charAt(0) || "У"}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{user?.name || "Пользователь"}</h2>
            <p className="text-sm text-slate-500">⭐ {user?.rating || 5} · {user?.role || "Житель"} · {user?.district_name || "Октябрьский"}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[["Публикации", String(myPosts.data?.length || 0)], ["Отклики", String(user?.responses_count || 0)], ["Рейтинг", String(user?.rating || 5)]].map(([label, val]) => <div key={label} className="text-center p-3 bg-slate-50 rounded-xl"><div className="text-2xl font-black text-slate-900">{val}</div><div className="text-xs text-slate-500">{label}</div></div>)}
        </div>
        <div className="space-y-2">
          <button onClick={() => navigate("/")} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm">Мои публикации</button>
          <button onClick={async () => { await logout(); navigate("/"); }} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm">Выйти</button>
        </div>
      </div>
    </main>
    <BottomNav />
  </div>;
}

function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetch(`${API}/api/admin/stats`).then(r => r.json()) });
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: () => fetch(`${API}/api/admin/reports`).then(r => r.json()) });
  const { data: auditLogs = [] } = useQuery({ queryKey: ["audit"], queryFn: () => fetch(`${API}/api/admin/audit`).then(r => r.json()) });

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-black text-slate-900 mb-6">🔧 Админ-панель</h2>
      {statsLoading ? <p className="text-slate-400">Загрузка...</p> : stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[["Пользователи", stats.totalUsers], ["Публикации", stats.totalPosts], ["Отклики", stats.totalResponses], ["Бизнесы", stats.totalBusinesses], ["Жалобы", stats.totalReports], ["События", stats.totalEvents]].map(([label, val]) => <div key={label} className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-500 mb-1">{label}</div><div className="text-xl font-black text-slate-900">{val}</div></div>)}
        </div>
      )}
      {Array.isArray(reports) && reports.length > 0 && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <h3 className="font-bold text-slate-900 p-4 border-b border-slate-100">Жалобы</h3>
        <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left p-3 text-slate-500 font-bold">ID</th><th className="text-left p-3 text-slate-500 font-bold">Причина</th><th className="text-left p-3 text-slate-500 font-bold">Статус</th></tr></thead>
          <tbody>{reports.map((r: any) => <tr key={r.id} className="border-t border-slate-100"><td className="p-3 text-xs text-slate-400">{r.id.slice(0, 8)}</td><td className="p-3">{r.reason}</td><td className="p-3">{r.status}</td></tr>)}</tbody>
        </table>
      </div>}
      {Array.isArray(auditLogs) && auditLogs.length > 0 && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <h3 className="font-bold text-slate-900 p-4 border-b border-slate-100">Журнал аудита</h3>
        <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left p-3 text-slate-500 font-bold">Время</th><th className="text-left p-3 text-slate-500 font-bold">Действие</th><th className="text-left p-3 text-slate-500 font-bold">Пользователь</th><th className="text-left p-3 text-slate-500 font-bold">Цель</th></tr></thead>
          <tbody>{auditLogs.map((l: any) => <tr key={l.id} className="border-t border-slate-100"><td className="p-3 text-xs text-slate-400">{new Date(l.timestamp).toLocaleString("ru")}</td><td className="p-3 font-bold">{l.action}</td><td className="p-3 text-slate-600">{l.user}</td><td className="p-3 text-slate-600">{l.target}</td></tr>)}</tbody>
        </table>
      </div>}
    </main>
    <BottomNav />
  </div>;
}

function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: post, isLoading } = useQuery<Post>({ queryKey: ["post", id], queryFn: () => fetch(`${API}/api/posts/${id}`).then(r => r.json()), enabled: !!id });
  const { data: responses = [] } = useQuery<Resp[]>({ queryKey: ["responses", id], queryFn: () => fetch(`${API}/api/posts/${id}/respond`).then(r => r.ok ? r.json() : []), enabled: !!id });
  const [msg, setMsg] = useState("");

  const respondMutation = useMutation({
    mutationFn: async () => {
      if (!user || !msg.trim()) return;
      await fetch(`${API}/api/posts/${id}/respond`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userName: user.name, userAvatar: user.avatar_url || "", userRating: user.rating || 5, userCompletedCount: user.completed_orders_count || 0, message: msg }),
      });
    },
    onSuccess: () => { setMsg(""); qc.invalidateQueries({ queryKey: ["responses", id] }); },
  });

  if (isLoading) return <div className="min-h-screen bg-slate-100/60 flex items-center justify-center"><p className="text-slate-400">Загрузка...</p></div>;
  if (!post) return <div className="min-h-screen bg-slate-100/60 flex items-center justify-center"><div className="text-center"><p className="text-4xl mb-3">😢</p><p className="text-slate-600 font-bold">Публикация не найдена</p><button onClick={() => navigate("/")} className="mt-4 px-6 py-2 bg-rose-500 text-white font-bold rounded-xl">На главную</button></div></div>;

  const typeEmoji: Record<string, string> = { request: "🆘", deal: "🛍", event: "🎉", offer: "💼", alert: "⚡", neighbor: "🤝" };

  return <div className="min-h-screen bg-slate-100/60">
    <Header />
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {post.urgency === "high" && <span className="text-sm font-black px-2 py-0.5 rounded-md bg-red-100 text-red-700">СРОЧНО</span>}
          <span className="text-sm font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">{typeEmoji[post.type] || "📌"} {post.type}</span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{post.category}</span>
          <span className="text-xs text-slate-400">📍 {post.district}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">{post.title}</h1>
        <p className="text-sm text-slate-600 mb-4">{post.description}</p>
        <div className="flex items-center gap-4 text-sm font-bold text-slate-700 mb-4 flex-wrap">
          {post.price && <span>💰 {post.price.toLocaleString("ru")} ₽</span>}
          {post.date && <span>📅 {post.date}</span>}
          {post.time && <span>🕐 {post.time}</span>}
          <span>👁 {post.viewsCount} просм.</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-100 pt-3">
          <span>{post.authorName}</span><span>⭐ {post.authorRating}</span><span>{post.authorCompletedCount} выполнено</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">Отклики ({Array.isArray(responses) ? responses.length : 0})</h3>
        {!Array.isArray(responses) || responses.length === 0 ? <p className="text-slate-400 text-sm">Пока нет откликов. Будьте первым!</p> :
          responses.map((r: Resp) => <div key={r.id} className="bg-slate-50 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-1"><span className="font-bold text-slate-900">{r.userName}</span>{r.offerPrice && <span className="text-xs text-rose-600 font-bold">{r.offerPrice.toLocaleString("ru")} ₽</span>}</div>
            <div className="text-xs text-slate-500 mb-1">⭐ {r.userRating} · {r.userCompletedCount} выполнено · {r.status}</div>
            <p className="text-sm text-slate-600">{r.message}</p>
          </div>)}
      </div>

      {user ? <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="font-bold text-slate-900 mb-3">Написать отклик</h3>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Расскажите, почему вы можете помочь..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 resize-none mb-3" />
        <button onClick={() => respondMutation.mutate()} disabled={!msg.trim() || respondMutation.isPending} className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl disabled:opacity-40 text-sm">
          {respondMutation.isPending ? "Отправка..." : "Откликнуться"}
        </button>
      </div> : <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
        <p className="text-slate-500 mb-3">Войдите, чтобы откликнуться</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl">Войти</button>
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
  return <QueryClientProvider client={queryClient}>
    <ConsentProvider><AuthProvider>
      <RouterProvider router={router} />
      <OnboardingModal />
    </AuthProvider></ConsentProvider>
  </QueryClientProvider>;
}
