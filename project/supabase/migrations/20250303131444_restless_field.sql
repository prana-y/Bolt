/*
  # Initial Schema Setup for Support Community Platform

  1. Authentication and Profiles
    - `profiles` table for user profiles
    - RLS policies for profiles

  2. Communities
    - `communities` table for community groups
    - `channels` table for community channels
    - `community_members` table for community membership
    - RLS policies for communities

  3. Messaging
    - `messages` table for channel messages
    - `conversations` table for direct messaging
    - `conversation_participants` table for conversation members
    - `direct_messages` table for private messages
    - RLS policies for messaging

  4. Content
    - `job_posts` table for job listings
    - `resources` table for shared resources
    - RLS policies for content

  5. Engagement
    - `reactions` table for emoji reactions
    - `notifications` table for user notifications
    - RLS policies for engagement
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  member_count INT DEFAULT 1
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, community_id)
);

-- Messages table (for channel messages)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Conversations table (for direct messaging)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Direct messages
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Reactions (for messages and direct messages)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji TEXT NOT NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  direct_message_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT one_target_only CHECK (
    (message_id IS NULL AND direct_message_id IS NOT NULL) OR
    (message_id IS NOT NULL AND direct_message_id IS NULL)
  )
);

-- Job posts
CREATE TABLE IF NOT EXISTS job_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_range TEXT,
  application_url TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'tool', 'other')),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'mention', 'reaction', 'community_invite', 'job_post')),
  content TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT CHECK (reference_type IN ('message', 'direct_message', 'community', 'job_post')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION increment_member_count(community_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE communities
  SET member_count = member_count + 1
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_member_count(community_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE communities
  SET member_count = GREATEST(0, member_count - 1)
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Communities
CREATE POLICY "Communities are viewable by everyone" 
ON communities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" 
ON communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Community admins can update communities" 
ON communities FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM community_members 
    WHERE community_id = communities.id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Channels
CREATE POLICY "Channels are viewable by everyone" 
ON channels FOR SELECT USING (true);

CREATE POLICY "Community admins and moderators can create channels" 
ON channels FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM community_members 
    WHERE community_id = channels.community_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Community Members
CREATE POLICY "Community membership is viewable by everyone" 
ON community_members FOR SELECT USING (true);

CREATE POLICY "Users can join communities" 
ON community_members FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can leave communities" 
ON community_members FOR DELETE USING (
  auth.uid() = user_id
);

-- Messages
CREATE POLICY "Messages are viewable by everyone" 
ON messages FOR SELECT USING (true);

CREATE POLICY "Community members can send messages" 
ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM channels 
    JOIN community_members ON channels.community_id = community_members.community_id 
    WHERE channels.id = messages.channel_id 
    AND community_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON messages FOR UPDATE USING (
  auth.uid() = user_id
);

-- Conversations
CREATE POLICY "Users can view their conversations" 
ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create conversations" 
ON conversations FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Conversation Participants
CREATE POLICY "Users can view conversation participants" 
ON conversation_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants AS cp 
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add themselves to conversations" 
ON conversation_participants FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Direct Messages
CREATE POLICY "Users can view messages in their conversations" 
ON direct_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = direct_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send direct messages in their conversations" 
ON direct_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = direct_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- Reactions
CREATE POLICY "Reactions are viewable by everyone" 
ON reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" 
ON reactions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own reactions" 
ON reactions FOR DELETE USING (
  auth.uid() = user_id
);

-- Job Posts
CREATE POLICY "Job posts are viewable by everyone" 
ON job_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create job posts" 
ON job_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own job posts" 
ON job_posts FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own job posts" 
ON job_posts FOR DELETE USING (
  auth.uid() = user_id
);

-- Resources
CREATE POLICY "Resources are viewable by everyone" 
ON resources FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" 
ON resources FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own resources" 
ON resources FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own resources" 
ON resources FOR DELETE USING (
  auth.uid() = user_id
);

-- Notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "System can create notifications" 
ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read" 
ON notifications FOR UPDATE USING (
  auth.uid() = user_id
);

-- Triggers for member count
CREATE OR REPLACE FUNCTION handle_community_member_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM increment_member_count(NEW.community_id);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM decrement_member_count(OLD.community_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_member_count_trigger
AFTER INSERT OR DELETE ON community_members
FOR EACH ROW EXECUTE FUNCTION handle_community_member_count();