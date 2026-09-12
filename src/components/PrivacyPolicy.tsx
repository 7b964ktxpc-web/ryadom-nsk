import React from "react";
import { ArrowLeft, Shield, Clock, Trash2, Globe } from "lucide-react";

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Политика конфиденциальности</h2>
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
            <Shield className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900">Оператор персональных данных</h3>
              <p>
                Оператор: <strong>РЯДОМ НСК</strong><br />
                Адрес: г. Новосибирск<br />
                Контакт для вопросов: privacy@ryadom.nsk
              </p>
            </div>
          </div>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. Общие положения</h3>
            <p>
              Настоящая Политика конфиденциальности определяет порядок сбора, обработки, хранения и защиты
              персональных данных пользователей приложения «РЯДОМ НСК» (далее — «Приложение»).
              Настоящая Политика действует в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
              «О персональных данных» и иными нормативными актами Российской Федерации.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. Собираемые данные</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Персональные данные:</strong> имя, телефон, email</li>
              <li><strong>Геолокация:</strong> приблизительное местоположение (район города)</li>
              <li><strong>Телеграм-идентификатор:</strong> для авторизации через Telegram</li>
              <li><strong>Данные публикаций:</strong> созданные вами тексты, категории, адреса</li>
              <li><strong>Устройство:</strong> тип, версия ОС, IP-адрес (анонимизированный)</li>
              <li><strong>Cookies:</strong> файлы для обеспечения работы приложения</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. Цели обработки данных</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Предоставление услуг Приложения</li>
              <li>Персонализация контента и рекомендаций</li>
              <li>Обработка запросов и сообщений между пользователями</li>
              <li>Аналитика и улучшение качества услуг</li>
              <li>Обеспечение безопасности и защита от спама</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. Основания обработки</h3>
            <p>
              Обработка персональных данных осуществляется на основании:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Ст. 6 ч. 1 п. б ФЗ-152 — для выполнения условий договора</li>
              <li>Ст. 6 ч. 1 п. а ФЗ-152 — на основании добровольного согласия</li>
              <li>Ст. 6 ч. 1 п. в ФЗ-152 — для защиты прав и законных интересов</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. Сроки хранения и уничтожение</h3>
            <p>
              Персональные данные хранятся до окончания обработки запросов. По достижении цели
              обработки или по требованию пользователя данные удаляются в течение 30 дней
              (ст. 17 ФЗ-152). При удалении аккаунта все персональные данные уничтожаются
              или обезличиваются в течение указанного срока.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">6. Права пользователя (ст. 21 ФЗ-152)</h3>
            <p>Вы вправе в любое время:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Запросить уточнение ваших персональных данных</li>
              <li>Запросить блокирование или удаление ваших персональных данных</li>
              <li>Запросить перенос ваших персональных данных в другое место обработки</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Подать жалобу в уполномоченный орган по защите персональных данных</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">7. Передача данных третьим лицам</h3>
            <p>
              Персональные данные не передаются третьим лицам, за исключением случаев:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Выраженного согласия пользователя</li>
              <li>Требования закона или судебного решения</li>
              <li>Партнёров, обеспечивающих работу Приложения (Supabase, Google AI)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">8. Геолокационные данные</h3>
            <p>
              Приложение собирает приблизительную геолокацию (район города) только при вашем
              явном согласии. Точный адрес и координаты не отображаются и не передаются
              другим пользователям. Вы можете в любой момент отозвать согласие на обработку
              геолокационных данных в настройках.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">9. Защита персональных данных</h3>
            <p>
              Приложение использует современные средства защиты, включая шифрование данных
              при передаче (HTTPS), ограничение доступа к персональным данным, а также
              регулярный аудит безопасности.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-2">10. Связь с оператором</h3>
            <p>
              По всем вопросам, связанным с персональными данными, вы можете связаться с
              оператором по электронной почте: <strong>privacy@ryadom.nsk</strong>
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-400">
            Последнее обновление: 12 сентября 2026 г. Версия политики: 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
