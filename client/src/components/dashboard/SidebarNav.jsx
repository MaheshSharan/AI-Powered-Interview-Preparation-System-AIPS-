import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CodeBracketIcon as CodeIcon, 
  VideoCameraIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon as SettingsIcon,
  QuestionMarkCircleIcon as SupportIcon,
  BookOpenIcon as DocumentationIcon
} from '@heroicons/react/24/outline';

const navigationItems = [
  { 
    id: 'overview', 
    name: 'Dashboard', 
    icon: HomeIcon,
    to: '/dashboard'
  },
  { 
    id: 'company', 
    name: 'Company & Role', 
    icon: BuildingOfficeIcon,
    to: '/dashboard/company'
  },
  { 
    id: 'resume', 
    name: 'Resume', 
    icon: DocumentTextIcon,
    to: '/dashboard/resume'
  },
  { 
    id: 'technical', 
    name: 'Technical', 
    icon: CodeIcon,
    to: '/dashboard/technical'
  },
  { 
    id: 'interview', 
    name: 'Interview', 
    icon: VideoCameraIcon,
    to: '/dashboard/interview'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    icon: ChartBarIcon,
    to: '/dashboard/analytics'
  },
];

const bottomNavItems = [
  {
    id: 'support',
    name: 'Support',
    icon: SupportIcon,
    to: '/dashboard/support'
  },
  {
    id: 'documentation',
    name: 'Documentation',
    icon: DocumentationIcon,
    to: '/dashboard/documentation'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: SettingsIcon,
    to: '/dashboard/settings'
  }
];

const SidebarNav = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    setActiveSection(item.id);
    navigate(item.to);
  };

  return (
    <nav className="flex flex-col h-[calc(100vh-4rem)] bg-slate-900">
      {/* Top section */}
      <div className="flex-none p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white font-outfit">Overview</span>
          <span className="text-xs font-medium text-slate-500">Ver 1.0</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex-1 px-3 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <div key={item.id}>
            <Link
              to={item.to}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item);
              }}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="flex-shrink-0 w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
            {index < navigationItems.length - 1 && (
              <div className="mx-4 my-1 border-t border-slate-800/50"></div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="flex-none px-3 pb-2">
        {bottomNavItems.map((item, index) => (
          <div key={item.id}>
            <Link
              to={item.to}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item);
              }}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="flex-shrink-0 w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
            {index < bottomNavItems.length - 1 && (
              <div className="mx-4 my-1 border-t border-slate-800/50"></div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default SidebarNav;
