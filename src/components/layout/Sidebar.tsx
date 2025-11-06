const links = [
  { href: '/', label: 'Inicio' },
  { href: '/documents', label: 'Documentos' },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white md:block">
      <nav className="space-y-1 p-4">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
