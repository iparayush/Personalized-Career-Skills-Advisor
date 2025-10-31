export enum Screen {
  Onboarding,
  Dashboard,
  Roadmap,
  MentorChat,
  Resume,
}

export interface Skill {
  name: string;
  proficiency: number;
}

export interface User {
  name: string;
  education: string;
  major: string;
  interests: string[];
  targetRoles: string[];
  skills: Skill[];
}

export interface Milestone {
  title: string;
  type: 'course' | 'project' | 'certification' | 'task';
  description: string;
  resources: string[];
  status: 'todo' | 'in_progress' | 'done';
}

export interface Roadmap {
  targetRole: string;
  milestones: Milestone[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export interface CareerSuggestion {
    name: string;
    description: string;
    skills: string[];
}
