import { supabase } from './supabase';

/**
 * Checks if a specific column exists in a table
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .single();

    return !error && !!data;
  } catch (error) {
    console.warn(`Could not check if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

/**
 * Gets user profile with schema-aware approach
 * Attempts to fetch with all fields first, then falls back to basic fields
 */
export async function getUserProfileSchemaAware(userId: string) {
  // First, try to get profile with all possible fields
  let { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id, 
      username, 
      email, 
      country, 
      organization, 
      avatar_url, 
      created_at, 
      is_admin, 
      role,
      country_code
    `)
    .eq('id', userId)
    .single();

  // If there's a column error, try with basic fields only
  if (error && (error.message?.includes('does not exist') || error.message?.includes('country_code'))) {
    ({ data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, username, country, organization, avatar_url, created_at, is_admin, role')
      .eq('id', userId)
      .single());
  }

  // If still an error but it's due to no rows (user doesn't exist in profiles), that's okay
  if (error && error.code !== 'PGRST116') {
    console.error('Error loading user profile:', error);
    return null;
  }

  return profile;
}

/**
 * Updates user profile with schema-aware approach
 * Attempts to update with all fields first, then falls back to basic fields
 */
export async function updateUserProfileSchemaAware(userId: string, updates: any) {
  // Try to update with all fields first
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.warn('Error updating user profile with all fields:', error);

    // If it's a column doesn't exist error, try to update with a reduced set of fields
    if (error.message && error.message.includes('does not exist')) {
      // Determine which fields to try based on the error
      const safeUpdates: any = { ...updates };
      
      // Remove problematic fields one by one and try again
      if (error.message.includes('country_code')) {
        delete safeUpdates.country_code;
      }
      
      if (Object.keys(safeUpdates).length > 0) {
        const { error: safeError } = await supabase
          .from('profiles')
          .update(safeUpdates)
          .eq('id', userId);

        if (safeError) {
          console.error('Error updating user profile with safe fields:', safeError);
          return false;
        }
      }
    } else {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  return true;
}

/**
 * Attempts to create a user profile with schema-aware approach
 */
export async function createProfileSchemaAware(
  userId: string, 
  profileData: { 
    username?: string; 
    email?: string; 
    country?: string; 
    organization?: string; 
    avatar_url?: string; 
    country_code?: string;
    is_admin?: boolean;
    role?: string;
  }
) {
  try {
    // Try to create with all fields
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Error creating profile with all fields:', error);
      
      // If it's a column doesn't exist error, try with basic fields
      if (error.message && error.message.includes('does not exist')) {
        const basicProfileData: any = { 
          id: userId,
          created_at: new Date().toISOString()
        };
        
        if (profileData.username) basicProfileData.username = profileData.username;
        if (profileData.email) basicProfileData.email = profileData.email;
        if (profileData.country) basicProfileData.country = profileData.country;
        if (profileData.organization) basicProfileData.organization = profileData.organization;
        if (profileData.avatar_url) basicProfileData.avatar_url = profileData.avatar_url;
        
        const { error: basicError } = await supabase
          .from('profiles')
          .insert(basicProfileData);

        if (basicError) {
          console.error('Error creating profile with basic fields:', basicError);
          return false;
        }
      } else {
        console.error('Error creating profile:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating profile:', error);
    return false;
  }
}

/**
 * Checks if the database schema is compatible with the current application
 */
export async function checkSchemaCompatibility(): Promise<{ 
  isCompatible: boolean; 
  missingTables: string[]; 
  missingColumns: { table: string; column: string }[] 
}> {
  const requiredTables = ['profiles', 'user_stats', 'activities', 'user_activities'];
  const requiredColumns = {
    profiles: ['country_code', 'is_admin', 'role']
  };

  const missingTables: string[] = [];
  const missingColumns: { table: string; column: string }[] = [];

  // Check for missing tables
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('limit 1');
      if (error && error.message.includes('does not exist')) {
        missingTables.push(table);
      }
    } catch (e) {
      missingTables.push(table);
    }
  }

  // Check for missing columns
  for (const [table, columns] of Object.entries(requiredColumns)) {
    for (const column of columns) {
      const exists = await checkColumnExists(table, column);
      if (!exists) {
        missingColumns.push({ table, column });
      }
    }
  }

  return {
    isCompatible: missingTables.length === 0 && missingColumns.length === 0,
    missingTables,
    missingColumns
  };
}