import React, { useState, useEffect } from 'react';
import type { User, Roadmap, Milestone } from '../types';
import { generateLearningRoadmap } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { GraduationCapIcon, BriefcaseIcon, CheckCircleIcon, CircleIcon } from '../components/icons';

interface RoadmapScreenProps {
  user: User;
  targetRole: string;
  onBack: () => void;
  roadmap: Roadmap | null;
  setRoadmap: (roadmap: Roadmap) => void;
}

const RoadmapScreen: React.FC<RoadmapScreenProps> = ({ user, targetRole, onBack, roadmap, setRoadmap }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roadmap || roadmap.targetRole !== targetRole) {
      const fetchRoadmap = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const milestones = await generateLearningRoadmap(user, targetRole);
          setRoadmap({ targetRole, milestones });
        } catch (err) {
          setError('Failed to generate your learning roadmap. Please try again.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRoadmap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, targetRole]);

  const toggleMilestoneStatus = (index: number) => {
    if (roadmap) {
      const newMilestones = [...roadmap.milestones];
      const currentStatus = newMilestones[index].status;
      newMilestones[index].status = currentStatus === 'done' ? 'todo' : 'done';
      setRoadmap({ ...roadmap, milestones: newMilestones });
    }
  };
  
  const getIconForType = (type: Milestone['type']) => {
    switch (type) {
        case 'course': return <GraduationCapIcon className="h-6 w-6 text-white" />;
        case 'project': return <BriefcaseIcon className="h-6 w-6 text-white" />;
        case 'certification': return <CheckCircleIcon className="h-6 w-6 text-white" />;
        default: return <CircleIcon className="h-6 w-6 text-white" />;
    }
  };

  if (isLoading || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <LoadingSpinner />
        <p className="mt-4 text-lg">Generating your personalized roadmap to become a {targetRole}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={onBack} className="mt-4 bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
            Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Your Roadmap to {targetRole}</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Follow these milestones to achieve your career goal.</p>
            </div>
            <button onClick={onBack} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                Back
            </button>
        </div>
        
        <div className="relative border-l-2 border-blue-500 ml-4">
          {roadmap?.milestones.map((milestone, index) => (
            <div key={index} className="mb-10 ml-10">
              <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full ring-8 ring-white dark:ring-slate-900">
                {getIconForType(milestone.type)}
              </span>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 relative">
                 <h3 className="flex items-center mb-1 text-xl font-semibold text-slate-900 dark:text-white">
                    {milestone.title}
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium ml-3 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 capitalize">{milestone.type}</span>
                </h3>
                <p className="mb-4 text-base font-normal text-slate-500 dark:text-slate-400">{milestone.description}</p>
                {milestone.resources.length > 0 && (
                    <a href={milestone.resources[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-lg hover:bg-blue-200 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                        Learn more
                    </a>
                )}
                 <button onClick={() => toggleMilestoneStatus(index)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    {milestone.status === 'done' ? 
                        <CheckCircleIcon className="h-6 w-6 text-green-500" /> : 
                        <CircleIcon className="h-6 w-6 text-slate-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapScreen;
