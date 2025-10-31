import React, { useState, useEffect } from 'react';
import type { User, CareerSuggestion, Roadmap } from '../types';
import { generateCareerSuggestions } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardScreenProps {
  user: User;
  roadmap: Roadmap | null;
  onNavigateToRoadmap: (targetRole: string) => void;
}

// Fix: Moved ProgressCircle and SkillProgressBar outside of DashboardScreen component
const ProgressCircle = ({ percentage }: { percentage: number }) => {
  const strokeWidth = 10;
  const radius = 50;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
      <div className="relative flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="-rotate-90">
              <circle stroke="currentColor" fill="transparent" strokeWidth={strokeWidth} r={normalizedRadius} cx={radius} cy={radius} className="text-slate-200 dark:text-slate-700" />
              <circle stroke="currentColor" fill="transparent" strokeWidth={strokeWidth} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} r={normalizedRadius} cx={radius} cy={radius} className="text-blue-500 transition-all duration-500" />
          </svg>
          <span className="absolute text-2xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
      </div>
  );
};

const SkillProgressBar = ({ skill, proficiency }: { skill: string; proficiency: number }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill}</span>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{proficiency}%</span>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${proficiency}%` }}></div>
    </div>
  </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, roadmap, onNavigateToRoadmap }) => {
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await generateCareerSuggestions(user);
        setSuggestions(result);
      } catch (err) {
        setError('Failed to fetch career suggestions. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const completedMilestones = roadmap?.milestones.filter(m => m.status === 'done').length || 0;
  const totalMilestones = roadmap?.milestones.length || 0;
  const averageProficiency = user.skills.reduce((acc, skill) => acc + skill.proficiency, 0) / (user.skills.length || 1);
  const roadmapProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const readinessScore = Math.round((averageProficiency + roadmapProgress) / 2);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Here's your personalized career dashboard.</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">AI Career Suggestions</h2>
          {isLoading && <div className="flex justify-center p-12"><LoadingSpinner /></div>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestions.length > 0 ? suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{suggestion.name}</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">{suggestion.description}</p>
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm">Key Skills:</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestion.skills.map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onNavigateToRoadmap(suggestion.name)} className="mt-6 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    Generate Roadmap
                  </button>
                </div>
              )) : <p>No career suggestions found. Try updating your profile.</p>}
            </div>
          )}
        </div>
        
        <aside className="space-y-6">
           <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Progress Summary</h2>
                <div className="flex flex-col items-center space-y-4">
                    <ProgressCircle percentage={readinessScore} />
                    <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">Career Readiness</p>
                    {roadmap && (
                        <div className="w-full text-center pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                            <p className="font-semibold text-slate-800 dark:text-white text-xl">{completedMilestones} / {totalMilestones}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Milestones Completed</p>
                        </div>
                    )}
                </div>
            </div>
           <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">My Skills</h2>
                <div className="space-y-4">
                    {user.skills.map((skill, index) => (
                        <SkillProgressBar key={index} skill={skill.name} proficiency={skill.proficiency} />
                    ))}
                </div>
           </div>
        </aside>
      </main>
    </div>
  );
};

export default DashboardScreen;