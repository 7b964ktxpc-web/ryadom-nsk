import React, { useState, useEffect } from "react";

const STEPS = [
  {
    icon: "🏘",
    title: "РЯДОМ НСК — это городской сервис",
    desc: "Мы соединяем жителей Новосибирска друг с другом. Здесь вы находите помощников, скидки, события и нужное — всё в шаговой доступности от вашего дома.",
  },
  {
    icon: "🆘",
    title: "Нужна помощь?",
    desc: "Опишите задачу текстом — AI оформит объявление. Электрик, сантехник, грузчик, уборка — соседи рядом уже готовы помочь. Быстро, без посредников.",
  },
  {
    icon: "🛍",
    title: "Скидки и предложения",
    desc: "Кафе, салоны, магазины в вашем районе публикуют спецпредложения специально для соседей. Вы увидите только то, что рядом — в пешей доступности.",
  },
  {
    icon: "🎉",
    title: "События в районе",
    desc: "Мастер-классы, концерты, ярмарки, open-air — всё что происходит у вас под окном. Не пропустите интересное!",
  },
  {
    icon: "📍",
    title: "Только ваш район",
    desc: "Сервис работает по принципу гиперлокальности. Вы видите только то, что происходит рядом с вами — максимум в 3 км. Никакого шума из других частей города.",
  },
  {
    icon: "🚀",
    title: "Готовы начать!",
    desc: "Заходите без регистрации, просматривайте ленту, откликайтесь на объявления. Когда захотите создать своё — зарегистрируйтесь по имени.",
  },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{s.icon}</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">{s.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-rose-500" : i < step ? "w-3 bg-rose-300" : "w-3 bg-slate-200"}`} />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={close} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm hover:bg-slate-200">
            Пропустить
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl text-sm shadow-lg shadow-rose-200">
              Далее
            </button>
          ) : (
            <button onClick={close} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl text-sm shadow-lg shadow-rose-200">
              Начать!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
