import React, { useState, useEffect } from "react";
import { Zap, Gift, Activity, MapPin, Rocket, Compass, ChevronRight } from "lucide-react";

const STEPS = [
  { icon: <Compass size={40} />, title: "РЯДОМ НСК — городской сервис", desc: "Мы соединяем жителей Новосибирска друг с другом. Помощь, скидки, события — всё в шаговой доступности от вашего дома." },
  { icon: <Zap size={40} />, title: "Нужна помощь?", desc: "Опишите задачу текстом — AI оформит объявление. Электрик, сантехник, грузчик — соседи рядом готовы помочь. Быстро, без посредников." },
  { icon: <Gift size={40} />, title: "Скидки и предложения", desc: "Кафе, салоны, магазины в вашем районе публикуют спецпредложения специально для соседей. Только то, что рядом — в пешей доступности." },
  { icon: <Activity size={40} />, title: "События в районе", desc: "Мастер-классы, концерты, ярмарки, open-air — всё что происходит у вас под окном. Не пропустите интересное!" },
  { icon: <MapPin size={40} />, title: "Только ваш район", desc: "Сервис работает по принципу гиперлокальности. Вы видите только то, что происходит рядом — максимум в 3 км. Никакого шума из других частей города." },
  { icon: <Rocket size={40} />, title: "Готовы начать!", desc: "Заходите без регистрации, просматривайте ленту, откликайтесь на объявления. Когда захотите создать своё — регистрируйтесь по имени." },
];

export function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("ryadom_onboarded");
    if (!seen) setShow(true);
  }, []);

  const close = () => {
    localStorage.setItem("ryadom_onboarded", "1");
    setShow(false);
  };

  if (!show) return null;
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="card p-6 sm:p-8 max-w-md w-full relative overflow-hidden animate-scale-in" style={{ borderColor: "rgba(0, 212, 170, 0.15)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary animate-float">
            {s.icon}
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">{s.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-white/10"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={close} className="flex-1 py-3 glass text-text-secondary font-semibold rounded-xl text-sm hover:bg-white/5 transition-all">Пропустить</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 py-3 btn-primary text-sm flex items-center justify-center gap-2"><span>Далее</span><ChevronRight size={16} /></button>
          ) : (
            <button onClick={close} className="flex-1 py-3 btn-primary text-sm flex items-center justify-center gap-2"><span>Начать!</span><Rocket size={16} /></button>
          )}
        </div>
      </div>
    </div>
  );
}
