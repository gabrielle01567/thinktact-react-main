import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check user's application count
export const getUserApplicationCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('patent_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting user application count:', error);
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting user application count:', error);
    throw error;
  }
};

// Save a new patent application
export const savePatentApplication = async (userId, applicationData) => {
  try {
    // Check if user has reached the 5-application limit
    const currentCount = await getUserApplicationCount(userId);
    if (currentCount >= 5) {
      throw new Error('You have reached the maximum limit of 5 patent applications. Please delete an existing application before creating a new one.');
    }

    const { data: application, error } = await supabase
      .from('patent_applications')
      .insert({
        user_id: userId,
        title: applicationData.title || '',
        short_description: applicationData.shortDescription || '',
        field: applicationData.field || '',
        background: applicationData.background || '',
        summary: applicationData.summary || '',
        drawings: applicationData.drawings || '',
        detailed_description: applicationData.detailedDescription || '',
        critical: applicationData.critical || '',
        alternatives: applicationData.alternatives || '',
        boilerplate: applicationData.boilerplate || '',
        images: applicationData.images || [],
        completed_sections: applicationData.completedSections || {},
        status: applicationData.status || 'draft'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving patent application:', error);
      throw error;
    }
    
    return {
      id: application.id,
      userId: application.user_id,
      title: application.title,
      shortDescription: application.short_description,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      critical: application.critical,
      alternatives: application.alternatives,
      boilerplate: application.boilerplate,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      createdAt: application.created_at,
      updatedAt: application.updated_at
    };
  } catch (error) {
    console.error('Error saving patent application:', error);
    throw error;
  }
};

// Update an existing patent application
export const updatePatentApplication = async (userId, applicationId, applicationData) => {
  try {
    const { data: application, error } = await supabase
      .from('patent_applications')
      .update({
        title: applicationData.title,
        short_description: applicationData.shortDescription,
        field: applicationData.field,
        background: applicationData.background,
        summary: applicationData.summary,
        drawings: applicationData.drawings,
        detailed_description: applicationData.detailedDescription,
        critical: applicationData.critical,
        alternatives: applicationData.alternatives,
        boilerplate: applicationData.boilerplate,
        images: applicationData.images || [],
        completed_sections: applicationData.completedSections,
        status: applicationData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating patent application:', error);
      throw error;
    }
    
    if (!application) {
      throw new Error('Patent application not found or unauthorized');
    }
    
    return {
      id: application.id,
      userId: application.user_id,
      title: application.title,
      shortDescription: application.short_description,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      critical: application.critical,
      alternatives: application.alternatives,
      boilerplate: application.boilerplate,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      createdAt: application.created_at,
      updatedAt: application.updated_at
    };
  } catch (error) {
    console.error('Error updating patent application:', error);
    throw error;
  }
};

// Get all patent applications for a user
export const getPatentApplications = async (userId) => {
  try {
    const { data: applications, error } = await supabase
      .from('patent_applications')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error getting patent applications:', error);
      throw error;
    }
    
    return (applications || []).map(application => ({
      id: application.id,
      userId: application.user_id,
      title: application.title,
      shortDescription: application.short_description,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      critical: application.critical,
      alternatives: application.alternatives,
      boilerplate: application.boilerplate,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      createdAt: application.created_at,
      updatedAt: application.updated_at
    }));
  } catch (error) {
    console.error('Error getting patent applications:', error);
    throw error;
  }
};

// Get a specific patent application
export const getPatentApplication = async (userId, applicationId) => {
  try {
    const { data: application, error } = await supabase
      .from('patent_applications')
      .select('*')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting patent application:', error);
      throw error;
    }
    
    if (!application) {
      throw new Error('Patent application not found or unauthorized');
    }
    
    return {
      id: application.id,
      userId: application.user_id,
      title: application.title,
      shortDescription: application.short_description,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      critical: application.critical,
      alternatives: application.alternatives,
      boilerplate: application.boilerplate,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      createdAt: application.created_at,
      updatedAt: application.updated_at
    };
  } catch (error) {
    console.error('Error getting patent application:', error);
    throw error;
  }
};

// Delete a patent application
export const deletePatentApplication = async (userId, applicationId) => {
  try {
    const { error } = await supabase
      .from('patent_applications')
      .delete()
      .eq('id', applicationId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting patent application:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting patent application:', error);
    throw error;
  }
}; 