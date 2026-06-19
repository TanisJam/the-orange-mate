import { createClient } from '@/lib/supabase/client';
import type {
  UserProfile,
  CreateUserProfileData,
  Interest,
  UserInterest,
  TravelPlan,
  CreateTravelPlanData,
  PlanNote,
  CreatePlanNoteData,
  PlanComment,
  CreatePlanCommentData,
  PlanJoinRequest,
  CreateJoinRequestData,
  PermissionLevel,
  UserFriend,
  EnrichedFriend,
  FriendStatus,
  Chat,
  Message,
  CreateMessageData,
  SearchFilters,
  PaginationParams,
  ApiResponse,
} from './types';

// Lazy import to avoid bundling server-only code in client components
async function getServerClient() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  return await createServerClient();
}

// User Profile Operations
export async function getUserProfile(userId: string, isServer = false): Promise<UserProfile | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  profileData: CreateUserProfileData,
  isServer = false
): Promise<UserProfile | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

export async function createUserProfile(
  userId: string,
  profileData: CreateUserProfileData,
  isServer = false
): Promise<UserProfile | null> {
  const supabase = isServer ? await getServerClient() : createClient();
   
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ id: userId, ...profileData })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}

export async function getUserProfileByUsername(username: string, isServer = false): Promise<UserProfile | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile by username:', error);
    return null;
  }

  return data;
}

export async function getUserPlanStats(userId: string, isServer = false): Promise<{ created: number; participating: number }> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const [createdResult, participatingResult] = await Promise.all([
    supabase
      .from('travel_plans')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId),
    supabase
      .from('plan_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  return {
    created: createdResult.error
      ? (console.error('Error counting created plans:', createdResult.error), 0)
      : (createdResult.count || 0),
    participating: participatingResult.error
      ? (console.error('Error counting participating plans:', participatingResult.error), 0)
      : (participatingResult.count || 0),
  };
}

// Interest Operations
export async function getAllInterests(isServer = false): Promise<Interest[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('interests')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching interests:', error);
    return [];
  }

  return data || [];
}

export async function getUserInterests(userId: string, isServer = false): Promise<UserInterest[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('user_interests')
    .select(`
      *,
      interest:interests(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user interests:', error);
    return [];
  }

  return data || [];
}

export async function addUserInterest(
  userId: string,
  interestId: string,
  isCustom = false,
  customName?: string,
  isServer = false
): Promise<UserInterest | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('user_interests')
    .insert({
      user_id: userId,
      interest_id: interestId,
      is_custom: isCustom,
      custom_name: customName
    })
    .select(`
      *,
      interest:interests(*)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error adding user interest:', error);
    return null;
  }

  return data;
}

export async function removeUserInterest(userInterestId: string, isServer = false): Promise<boolean> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { error } = await supabase
    .from('user_interests')
    .delete()
    .eq('id', userInterestId);

  if (error) {
    console.error('Error removing user interest:', error);
    return false;
  }

  return true;
}

// Travel Plan Operations
export async function getUserTravelPlans(userId: string, isServer = false): Promise<TravelPlan[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('travel_plans')
    .select(`
      *,
      creator:user_profiles!creator_id(*),
      participants:plan_participants(
        *,
        user:user_profiles(*)
      )
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user travel plans:', error);
    return [];
  }

  return data || [];
}

export async function getParticipatingPlans(userId: string, isServer = false): Promise<TravelPlan[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  // First get the plan IDs where user is a participant
  const { data: participantPlans, error: participantError } = await supabase
    .from('plan_participants')
    .select('plan_id')
    .eq('user_id', userId);

  if (participantError) {
    console.error('Error fetching participant plans:', participantError);
    return [];
  }

  if (!participantPlans || participantPlans.length === 0) {
    return [];
  }

  const planIds = participantPlans.map(p => p.plan_id);

  const { data, error } = await supabase
    .from('travel_plans')
    .select(`
      *,
      creator:user_profiles!creator_id(*),
      participants:plan_participants(
        *,
        user:user_profiles(*)
      )
    `)
    .in('id', planIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching participating plans:', error);
    return [];
  }

  return data || [];
}

export async function createTravelPlan(
  userId: string,
  planData: CreateTravelPlanData,
  isServer = false
): Promise<TravelPlan | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('travel_plans')
    .insert({
      creator_id: userId,
      ...planData
    })
    .select(`
      *,
      creator:user_profiles!creator_id(*),
      participants:plan_participants(
        *,
        user:user_profiles(*)
      )
    `)
    .maybeSingle();

  if (error) {
    console.error('Error creating travel plan:', error);
    return null;
  }

  // Auto-enroll creator as participant with editar permission
  if (data) {
    const { error: participantError } = await supabase
      .from('plan_participants')
      .insert({
        plan_id: data.id,
        user_id: userId,
        permission_level: 'editar'
      });

    if (participantError) {
      console.error('Error enrolling creator as participant:', participantError);
    }

    // Count actual participants and update the plan
    const { count: participantCount, error: countError } = await supabase
      .from('plan_participants')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', data.id);

    if (countError) {
      console.error('Error counting participants:', countError);
    }

    const { error: updateError } = await supabase
      .from('travel_plans')
      .update({ current_participants: participantCount || 1 })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating participant count:', updateError);
    }

    // Re-fetch to include the new participant record
    const { data: refreshed } = await supabase
      .from('travel_plans')
      .select(`
        *,
        creator:user_profiles!creator_id(*),
        participants:plan_participants(
          *,
          user:user_profiles(*)
        )
      `)
      .eq('id', data.id)
      .maybeSingle();

    return refreshed ?? data;
  }

  return data;
}

export async function updateTravelPlan(
  planId: string,
  planData: Partial<CreateTravelPlanData>,
  isServer = false
): Promise<TravelPlan | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('travel_plans')
    .update(planData)
    .eq('id', planId)
    .select(`
      *,
      creator:user_profiles!creator_id(*),
      participants:plan_participants(
        *,
        user:user_profiles(*)
      )
    `)
    .maybeSingle();

  if (error) {
    console.error('Error updating travel plan:', error);
    return null;
  }

  return data;
}

export async function deleteTravelPlan(planId: string, isServer = false): Promise<boolean> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { error } = await supabase
    .from('travel_plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error('Error deleting travel plan:', error);
    return false;
  }

  return true;
}

// Search Operations
export async function searchTravelPlans(
  filters: SearchFilters,
  pagination: PaginationParams = { page: 1, limit: 10 },
  isServer = false
): Promise<ApiResponse<TravelPlan[]>> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  let query = supabase
    .from('travel_plans')
    .select(`
      *,
      creator:user_profiles!creator_id(*),
      participants:plan_participants(
        *,
        user:user_profiles(*)
      )
    `, { count: 'exact' })
    .eq('is_public', true);

  // Apply filters
  if (filters.plan_type) {
    query = query.eq('plan_type', filters.plan_type);
  }

  if (filters.destinations && filters.destinations.length > 0) {
    query = query.overlaps('destinations', filters.destinations);
  }

  if (filters.start_date) {
    query = query.gte('start_date', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('end_date', filters.end_date);
  }

  if (filters.max_participants) {
    query = query.lte('max_participants', filters.max_participants);
  }

  if (filters.share_accommodation !== undefined) {
    query = query.eq('share_accommodation', filters.share_accommodation);
  }

  if (filters.share_transport !== undefined) {
    query = query.eq('share_transport', filters.share_transport);
  }

  if (filters.share_tours !== undefined) {
    query = query.eq('share_tours', filters.share_tours);
  }

  if (filters.budget_min !== undefined) {
    query = query.gte('budget_range_min', filters.budget_min);
  }

  if (filters.budget_max !== undefined) {
    query = query.lte('budget_range_max', filters.budget_max);
  }

  if (filters.currency) {
    query = query.eq('currency', filters.currency);
  }

  // Apply pagination
  const from = ((pagination.page || 1) - 1) * (pagination.limit || 10);
  const to = from + (pagination.limit || 10) - 1;
  
  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching travel plans:', error);
    return { data: [], error: error.message, count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getTravelPlan(planId: string, isServer = false): Promise<TravelPlan | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('travel_plans')
    .select(`
      *,
      creator:user_profiles!creator_id(*),
      participants:plan_participants(
        *,
        user:user_profiles(*)
      )
    `)
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching travel plan:', error);
    return null;
  }

  return data;
}

// Plan Join Request Operations
export async function createJoinRequest(
  userId: string,
  requestData: CreateJoinRequestData,
  isServer = false
): Promise<PlanJoinRequest | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_join_requests')
    .upsert({
      requester_id: userId,
      status: requestData.status || 'pending',
      ...requestData
    }, { onConflict: 'plan_id,requester_id' })
    .select(`
      *,
      requester:user_profiles!requester_id(*),
      plan:travel_plans(*)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error creating join request:', error);
    return null;
  }

  return data;
}

export async function updateJoinRequest(
  requestId: string,
  status: 'accepted' | 'rejected' | 'waiting_list',
  isServer = false,
  permission_level: PermissionLevel = 'solo_ver'
): Promise<PlanJoinRequest | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_join_requests')
    .update({ 
      status, 
      responded_at: new Date().toISOString() 
    })
    .eq('id', requestId)
    .select(`
      *,
      requester:user_profiles!requester_id(*),
      plan:travel_plans(*)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error updating join request:', error);
    return null;
  }

  // If accepted, add user to plan participants with the specified permission
  if (status === 'accepted' && data) {
    const { error: upsertError } = await supabase
      .from('plan_participants')
      .upsert({
        plan_id: data.plan_id,
        user_id: data.requester_id,
        permission_level
      }, { onConflict: 'plan_id,user_id' });

    if (upsertError) {
      console.error('Error upserting plan participant:', upsertError);
    }

    // Update participant count based on actual participants
    const { count: participantCount, error: countError } = await supabase
      .from('plan_participants')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', data.plan_id);

    if (countError) {
      console.error('Error counting participants:', countError);
    }

    const { error: updateError } = await supabase
      .from('travel_plans')
      .update({ current_participants: participantCount || 0 })
      .eq('id', data.plan_id);

    if (updateError) {
      console.error('Error updating participant count:', updateError);
    }
  }

  return data;
}

export async function getPlanJoinRequests(planId: string, isServer = false): Promise<PlanJoinRequest[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_join_requests')
    .select(`
      *,
      requester:user_profiles!requester_id(*)
    `)
    .eq('plan_id', planId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching join requests:', error);
    return [];
  }

  return data || [];
}

// Chat Operations
export async function getOrCreateChat(userId1: string, userId2: string, isServer = false): Promise<Chat | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  // Use the database function
  const { data: chatId, error } = await supabase
    .rpc('get_or_create_chat', { user1_id: userId1, user2_id: userId2 });

  if (error) {
    console.error('Error getting/creating chat:', error);
    return null;
  }

  // Fetch the full chat data
  const { data: chat, error: fetchError } = await supabase
    .from('chats')
    .select(`
      *,
      participant_1:user_profiles!participant_1_id(*),
      participant_2:user_profiles!participant_2_id(*)
    `)
    .eq('id', chatId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching chat data:', fetchError);
    return null;
  }

  return chat;
}

export async function getUserChats(userId: string, isServer = false): Promise<Chat[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      participant_1:user_profiles!participant_1_id(id, username, full_name, avatar_url),
      participant_2:user_profiles!participant_2_id(id, username, full_name, avatar_url),
      last_message:messages(content, created_at, sender_id)
    `)
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user chats:', error);
    return [];
  }

  return data || [];
}

export async function getChatMessages(chatId: string, isServer = false): Promise<Message[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:user_profiles!sender_id(id, username, full_name, avatar_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }

  return data || [];
}

export async function sendMessage(
  userId: string,
  messageData: CreateMessageData,
  isServer = false
): Promise<Message | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: userId,
      ...messageData
    })
    .select(`
      *,
      sender:user_profiles!sender_id(id, username, full_name, avatar_url)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  // Update chat timestamp
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', messageData.chat_id);

  return data;
}

// Plan Notes Operations
export async function getPlanNotes(planId: string, isServer = false): Promise<PlanNote[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_notes')
    .select(`
      *,
      author:user_profiles!author_id(*)
    `)
    .eq('plan_id', planId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching plan notes:', error);
    return [];
  }

  return data || [];
}

export async function createPlanNote(
  userId: string,
  noteData: CreatePlanNoteData,
  isServer = false
): Promise<PlanNote | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_notes')
    .insert({
      author_id: userId,
      ...noteData
    })
    .select(`
      *,
      author:user_profiles!author_id(*)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error creating plan note:', error);
    return null;
  }

  return data;
}

// Plan Comments Operations
export async function getPlanComments(planId: string, isServer = false): Promise<PlanComment[]> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_comments')
    .select(`
      *,
      author:user_profiles!author_id(id, username, full_name, avatar_url)
    `)
    .eq('plan_id', planId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plan comments:', error);
    return [];
  }

  return data || [];
}

export async function createPlanComment(
  userId: string,
  commentData: CreatePlanCommentData,
  isServer = false
): Promise<PlanComment | null> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { data, error } = await supabase
    .from('plan_comments')
    .insert({
      author_id: userId,
      ...commentData
    })
    .select(`
      *,
      author:user_profiles!author_id(id, username, full_name, avatar_url)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error creating plan comment:', error);
    return null;
  }

  return data;
}

export async function deletePlanComment(commentId: string, isServer = false): Promise<boolean> {
  const supabase = isServer ? await getServerClient() : createClient();
  
  const { error } = await supabase
    .from('plan_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting plan comment:', error);
    return false;
  }

  return true;
}

// Friend Operations

export async function sendFriendRequest(
  userId: string,
  friendId: string,
  isServer = false
): Promise<UserFriend | null> {
  if (userId === friendId) return null;

  const supabase = isServer ? await getServerClient() : createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .upsert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending',
    }, { onConflict: 'user_id,friend_id' })
    .select(`
      *,
      friend:user_profiles!friend_id(id, username, full_name, avatar_url)
    `)
    .maybeSingle();

  if (error) {
    // Unique constraint violation (duplicate) or self-request check constraint
    console.error('Error sending friend request:', error);
    return null;
  }

  return data;
}

export async function acceptFriendRequest(
  requestId: string,
  isServer = false
): Promise<UserFriend | null> {
  const supabase = isServer ? await getServerClient() : createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select(`
      *,
      friend:user_profiles!friend_id(id, username, full_name, avatar_url)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error accepting friend request:', error);
    return null;
  }

  return data;
}

export async function rejectFriendRequest(
  requestId: string,
  isServer = false
): Promise<UserFriend | null> {
  const supabase = isServer ? await getServerClient() : createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .select(`
      *,
      friend:user_profiles!friend_id(id, username, full_name, avatar_url)
    `)
    .maybeSingle();

  if (error) {
    console.error('Error rejecting friend request:', error);
    return null;
  }

  return data;
}

export async function getFriendStatus(
  userId: string,
  peerId: string,
  isServer = false
): Promise<{ id: string; status: FriendStatus; isSender: boolean } | null> {
  const supabase = isServer ? await getServerClient() : createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .select('id, status, user_id, friend_id')
    .or(
      `and(user_id.eq.${userId},friend_id.eq.${peerId}),and(user_id.eq.${peerId},friend_id.eq.${userId})`
    )
    .maybeSingle();

  if (error) {
    console.error('Error fetching friend status:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    status: data.status as FriendStatus,
    isSender: data.user_id === userId,
  };
}

export async function getFriends(
  userId: string,
  isServer = false
): Promise<EnrichedFriend[]> {
  const supabase = isServer ? await getServerClient() : createClient();

  // Two parallel queries: I'm the sender (friend is friend_id) + I'm the recipient (friend is user_id)
  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from('user_friends')
      .select(`*, friend:user_profiles!friend_id(id, username, full_name, avatar_url)`)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false }),
    supabase
      .from('user_friends')
      .select(`*, friend:user_profiles!user_id(id, username, full_name, avatar_url)`)
      .eq('friend_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false }),
  ]);

  if (sentResult.error) {
    console.error('Error fetching sent friends:', sentResult.error);
  }
  if (receivedResult.error) {
    console.error('Error fetching received friends:', receivedResult.error);
  }

  const sentFriends = (sentResult.data || []) as EnrichedFriend[];
  const receivedFriends = (receivedResult.data || []) as EnrichedFriend[];

  // Merge and sort by created_at descending
  const allFriends = [...sentFriends, ...receivedFriends].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allFriends;
}

export async function getPendingRequests(
  userId: string,
  isServer = false
): Promise<EnrichedFriend[]> {
  const supabase = isServer ? await getServerClient() : createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .select(`*, friend:user_profiles!user_id(id, username, full_name, avatar_url)`)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return (data || []) as EnrichedFriend[];
}

export async function getSentRequests(
  userId: string,
  isServer = false
): Promise<EnrichedFriend[]> {
  const supabase = isServer ? await getServerClient() : createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .select(`*, friend:user_profiles!friend_id(id, username, full_name, avatar_url)`)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sent requests:', error);
    return [];
  }

  return (data || []) as EnrichedFriend[];
}