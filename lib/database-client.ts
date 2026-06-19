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
  SearchFilters,
  PaginationParams,
  ApiResponse,
} from './types';

// User Profile Operations (Client-side)
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  
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
  profileData: CreateUserProfileData
): Promise<UserProfile | null> {
  const supabase = createClient();
  
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
  profileData: CreateUserProfileData
): Promise<UserProfile | null> {
  const supabase = createClient();
   
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

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = createClient();
  
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

export async function getUserPlanStats(userId: string): Promise<{ created: number; participating: number }> {
  const supabase = createClient();
  
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

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const supabase = createClient();
    const path = `${userId}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    const updatedProfile = await updateUserProfile(userId, { avatar_url: publicUrl });
    if (!updatedProfile) {
      console.error('Error persisting avatar_url to profile');
      return null;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return null;
  }
}

// Interest Operations (Client-side)
export async function getAllInterests(): Promise<Interest[]> {
  const supabase = createClient();
  
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

export async function getUserInterests(userId: string): Promise<UserInterest[]> {
  const supabase = createClient();
  
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
  customName?: string
): Promise<UserInterest | null> {
  const supabase = createClient();
  
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

export async function removeUserInterest(userInterestId: string): Promise<boolean> {
  const supabase = createClient();
  
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

// Travel Plan Operations (Client-side)
export async function getUserTravelPlans(userId: string): Promise<TravelPlan[]> {
  const supabase = createClient();
  
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

export async function getParticipatingPlans(userId: string): Promise<TravelPlan[]> {
  const supabase = createClient();
  
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
  planData: CreateTravelPlanData
): Promise<TravelPlan | null> {
  const supabase = createClient();
  
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
  planData: Partial<CreateTravelPlanData>
): Promise<TravelPlan | null> {
  const supabase = createClient();
  
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

export async function deleteTravelPlan(planId: string): Promise<boolean> {
  const supabase = createClient();
  
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

// Search Operations (Client-side)
export async function searchTravelPlans(
  filters: SearchFilters,
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<ApiResponse<TravelPlan[]>> {
  const supabase = createClient();
  
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

export async function getTravelPlan(planId: string): Promise<TravelPlan | null> {
  const supabase = createClient();
  
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

// Plan Join Request Operations (Client-side)
export async function createJoinRequest(
  userId: string,
  requestData: CreateJoinRequestData
): Promise<PlanJoinRequest | null> {
  const supabase = createClient();
  
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
  permission_level: PermissionLevel = 'solo_ver'
): Promise<PlanJoinRequest | null> {
  const supabase = createClient();
  
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

export async function getPlanJoinRequests(planId: string): Promise<PlanJoinRequest[]> {
  const supabase = createClient();
  
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

// Plan Notes Operations (Client-side)
export async function getPlanNotes(planId: string): Promise<PlanNote[]> {
  const supabase = createClient();
  
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
  noteData: CreatePlanNoteData
): Promise<PlanNote | null> {
  const supabase = createClient();
  
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

// Plan Comments Operations (Client-side)
export async function getPlanComments(planId: string): Promise<PlanComment[]> {
  const supabase = createClient();
  
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
  commentData: CreatePlanCommentData
): Promise<PlanComment | null> {
  const supabase = createClient();
  
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

export async function deletePlanComment(commentId: string): Promise<boolean> {
  const supabase = createClient();
  
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

// Friend Operations (Client-side)

export async function sendFriendRequest(
  userId: string,
  friendId: string
): Promise<UserFriend | null> {
  if (userId === friendId) return null;

  const supabase = createClient();

  // Check for existing relationship in either direction
  const { data: existing, error: checkError } = await supabase
    .from('user_friends')
    .select('id, user_id, friend_id, status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking existing relationship:', checkError);
    return null;
  }

  if (existing) {
    if (existing.status !== 'rejected' || existing.user_id !== userId) {
      return null;
    }
  }

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
    console.error('Error sending friend request:', error);
    return null;
  }

  return data;
}

export async function acceptFriendRequest(
  requestId: string,
  userId: string
): Promise<UserFriend | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('status', 'pending')
    .eq('friend_id', userId)
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
  userId: string
): Promise<UserFriend | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_friends')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('status', 'pending')
    .eq('friend_id', userId)
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
  peerId: string
): Promise<{ id: string; status: FriendStatus; isSender: boolean } | null> {
  const supabase = createClient();

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
  userId: string
): Promise<EnrichedFriend[]> {
  const supabase = createClient();

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

  const allFriends = [...sentFriends, ...receivedFriends].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allFriends;
}

export async function getPendingRequests(
  userId: string
): Promise<EnrichedFriend[]> {
  const supabase = createClient();

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
  userId: string
): Promise<EnrichedFriend[]> {
  const supabase = createClient();

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