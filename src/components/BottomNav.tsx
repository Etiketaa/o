import { useUIStore } from "@/stores/uiStore";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="flex items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] bg-surface border-t border-border">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              active
                ? "text-lime bg-lime/5"
                : "text-text-muted hover:text-text-hi"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-mono tracking-wider uppercase">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
