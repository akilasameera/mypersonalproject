export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  category: 'main' | 'mine';
  status: 'active' | 'hold' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  notes: Note[];
  links: Link[];
  todos: Todo[];
  meetings: Meeting[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  dueDate?: string;
  statusCategory?: 'general' | 'current_status';
  statusType?: 'me' | 'customer';
  statusType?: 'me' | 'customer';
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  username?: string;
  password?: string;
  description?: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  startDate?: string;
  endDate?: string;
  dueDate?: string; // Keep for backward compatibility
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingDate: string;
  duration: number; // in minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  transcripts: MeetingTranscript[];
  summaries: MeetingSummary[];
  todos: MeetingTodo[];
}

export interface MeetingTranscript {
  id: string;
  content: string;
  speaker?: string;
  timestampInMeeting?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSummary {
  id: string;
  content: string;
  keyPoints?: string;
  actionItems?: string;
  decisions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingTodo {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConfiguration {
  id: string;
  projectId: string;
  isMaster: boolean;
  brdContent: string;
  createdAt: string;
  updatedAt: string;
  blocks: ConfiguratorBlock[];
}

export interface ConfiguratorBlock {
  id: string;
  configurationId: string;
  blockName: string;
  blockOrder: number;
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  textContent: string;
  isReadOnly?: boolean;
  sourceBlockId?: string;
  createdAt: string;
  updatedAt: string;
}