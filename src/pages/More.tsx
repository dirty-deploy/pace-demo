import { Link } from 'react-router-dom';
import { MORE_ITEMS } from '../components/nav';

/** The fifth item of the mobile bottom bar. */
export default function More() {
  return (
    <ul className="more-list">
      {MORE_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <Link to={to} className="more-row">
            <Icon size={20} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
