import React, { useState, useEffect } from "react";
import { Activity, Users, Eye, AlertTriangle, Clock, Server, CheckCircle2, XCircle } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  target: string;
  status: "success" | "failed" | "warning";
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export function AdminMonitoring() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "security">("overview");

  const stats: StatCard[] = [
    { label: "Активные пользователи", value: 1247, icon: <Users className="w-5 h-5" />, color: "text-blue-600" },
    { label: "Публикаций сегодня", value: 89, icon: <Activity className="w-5 h-5" />, color: "text-green-600" },
    { label: "Жалоб за сегодня", value: 7, icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-600" },
    { label: "Модераций", value: 42, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-600" },
  ];

  const recentLogs: LogEntry[] = [
    { id: "1", timestamp: "2026-09-12T14:30:00Z", action: "Модерация", user: "admin", ip: "10.0.0.1", target: "post-42", status: "success" },
    { id: "2", timestamp: "2026-09-12T14:25:00Z", action: "Жалоба", user: "u-nsk-105", ip: "10.0.0.45", target: "post-38", status: "warning" },
    { id: "3", timestamp: "2026-09-12T14:20:00Z", action: "Блокировка", user: "admin", ip: "10.0.0.1", target: "u-nsk-999", status: "warning" },
    { id: "4", timestamp: "2026-09-12T14:15:00Z", action: "Создание", user: "u-nsk-201", ip: "10.0.0.77", target: "post-56", status: "success" },
    { id: "5", timestamp: "2026-09-12T14:10:00Z", action: "Логин", user: "u-nsk-312", ip: "10.0.0.12", target: "auth", status: "success" },
    { id: "6", timestamp: "2026-09-12T14:05:00Z", action: "Удаление", user: "admin", ip: "10.0.0.1", target: "post-11", status: "success" },
    { id: "7", timestamp: "2026-09-12T14:00:00Z", action: "Ограничение", user: "u-nsk-888", ip: "10.0.0.99", target: "post-22", status: "failed" },
  ];

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <Server className="w-5 h-5 text-slate-700" />
        Мониторинг системы
      </h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className={s.color}>{s.icon}</span>
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["overview", "logs", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {tab === "overview" ? "Обзор" : tab === "logs" ? "Журнал" : "Безопасность"}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 text-slate-500 font-bold">Время</th>
              <th className="text-left p-3 text-slate-500 font-bold">Действие</th>
              <th className="text-left p-3 text-slate-500 font-bold">Пользователь</th>
              <th className="text-left p-3 text-slate-500 font-bold">IP</th>
              <th className="text-left p-3 text-slate-500 font-bold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="p-3 text-slate-600">
                  {new Date(log.timestamp).toLocaleTimeString("ru-RU")}
                </td>
                <td className="p-3 font-medium">{log.action}</td>
                <td className="p-3 text-slate-600">{log.user}</td>
                <td className="p-3 text-slate-400">{log.ip}</td>
                <td className="p-3">
                  {log.status === "success" ? (
                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> OK</span>
                  ) : log.status === "failed" ? (
                    <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" /> Ошибка</span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3 h-3" /> Предупреждение</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
