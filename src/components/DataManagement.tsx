import React, { useState } from "react";
import { useConsent } from "../contexts/ConsentContext";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Trash2, Download, AlertTriangle, CheckCircle } from "lucide-react";

export function DataManagement() {
  const { exportData, deleteData, hasConsented, withdrawConsent } = useConsent();
  const { user, logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ryadom_nsk_my_data_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDone("export");
      setTimeout(() => setDone(null), 3000);
    } catch {
      setDone("export-error");
      setTimeout(() => setDone(null), 3000);
    }
    setExporting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены? Все ваши данные будут безвозвратно удалены.")) return;
    setDeleting(true);
    try {
      await deleteData();
      await logout();
      setDone("delete");
      setTimeout(() => setDone(null), 3000);
    } catch {
      setDone("delete-error");
      setTimeout(() => setDone(null), 3000);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <Shield className="w-5 h-5 text-slate-700" />
        Управление данными (ФЗ-152)
      </h3>

      {/* Export */}
      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">📥 Экспорт данных</h4>
            <p className="text-xs text-slate-500">Ст. 21 ФЗ-152 — право на перенос данных</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {exporting ? "..." : "Экспортировать"}
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">🗑 Удаление данных</h4>
            <p className="text-xs text-slate-500">Ст. 17 ФЗ-152 — право на удаление</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
          >
            {deleting ? "..." : "Удалить все данные"}
          </button>
        </div>
      </div>

      {/* Withdraw consent */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">🚫 Отзыв согласия</h4>
            <p className="text-xs text-slate-500">Ст. 9 ФЗ-152 — право отозвать согласие</p>
          </div>
          <button
            onClick={withdrawConsent}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
          >
            Отозвать согласие
          </button>
        </div>
      </div>

      {/* Status messages */}
      {done === "export" && (
        <div className="flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle className="w-4 h-4" /> Файл экспортирован</div>
      )}
      {done === "delete" && (
        <div className="flex items-center gap-2 text-red-700 text-sm"><Trash2 className="w-4 h-4" /> Все данные удалены</div>
      )}
      {done === "export-error" && (
        <div className="text-red-700 text-sm">Ошибка экспорта. Попробуйте ещё раз.</div>
      )}
      {done === "delete-error" && (
        <div className="text-red-700 text-sm">Ошибка удаления. Попробуйте ещё раз.</div>
      )}
    </div>
  );
}
