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
    <nav className="h-full flex flex-col justify-between">
      <div className="py-6">
        <div className="px-4 mb-4 flex justify-between items-center">
          <span className="text-sm font-medium text-white font-outfit">Overview</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ver 1.0</span>
        </div>
        <div className="space-y-0.5 px-3">
          {navigationItems.map((item, index) => (
            <div key={item.id}>
              <Link
                to={item.to}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4 text-white" />
                <span className="ml-3 font-outfit">{item.name}</span>
              </Link>
              {index < navigationItems.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1 mx-4 opacity-50"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 pb-4">
        {bottomNavItems.map((item, index) => (
          <div key={item.id}>
            <Link
              to={item.to}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item);
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-white hover:text-white/80 hover:bg-white/10"
            >
              <item.icon className="w-4 h-4 text-white" />
              <span className="ml-3 font-outfit">{item.name}</span>
            </Link>
            {index < bottomNavItems.length - 1 && (
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1 mx-4 opacity-50"></div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default SidebarNav;
