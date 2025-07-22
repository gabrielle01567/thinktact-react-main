import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Check user's application count
export const getUserApplicationCount = async (userId) => {
  try {
    const supabase = getSupabaseClient();
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
    const supabase = getSupabaseClient();
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
        cross_reference: applicationData.crossReference || '',
        federal_research: applicationData.federalResearch || '',
        abstract: applicationData.abstract || '',
        field: applicationData.field || '',
        background: applicationData.background || '',
        summary: applicationData.summary || '',
        drawings: applicationData.drawings || '',
        detailed_description: applicationData.detailedDescription || '',
        images: applicationData.images || [],
        completed_sections: applicationData.completedSections || {},
        status: applicationData.status || 'draft',
        sections_needing_review: applicationData.sectionsNeedingReview || {}
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving patent application:', error);
      throw error;
    }
    if (!application) {
      console.error('No application returned from insert. Possible RLS or quota issue.');
      throw new Error('Patent application not saved. Possible RLS or quota issue.');
    }
    
    return {
      id: application.id,
      userId: application.user_id,
      title: application.title,
      shortDescription: application.short_description,
      crossReference: application.cross_reference,
      federalResearch: application.federal_research,
      inventors: application.inventors || [],
      abstract: application.abstract,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      sectionsNeedingReview: application.sections_needing_review,
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
    const supabase = getSupabaseClient();
    const { data: application, error } = await supabase
      .from('patent_applications')
      .update({
        title: applicationData.title,
        short_description: applicationData.shortDescription,
        cross_reference: applicationData.crossReference,
        federal_research: applicationData.federalResearch,
        inventors: applicationData.inventors,
        abstract: applicationData.abstract,
        field: applicationData.field,
        background: applicationData.background,
        summary: applicationData.summary,
        drawings: applicationData.drawings,
        detailed_description: applicationData.detailedDescription,
        images: applicationData.images || [],
        completed_sections: applicationData.completedSections,
        status: applicationData.status,
        sections_needing_review: applicationData.sectionsNeedingReview || {},
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
      console.error('No application returned from update. Possible RLS or quota issue.');
      throw new Error('Patent application not found or unauthorized (possible RLS or quota issue).');
    }
    
    return {
      id: application.id,
      userId: application.user_id,
      title: application.title,
      shortDescription: application.short_description,
      crossReference: application.cross_reference,
      federalResearch: application.federal_research,
      inventors: application.inventors || [],
      abstract: application.abstract,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      sectionsNeedingReview: application.sections_needing_review,
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
    const supabase = getSupabaseClient();
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
      crossReference: application.cross_reference,
      federalResearch: application.federal_research,
      inventors: application.inventors || [],
      abstract: application.abstract,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      sectionsNeedingReview: application.sections_needing_review,
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
    const supabase = getSupabaseClient();
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
      crossReference: application.cross_reference,
      federalResearch: application.federal_research,
      inventors: application.inventors || [],
      abstract: application.abstract,
      field: application.field,
      background: application.background,
      summary: application.summary,
      drawings: application.drawings,
      detailedDescription: application.detailed_description,
      images: application.images || [],
      completedSections: application.completed_sections,
      status: application.status,
      sectionsNeedingReview: application.sections_needing_review,
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
    const supabase = getSupabaseClient();
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