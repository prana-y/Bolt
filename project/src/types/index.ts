export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  created_at: string;
  last_seen?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  image_url?: string;
  member_count: number;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  community_id: string;
  created_at: string;
  created_by: string;
}

export interface Message {
  id: string;
  content: string;
  channel_id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  user?: User;
  reactions?: Reaction[];
}

export interface DirectMessage {
  id: string;
  content: string;
  conversation_id: string;
  sender_id: string;
  created_at: string;
  updated_at?: string;
  sender?: User;
  reactions?: Reaction[];
}

export interface Conversation {
  id: string;
  created_at: string;
  participants: User[];
  last_message?: DirectMessage;
}

export interface Reaction {
  id: string;
  emoji: string;
  message_id?: string;
  direct_message_id?: string;
  user_id: string;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'mention' | 'reaction' | 'community_invite' | 'job_post';
  content: string;
  reference_id?: string;
  reference_type?: 'message' | 'direct_message' | 'community' | 'job_post';
  is_read: boolean;
  created_at: string;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  application_url?: string;
  user_id: string;
  created_at: string;
  expires_at?: string;
  user?: User;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'video' | 'tool' | 'other';
  user_id: string;
  created_at: string;
  user?: User;
}

export interface CommunityMember {
  user_id: string;
  community_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
  user?: User;
}