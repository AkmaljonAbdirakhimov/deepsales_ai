"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

interface SidebarProps {
  brandHref: string;
  brandSubtitle?: string;
  items: NavItem[];
}

export function Sidebar({ brandHref, brandSubtitle, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
      <Link href={brandHref} className="px-5 py-6 border-b border-slate-800 block">
        <span className="text-xl font-bold text-white">
          Deep<span className="text-blue-400">Sales</span>
        </span>
        {brandSubtitle && (
          <span className="block text-xs text-slate-500 mt-0.5">
            {brandSubtitle}
          </span>
        )}
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">v0.1.0</p>
      </div>
    </aside>
  );
}
