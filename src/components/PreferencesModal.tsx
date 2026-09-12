import React, { useState } from "react";
import {
  X,
  Compass,
  MapPin,
  Check,
  Bell,
  Sliders,
  Sparkles,
  Navigation,
} from "lucide-react";
import { DistrictName, UserPreferences } from "../types";
import { NOVOSIBIRSK_DISTRICTS } from "../utils/geo";
import {
  getUserPreferences,
  saveUserPreferences,
  setUserDistrict,
} from "../services/storage";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated?: () => void;
}

const ALL_INTERESTS = [
  "Скидки",
  "Еда",
  "Кафе",
  "Ремонт",
  "Мероприятия",
  "Объявления",
  "Авто",
  "Спорт",
  "Дети",
  "Животные",
  "Красота",
  "Услуги",
];

const RADIUS_OPTIONS = [0.5, 1.0, 3.0, 5.0, 10.0];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdated,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDistrictChange = (dist: DistrictName) => {
    setUserDistrict(dist);
    const updated = getUserPreferences();
    setPrefs(updated);
  };

  const handleRadiusChange = (rad: number) => {
    const updated = saveUserPreferences({ radiusKm: rad });
    setPrefs(updated);
  };

  const handleToggleInterest = (item: string) => {
    const current = prefs.interests;
    const next = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    const updated = saveUserPreferences({ interests: next });
    setPrefs(updated);
  };

  const handleSimulateGps = () => {
    setIsGpsLocating(true);
    setGpsSuccess(null);

    // If browser supports real geolocation, try it, otherwise fallback smoothly
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsLocating(false);
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          const updated = saveUserPreferences({
            userCoordinates: coords,
            useGps: true,
          });
          setPrefs(updated);
          setGpsSuccess(`📍 Координаты получены: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
        },
        () => {
          // Fallback to Novosibirsk center
          setTimeout(() => {
            setIsGpsLocating(false);
            const coords: [number, number] = [55.0188, 82.9734];
            const updated = saveUserPreferences({
              userCoordinates: coords,
              useGps: true,
            });
            setPrefs(updated);
            setGpsSuccess("📍 Геолокация определена (Октябрьский район, Новосибирск)");
          }, 600);
        }
      );
    } else {
      setTimeout(() => {
        setIsGpsLocating(false);
        setGpsSuccess("📍 Геолокация определена (Октябрьский район, Новосибирск)");
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Радиус и интересы
              </h2>
              <p className="text-xs text-slate-500">
                Персонализация ленты «РЯДОМ НСК»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs">
          {/* Geolocation Button */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-rose-500" />
                Точная геолокация (GPS)
              </span>
              <button
                onClick={handleSimulateGps}
                disabled={isGpsLocating}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 font-bold rounded-xl text-slate-800 transition-colors"
              >
                {isGpsLocating ? "Определение..." : "Обновить GPS"}
              </button>
            </div>
            {gpsSuccess && (
              <p className="text-emerald-700 font-semibold">{gpsSuccess}</p>
            )}
            <p className="text-slate-500 text-[11px]">
              Используется только для сортировки по близости к вам (метры, километры).
            </p>
          </div>

          {/* District selector */}
          <div>
            <label className="block font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Ваш район Новосибирска:
            </label>
            <select
              value={prefs.currentDistrict}
              onChange={(e) => handleDistrictChange(e.target.value as DistrictName)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
            >
              {NOVOSIBIRSK_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} район ({d.description})
                </option>
              ))}
            </select>
          </div>

          {/* Radius selector */}
          <div>
            <label className="block font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Радиус поиска в ленте:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className={`py-2 rounded-xl font-black text-center transition-all ${
                    prefs.radiusKm === r
                      ? "bg-rose-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {r < 1 ? "500 м" : `${r} км`}
                </button>
              ))}
            </div>
            <p className="text-slate-400 text-[11px] mt-1.5">
              Объекты за пределами радиуса будут показываться ниже или скрываться.
            </p>
          </div>

          {/* Interests Chips */}
          <div>
            <label className="block font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Ваши интересы (для умного дайджеста):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_INTERESTS.map((item) => {
                const active = prefs.interests.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => handleToggleInterest(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onPreferencesUpdated) onPreferencesUpdated();
            }}
            className="px-6 py-2.5 bg-rose-500 text-white font-black rounded-xl shadow-xs"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};
