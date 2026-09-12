import React from "react";
import {
  Sparkles,
  Tag,
  Flame,
  Calendar,
  Gift,
  AlertTriangle,
  HeartHandshake,
  Layers,
} from "lucide-react";

interface CategoryFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  subCategory: string;
  onSubCategoryChange: (sub: string) => void;
}

const MAIN_FILTERS = [
  { id: "all", label: "Все", icon: Layers },
  { id: "deal", label: "Выгодно", icon: Tag, emoji: "🛍" },
  { id: "request", label: "Нужно сейчас", icon: Flame, emoji: "🆘" },
  { id: "event", label: "События", icon: Calendar, emoji: "🎉" },
  { id: "neighbor", label: "Объявления", icon: Gift, emoji: "🎁" },
  { id: "alert", label: "Важно", icon: AlertTriangle, emoji: "⚠️" },
  { id: "help", label: "Соседи помогают", icon: HeartHandshake, emoji: "❤️" },
];

const SUB_CATEGORIES_MAP: Record<string, string[]> = {
  deal: ["Все", "Еда", "Кафе", "Магазины", "Красота", "Авто", "Спорт", "Дети", "Услуги", "Развлечения"],
  request: [
    "Все",
    "Электрик",
    "Сантехник",
    "Перевозка",
    "Уборка",
    "Ремонт",
    "Сборка мебели",
    "Компьютер",
    "Животные",
    "Авто",
    "Забрать/доставить",
    "Помощь с ребёнком",
  ],
  event: ["Все", "Городские", "Бесплатные", "Мастер-классы", "Выставки", "Спорт", "Детские", "Концерты", "Ярмарки"],
  neighbor: ["Все", "Отдам", "Продам", "Куплю", "Потеряно", "Найдено", "Помощь", "Животные", "Разное"],
  alert: ["Все", "Перекрытие дорог", "Отключение воды", "Отключение света", "Авария", "Опасный участок", "Городское предупреждение"],
};

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeFilter,
  onFilterChange,
  subCategory,
  onSubCategoryChange,
}) => {
  const subCategories = SUB_CATEGORIES_MAP[activeFilter] || [];

  return (
    <div className="mb-4 space-y-2">
      {/* Primary Tab Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MAIN_FILTERS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onFilterChange(tab.id);
                onSubCategoryChange("Все");
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 border border-slate-200/80"
              }`}
            >
              {tab.emoji ? (
                <span className="text-xs">{tab.emoji}</span>
              ) : (
                <tab.icon className="w-3.5 h-3.5" />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Pills (if applicable) */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-slate-400 pl-1 shrink-0">
            Подкатегории:
          </span>
          {subCategories.map((sub) => {
            const isSubActive = subCategory === sub;
            return (
              <button
                key={sub}
                onClick={() => onSubCategoryChange(sub)}
                className={`shrink-0 px-2.5 py-1 rounded-lg transition-all ${
                  isSubActive
                    ? "bg-rose-500 text-white font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70"
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
