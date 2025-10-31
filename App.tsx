import React, { useState } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import RoadmapScreen from './screens/RoadmapScreen';
import MentorChatScreen from './screens/MentorChatScreen';
import ResumeScreen from './screens/ResumeScreen';
import { Screen } from './types';
import type { User, Roadmap } from './types';
import { BriefcaseIcon, MapIcon, MessageSquareIcon, UserIcon, FileTextIcon } from './components/icons';


const mockUser: User = {
  name: 'Aisha Sharma',
  education: 'B.Sc. Computer Science',
  major: 'Computer Science',
  interests: ['Data Science', 'Machine Learning'],
  targetRoles: ['Data Analyst', 'Machine Learning Engineer'],
  skills: [
    { name: 'Python', proficiency: 60 },
    { name: 'Statistics', proficiency: 40 },
    { name: 'SQL', proficiency: 50 },
    { name: 'React', proficiency: 30 },
  ],
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Onboarding);
  const [user, setUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const handleProfileSubmit = (profile: User) => {
    setUser(profile);
    setCurrentScreen(Screen.Dashboard);
  };

  const handleNavigateToRoadmap = (role: string) => {
    setTargetRole(role);
    setCurrentScreen(Screen.Roadmap);
  };
  
  const handleNavigate = (screen: Screen) => {
      setCurrentScreen(screen);
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Onboarding:
        return <OnboardingScreen onProfileSubmit={handleProfileSubmit} initialUser={mockUser} />;
      case Screen.Dashboard:
        if (!user) return null;
        return <DashboardScreen user={user} roadmap={roadmap} onNavigateToRoadmap={handleNavigateToRoadmap} />;
      case Screen.Roadmap:
        if (!user || !targetRole) return null;
        return <RoadmapScreen user={user} targetRole={targetRole} onBack={() => setCurrentScreen(Screen.Dashboard)} roadmap={roadmap} setRoadmap={setRoadmap} />;
      case Screen.MentorChat:
        return <MentorChatScreen />;
      case Screen.Resume:
        if (!user) return null;
        return <ResumeScreen targetRole={targetRole || user.targetRoles[0] || ''} />;
      default:
        return <OnboardingScreen onProfileSubmit={handleProfileSubmit} initialUser={mockUser} />;
    }
  };
  
  if (currentScreen === Screen.Onboarding) {
      return renderScreen();
  }

  const navItems = [
    { screen: Screen.Dashboard, label: 'Dashboard', icon: <BriefcaseIcon className="h-5 w-5" /> },
    { screen: Screen.Roadmap, label: 'My Roadmap', icon: <MapIcon className="h-5 w-5" /> },
    { screen: Screen.MentorChat, label: 'AI Mentor', icon: <MessageSquareIcon className="h-5 w-5" /> },
    { screen: Screen.Resume, label: 'Resume Prep', icon: <FileTextIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <nav className="w-16 md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="flex items-center justify-center md:justify-start p-4 h-16 border-b border-slate-200 dark:border-slate-700">
            <GraduationCapIcon className="h-8 w-8 text-blue-500" />
            <span className="hidden md:inline ml-3 text-xl font-bold text-slate-800 dark:text-white">CareerAI</span>
        </div>
        <ul className="flex-1 py-4">
            {navItems.map(item => (
                <li key={item.screen}>
                    <button
                        disabled={item.screen === Screen.Roadmap && !targetRole}
                        onClick={() => handleNavigate(item.screen)}
                        className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                            currentScreen === item.screen
                            ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                        } ${item.screen === Screen.Roadmap && !targetRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {item.icon}
                        <span className="hidden md:inline ml-4">{item.label}</span>
                    </button>
                </li>
            ))}
        </ul>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
             <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-slate-500 dark:text-slate-300"/>
                </div>
                <div className="hidden md:inline ml-3">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.major}</p>
                </div>
            </div>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>
    </div>
  );
};

const GraduationCapIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c0 1.7.9 3.2 2.3 4l.7-1"></path>
      <path d="M18 12v5c0 1.7-.9 3.2-2.3 4l-.7-1"></path>
    </svg>
  );

export default App;
