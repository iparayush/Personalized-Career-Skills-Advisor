
import React, { useState } from 'react';
import type { User, Skill } from '../types';
import { GraduationCapIcon, UserIcon } from '../components/icons';

interface OnboardingScreenProps {
  onProfileSubmit: (user: User) => void;
  initialUser: User;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onProfileSubmit, initialUser }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()).filter(Boolean) }));
  };
  
  const handleSkillChange = (index: number, field: keyof Skill, value: string | number) => {
    const updatedSkills = [...user.skills];
    (updatedSkills[index] as any)[field] = value;
    setUser(prev => ({ ...prev, skills: updatedSkills }));
  };

  const addSkill = () => {
    if (newSkill && !user.skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
        setUser(prev => ({ ...prev, skills: [...prev.skills, { name: newSkill, proficiency: 50 }] }));
        setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setUser(prev => ({ ...prev, skills: user.skills.filter((_, i) => i !== index) }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileSubmit(user);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white">Create Your Career Profile</h1>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Tell us about yourself to get personalized career guidance.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Basic Info */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                    <input type="text" name="name" id="name" value={user.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="education" className="text-sm font-medium text-slate-600 dark:text-slate-300">Education</label>
                    <input type="text" name="education" id="education" value={user.education} onChange={handleInputChange} placeholder="e.g., B.Sc. Computer Science" required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="major" className="text-sm font-medium text-slate-600 dark:text-slate-300">Major</label>
                    <input type="text" name="major" id="major" value={user.major} onChange={handleInputChange} placeholder="e.g., Computer Science" required className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
            </div>

            {/* Interests & Goals */}
            <div className="space-y-2">
                <label htmlFor="interests" className="text-sm font-medium text-slate-600 dark:text-slate-300">Interests (comma-separated)</label>
                <textarea name="interests" id="interests" value={user.interests.join(', ')} onChange={handleListChange} rows={3} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
                <label htmlFor="targetRoles" className="text-sm font-medium text-slate-600 dark:text-slate-300">Target Roles (comma-separated)</label>
                <textarea name="targetRoles" id="targetRoles" value={user.targetRoles.join(', ')} onChange={handleListChange} rows={3} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            {/* Skills */}
            <div className="space-y-4">
                 <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Skills & Proficiency</label>
                 <div className="space-y-4">
                     {user.skills.map((skill, index) => (
                         <div key={index} className="flex items-center gap-4">
                             <span className="w-1/4 font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
                             <input type="range" min="0" max="100" value={skill.proficiency} onChange={(e) => handleSkillChange(index, 'proficiency', parseInt(e.target.value))} className="w-1/2" />
                             <span className="w-1/12 text-center">{skill.proficiency}</span>
                             <button type="button" onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-700">&times;</button>
                         </div>
                     ))}
                 </div>
                 <div className="flex gap-2 pt-2">
                     <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a new skill" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                     <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Add</button>
                 </div>
            </div>

            <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Find My Career Path
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingScreen;
