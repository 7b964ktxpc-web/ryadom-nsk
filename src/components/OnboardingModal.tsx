import React, { useState } from "react";
import { Sparkles, MapPin, Compass, Check, ArrowRight } from "lucide-react";
import { DistrictName } from "../types";
import { NOVOSIBIRSK_DISTRICTS } from "../utils/geo";
import { saveUserPreferences, setUserDistrict } from "../services/storage";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const INTERESTS = [
  "Скидки",
  "Еда и кафе",
  "Срочный ремонт",
  "Мастера на час",
  "События и праздники",
  "Объявления соседей",
  "Авто",
  "Дети и спорт",
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState<DistrictName>("Октябрьский");
  const [radius, setRadius] = useState(3.0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Скидки",
    "Еда и кафе",
    "Срочный ремонт",
  ]);

  if (!isOpen) return null;

  const handleFinish = () => {
    setUserDistrict(district);
    saveUserPreferences({
      radiusKm: radius,
      interests: selectedInterests,
      hasCompletedOnboarding: true,
    });
    onComplete();
  };

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Banner */}
        <div className="p-6 bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs mx-auto flex items-center justify-center text-white font-black text-xl mb-3 shadow-inner">
            НСК
          </div>
          <h2 className="text-xl font-black tracking-tight">РЯДОМ НСК</h2>
          <p className="text-xs text-rose-100 mt-1 font-medium">
            Всё полезное рядом с тобой прямо сейчас
          </p>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  В каком районе вы находитесь?
                </h3>
                <p className="text-xs text-slate-500">
                  Мы покажем скидки, мастеров и события в пешей доступности
                </p>
              </div>

              <div className="text-left space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Район Новосибирска:
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as DistrictName)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                >
                  {NOVOSIBIRSK_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} район ({d.description})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Далее</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Какой радиус вам интересен?
                </h3>
                <p className="text-xs text-slate-500">
                  Удобно для пеших прогулок или поездок на авто
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 3.0, 5.0].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`py-3 rounded-xl text-xs font-black transition-all ${
                      radius === r
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {r < 1 ? "500 м" : `${r} км`}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Что вас интересует в первую очередь:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map((item) => {
                    const active = selectedInterests.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleInterest(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
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

              <button
                onClick={handleFinish}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                Открыть «РЯДОМ НСК»
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
