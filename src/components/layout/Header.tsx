import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '../ui/Button';
import { useAuth } from '../auth/AuthProvider';

export const Header = () => {
  const { user, companies, companyId, setActiveCompany, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-lg font-semibold text-brand-600">ISOTrack</p>
        <p className="text-sm text-slate-500">Panel de control</p>
      </div>
      <div className="flex items-center gap-4">
        {companies.length > 0 && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary" size="sm">
                {companies.find((company) => company.id === companyId)?.name ?? 'Seleccionar empresa'}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[220px] rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                {companies.map((company) => (
                  <DropdownMenu.Item
                    key={company.id}
                    className="cursor-pointer rounded px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100"
                    onSelect={() => setActiveCompany(company.id)}
                  >
                    {company.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
