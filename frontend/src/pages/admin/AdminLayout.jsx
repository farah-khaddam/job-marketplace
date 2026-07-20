// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Tag,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/seekers", key: "seekers", Icon: Users },
  { to: "/admin/companies", key: "companies", Icon: Building2 },
  { to: "/admin/jobs", key: "jobs", Icon: Briefcase },
  { to: "/admin/cvs", key: "cvs", Icon: FileText },
  { to: "/admin/categories", key: "categories", Icon: Tag },
];

export default function AdminLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2544] to-[#1e3a5f]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 min-h-screen border-e border-white/10 p-4 hidden md:block">
          <h1 className="text-white font-semibold text-lg mb-6 px-2">
            {t("admin.nav.title")}
          </h1>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, key, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#3b82f6] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {t(`admin.nav.${key}`)}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile top nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0f2544]/95 backdrop-blur-md border-t border-white/10 flex justify-around py-2">
          {NAV_ITEMS.map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 text-xs ${
                  isActive ? "text-[#3b82f6]" : "text-white/60"
                }`
              }
            >
              <Icon size={20} />
              {t(`admin.nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
