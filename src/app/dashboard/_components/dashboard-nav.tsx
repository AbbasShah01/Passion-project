"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardNavProps = {
  mobile?: boolean;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "History", href: "/dashboard/history" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardNav({ mobile = false }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className={mobile ? "flex gap-2 overflow-x-auto pb-1" : "flex flex-col gap-2"}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-primary/70 bg-primary/20 text-white"
                : "border-white/10 bg-white/5 text-slate-200 hover:border-secondary/50 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
