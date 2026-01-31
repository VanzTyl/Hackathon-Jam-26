import { supabase } from '@/supabase-client';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  created_at: string;
  updated_at: string;
  masked_name?: string;
  current_mask?: 'student' | 'mentor';
}

export interface Mentee {
  mentee_id: string;
  user_id: string;
  masked_name: string;
  created_at: string;
  updated_at: string;
}

export interface Mentor {
  mentor_id: string;
  user_id: string;
  masked_name: string;
  created_at: string;
  updated_at: string;
}

export interface Signal {
  signal_id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  masked_name?: string;
  mentor_masked_name?: string;
  status: 'open' | 'waiting_for_approval' | 'helping' | 'closed';
  assigned_mentor_user_id?: string;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    masked_name: string;
    mask: 'mentor' | 'student';
  };
}

export interface ForumPost {
  post_id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_anonymous: boolean;
  masked_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ForumResponse {
  response_id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ForumBookmark {
  bookmark_id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Connection {
  connection_id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface SignalChat {
  signalchatid: string;
  signal_id: string;
  created_at: string;
}

export interface SignalChatUser {
  signalchatid: string;
  user_id: string;
  role: 'student' | 'mentor';
}

export interface SignalMessage {
  message_id: string;
  signalchatid: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    masked_name: string;
    first_name: string;
    last_name: string;
  };
}

export async function createUser(userData: Omit<User, 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMentee(userId: string) {
  const { data, error } = await supabase
    .from('mentees')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMentor(userId: string) {
  const { data, error } = await supabase
    .from('mentors')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function createMentee(menteeData: Omit<Mentee, 'mentee_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('mentees')
    .insert([menteeData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMentor(mentorData: Omit<Mentor, 'mentor_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('mentors')
    .insert([mentorData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSignal(signalData: Omit<Signal, 'signal_id' | 'created_at' | 'updated_at'>, maskedName: string) {
  const { data: signal, error: signalError } = await supabase
    .from('signals')
    .insert([{ ...signalData, masked_name: maskedName }])
    .select('*')
    .single();

  if (signalError) throw signalError;

  try {
    const { data: chatData, error: chatError } = await supabase
      .from('signalchat') 
      .insert([{ signal_id: signal.signal_id }])
      .select()
      .single();

    if (chatError) throw chatError;

    const chatID = chatData.signalchatid;

    const { error: userError } = await supabase
      .from('signalchatusers')
      .insert([{
        signalchatid: chatID, 
        user_id: signalData.user_id,
        role: 'student'
      }]);

    if (userError) throw userError;
  } catch (chatError: any) {
    console.error('Error creating chat room:', chatError);
  }

  return signal;
}

export async function getSignals(userId?: string) {
  let query = supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const signals = data || [];

  const { data: allMentors } = await supabase
    .from('mentors')
    .select('user_id, masked_name');

  const mentorMap = new Map(allMentors?.map(m => [m.user_id, m.masked_name]) || []);

  return signals.map((signal: any) => ({
    ...signal,
    user: {
      masked_name: signal.masked_name || 'Anonymous',
      mask: 'student',
      mentor_masked_name: signal.assigned_mentor_user_id ? mentorMap.get(signal.assigned_mentor_user_id) : undefined
    }
  }));
}

export async function getSignalById(signalId: string) {
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .eq('signal_id', signalId)
    .single();

  if (error) throw error;

  return {
    ...data,
    user: {
      masked_name: (data as any).masked_name || 'Anonymous',
      mask: 'student'
    }
  };
}

export async function updateSignal(signalId: string, updates: Partial<Signal>) {
  const { data, error } = await supabase
    .from('signals')
    .update(updates)
    .eq('signal_id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSignal(signalId: string) {
  const { error } = await supabase
    .from('signals')
    .delete()
    .eq('signal_id', signalId);

  if (error) throw error;
}

export async function createSignalChat(signalId: string) {
  const { data, error } = await supabase
    .from('signalchat')
    .insert([{ signal_id: signalId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSignalChat(signalId: string) {
  try {
    const { data, error } = await supabase
      .from('signalchat')
      .select('*')
      .eq('signal_id', signalId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chat:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error in getSignalChat:', error);
    throw error;
  }
}

export async function addUserToSignalChat(signalChatId: string, userId: string, role: 'student' | 'mentor') {
  const { data, error } = await supabase
    .from('signalchatusers')
    .insert([{ signalchatid: signalChatId, user_id: userId, role }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSignalChatUsers(signalChatId: string) {
  const { data, error } = await supabase
    .from('signalchatusers')
    .select(`
      *,
      user:users (
        first_name,
        last_name,
        masked_name
      )
    `)
    .eq('signalchatid', signalChatId);

  if (error) throw error;
  return data || [];
}

export async function createSignalMessage(messageData: Omit<SignalMessage, 'message_id' | 'created_at' | 'sender'>) {
  const { data, error } = await supabase
    .from('signalmessages')
    .insert([messageData])
    .select(`
      *,
      sender:users (
        first_name,
        last_name,
        masked_name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getSignalMessages(signalChatId: string) {
  try {
    const { data, error } = await supabase
      .from('signalmessages')
      .select('*')
      .eq('signalchatid', signalChatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    const messages = data || [];

    if (messages.length === 0) {
      return [];
    }

    const senderIds = [...new Set(messages.map(m => m.sender_id))];

    const [mentors, mentees] = await Promise.all([
      supabase.from('mentors').select('user_id, masked_name').in('user_id', senderIds),
      supabase.from('mentees').select('user_id, masked_name').in('user_id', senderIds)
    ]);

    const senderMap = new Map();
    mentors?.data?.forEach(m => senderMap.set(m.user_id, m.masked_name));
    mentees?.data?.forEach(m => senderMap.set(m.user_id, m.masked_name));

    return messages.map(m => ({
      ...m,
      sender: {
        masked_name: senderMap.get(m.sender_id) || 'Anonymous',
        first_name: '',
        last_name: ''
      }
    }));
  } catch (error: any) {
    console.error('Error in getSignalMessages:', error);
    throw error;
  }
}

export async function getCurrentMentee(userId: string) {
  const { data, error } = await supabase
    .from('mentees')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching mentee:', error);
    return null;
  }

  return data;
}

export async function getCurrentMentor(userId: string) {
  const { data, error } = await supabase
    .from('mentors')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching mentor:', error);
    return null;
  }

  return data;
}

export async function getCurrentMode(userId: string): Promise<'student' | 'mentor'> {
  const { data: user } = await supabase
    .from('users')
    .select('current_mask')
    .eq('user_id', userId)
    .maybeSingle();

  return (user?.current_mask as 'student' | 'mentor') || 'student';
}

export async function swapMask(userId: string, newMode: 'student' | 'mentor') {
  const user = await getUser(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const currentMentee = await getCurrentMentee(userId);
  const currentMentor = await getCurrentMentor(userId);

  if (newMode === 'student') {
    if (!currentMentee) {
      const newMaskedName = generateMaskedName();
      await createMentee({ user_id: userId, masked_name: newMaskedName });
    }
    const maskedName = currentMentee?.masked_name || (await getCurrentMentee(userId))?.masked_name;
    await supabase.from('users').update({ current_mask: 'student' }).eq('user_id', userId);
    return { role: 'student', masked_name: maskedName || '' };
  } else {
    if (!currentMentor) {
      const newMaskedName = generateMaskedName();
      await createMentor({ user_id: userId, masked_name: newMaskedName });
    }
    const maskedName = currentMentor?.masked_name || (await getCurrentMentor(userId))?.masked_name;
    await supabase.from('users').update({ current_mask: 'mentor' }).eq('user_id', userId);
    return { role: 'mentor', masked_name: maskedName || '' };
  }
}

export async function updateMentee(menteeId: string, updates: Partial<Mentee>) {
  const { data, error } = await supabase
    .from('mentees')
    .update(updates)
    .eq('mentee_id', menteeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMentor(mentorId: string, updates: Partial<Mentor>) {
  const { data, error } = await supabase
    .from('mentors')
    .update(updates)
    .eq('mentor_id', mentorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createForumPost(postData: Omit<ForumPost, 'post_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert([postData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getForumPosts() {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      user:users (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createForumResponse(responseData: Omit<ForumResponse, 'response_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('forum_responses')
    .insert([responseData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getForumResponses(postId: string) {
  const { data, error } = await supabase
    .from('forum_responses')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createForumBookmark(bookmarkData: Omit<ForumBookmark, 'bookmark_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('forum_bookmarks')
    .insert([bookmarkData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createConnection(connectionData: Omit<Connection, 'connection_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('connections')
    .insert([connectionData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMentorHelpRequest(signalId: string, mentorUserId: string, menteeUserId: string) {
  const { data, error } = await supabase
    .from('signals')
    .update({
      assigned_mentor_user_id: mentorUserId,
      assigned_at: new Date().toISOString(),
      status: 'waiting_for_approval'
    })
    .eq('signal_id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptMentorHelpRequest(signalId: string, mentorUserId: string) {
  const { data: mentorData } = await supabase
    .from('mentors')
    .select('masked_name')
    .eq('user_id', mentorUserId)
    .maybeSingle();

  const { data, error } = await supabase
    .from('signals')
    .update({
      status: 'helping'
    })
    .eq('signal_id', signalId)
    .select()
    .single();

  if (error) throw error;
  return { ...data, mentor_masked_name: mentorData?.masked_name };
}

export async function rejectMentorHelpRequest(signalId: string) {
  const { data, error } = await supabase
    .from('signals')
    .update({
      status: 'open',
      assigned_mentor_user_id: null,
      assigned_at: null
    })
    .eq('signal_id', signalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinSignalChat(signalId: string, mentorUserId: string) {
  const { data: existingChat } = await supabase
    .from('signalchat')
    .select('*')
    .eq('signal_id', signalId)
    .maybeSingle();

  let chatId;

  if (!existingChat) {
    const { data: newChat } = await supabase
      .from('signalchat')
      .insert([{ signal_id: signalId }])
      .select()
      .single();
    chatId = newChat?.signalchatid;
  } else {
    chatId = existingChat.signalchatid;
  }

  await supabase
    .from('signalchatusers')
    .upsert([{
      signalchatid: chatId,
      user_id: mentorUserId,
      role: 'mentor'
    }], {
      onConflict: 'signalchatid,user_id'
    });

  return chatId;
}

export function generateMaskedName(): string {
  const adjectives = ['Secret', 'Hidden', 'Mighty', 'Swift', 'Silent', 'Golden', 'Neon', 'Brave', 'Scaredy', 'Cute', 'Evil', 'Global', 'Social', 'Silly', 'Giving', 'Elden', 'Masked', 'Anonymous'];
  const animals = ['Panda', 'Eagle', 'Fox', 'Lion', 'Cat', 'Wolf', 'Tiger', 'Owl', 'Kitty', 'Coffee', 'Bear', 'Jammer', 'Hacker', 'Whale', 'Shark', 'Seal', 'Goober', 'Teacup', 'Beaver', 'Mouse'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900);
  
  return `${randomAdjective}${randomAnimal}${randomNumber}`;
}