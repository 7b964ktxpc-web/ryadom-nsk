import React from "react";
import { ArrowLeft } from "lucide-react";

export function TermsOfService({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Пользовательское соглашение</h2>
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. Общие положения</h3>
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») определяет условия
              использования приложения «РЯДОМ НСК» (далее — «Приложение»). Используя Приложение,
              вы принимаете настоящие условия в полном объёме. Если вы не согласны с каким-либо
              пунктом, вы должны прекратить использование Приложения.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. Возрастные ограничения</h3>
            <p>Использование Приложения разрешено лицам старше 16 лет.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. Пользовательский контент</h3>
            <p>Вы несёте полную ответственность за создаваемый вами контент.</p>
            <p>Запрещается размещать:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Незаконный контент</li>
              <li>Контент, нарушающий права третьих лиц</li>
              <li>Спам и рекламу в неположенных местах</li>
              <li>Материалы, содержащие дискриминацию или призыв к насилию</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. Правила использования</h3>
            <p>Вы обязуетесь:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Использовать Приложение только в законных целях</li>
              <li>Не использовать автоматизированные средства для доступа к данным</li>
              <li>Не нарушать работу Приложения и серверов</li>
              <li>Соблюдать правила модерации</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. Модерация</h3>
            <p>
              Администрация Приложения вправе модерировать, скрывать, удалять или блокировать
              любой контент без предварительного уведомления при нарушении настоящего Соглашения.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">6. Ответственность</h3>
            <p>
              Администрация не несёт ответственности за содержание публикаций пользователей.
              Все взаимодействия между пользователями осуществляются на их собственный риск.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">7. Изменения в условиях</h3>
            <p>
              Администрация вправе вносить изменения в настоящее Соглашение в любое время.
              Очередные изменения публикуются в Приложении. Продолжение использования
              означает принятие изменений.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">8. Разрешение споров</h3>
            <p>
              Все споры разрешаются в соответствии с законодательством Российской Федерации
              в суде по месту нахождения оператора.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-400">
            Последнее обновление: 12 сентября 2026 г.
          </div>
        </div>
      </div>
    </div>
  );
}
