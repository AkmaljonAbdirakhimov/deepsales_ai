import { UserMenu } from "./UserMenu";

interface TopbarProps {
  title: string;
  subtitle?: string;
  user: { name: string; email: string };
  badge?: string;
}

export function Topbar({ title, subtitle, user, badge }: TopbarProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between px-6">
      <div>
        <h1 className="text-white font-semibold">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <UserMenu name={user.name} email={user.email} badge={badge} />
    </header>
  );
}
