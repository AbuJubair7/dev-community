import { GROUPS, ROUTES } from '../data/routes.js';

export default function Sidebar({ selectedGroup, onSelect }) {
  const countFor = (g) => ROUTES.filter((r) => r.group === g).length;

  return (
    <aside className="sidebar">
      <p className="sidebar-heading">Route Groups</p>
      {GROUPS.map((g) => (
        <div
          key={g}
          className={`sidebar-item ${selectedGroup === g ? 'active' : ''}`}
          onClick={() => onSelect(g)}
        >
          <span>{g}</span>
          <span className="sidebar-count">{countFor(g)}</span>
        </div>
      ))}
    </aside>
  );
}
