import { COLORS, FONTS } from "@/lib/utils";
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
    <div
      className="flex items-center justify-around px-2 py-2"
      style={{ borderTop: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors"
          >
            <Icon size={20} color={active ? COLORS.lime : COLORS.textMuted} strokeWidth={active ? 2.5 : 2} />
            <span
              style={{
                fontFamily: FONTS.mono,
                color: active ? COLORS.lime : COLORS.textMuted,
                fontSize: 10,
                letterSpacing: 0.5,
              }}
            >
              {item.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
