import { FileText, Archive, Package, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { APP_TITLE } from "@/const";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    label: "Angebote",
    icon: FileText,
    path: "/",
  },
  {
    label: "Archiv",
    icon: Archive,
    path: "/archiv",
  },
  {
    label: "Bausteine",
    icon: Package,
    path: "/bausteine",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-64 bg-white border-r border-gray-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-sm">
          B
        </div>
        <div>
          <div className="font-semibold text-gray-900">{APP_TITLE}</div>
          <div className="text-xs text-gray-500">Angebotsgenerator</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => {
            // Logout-Logik hier implementieren
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
