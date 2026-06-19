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
  PlanJoinRequest,
  CreateJoinRequestData,
  PermissionLevel,
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
    .single();

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
    .single();

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
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
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
    .single();

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
    .single();

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
      .single();

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
    .single();

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
    .single();

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
    .insert({
      requester_id: userId,
      ...requestData
    })
    .select(`
      *,
      requester:user_profiles!requester_id(*),
      plan:travel_plans(*)
    `)
    .single();

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
    .single();

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
    .single();

  if (error) {
    console.error('Error creating plan note:', error);
    return null;
  }

  return data;
} 