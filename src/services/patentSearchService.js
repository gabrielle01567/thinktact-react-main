// Patent Search Service - Real API integration only
const USPTO_BASE_URL = 'https://developer.uspto.gov/ds-api';
const USPTO_SEARCH_URL = 'https://patents.google.com/api/query'; // Using Google Patents as primary since USPTO has CORS issues
const PATENTSCOPE_BASE_URL = 'https://patentscope.wipo.int/search/en/result.jsf';

// USPTO API endpoints (these may have CORS restrictions)
const USPTO_ENDPOINTS = {
  search: `${USPTO_BASE_URL}/patents/v1/patents/search`,
  detail: `${USPTO_BASE_URL}/patents/v1/patents`,
  citations: `${USPTO_BASE_URL}/patents/v1/patents/citations`
};

// Google Patents API (more reliable for web applications)
const GOOGLE_PATENTS_BASE_URL = 'https://patents.google.com/api/query';

class PatentSearchService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.usptoApiKey = null;
  }

  // Set USPTO API key
  setUSPTOApiKey(apiKey) {
    this.usptoApiKey = apiKey;
    console.log('USPTO API key configured');
  }

  // Get USPTO API key from environment or user input
  getUSPTOApiKey() {
    if (this.usptoApiKey) {
      return this.usptoApiKey;
    }
    
    // Try to get from Vite environment variable (prefixed with VITE_)
    if (import.meta.env && import.meta.env.VITE_USPTO_API_KEY) {
      return import.meta.env.VITE_USPTO_API_KEY;
    }
    
    // Try to get from localStorage (if user has entered it)
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedKey = localStorage.getItem('uspto_api_key');
      if (storedKey) {
        this.usptoApiKey = storedKey;
        return storedKey;
      }
    }
    
    return null;
  }

  // Search patents by keywords
  async searchByKeywords(query, filters = {}) {
    try {
      const hasUSPTOKey = this.getUSPTOApiKey();
      
      // Try USPTO first if API key is available
      if (hasUSPTOKey) {
        try {
          const usptoResults = await this.searchUSPTO(query, filters);
          if (usptoResults && usptoResults.length > 0) {
            return this.formatUSPTOResults(usptoResults);
          }
        } catch (usptoError) {
          console.log('USPTO API failed:', usptoError.message);
        }
      }

      // Fallback to Google Patents
      const googleResults = await this.searchGooglePatents(query, filters);
      if (googleResults && googleResults.length > 0) {
        return this.formatGoogleResults(googleResults);
      }

      // No results found from any API
      return [];

    } catch (error) {
      console.error('Error searching patents:', error);
      throw new Error(`Failed to search patents: ${error.message}`);
    }
  }

  // Search by inventor name
  async searchByInventor(inventorName, filters = {}) {
    try {
      const query = `inventor:(${inventorName})`;
      return await this.searchByKeywords(query, filters);
    } catch (error) {
      console.error('Error searching by inventor:', error);
      throw new Error(`Failed to search by inventor: ${error.message}`);
    }
  }

  // Search by patent number
  async searchByPatentNumber(patentNumber) {
    try {
      // Clean patent number
      const cleanNumber = patentNumber.replace(/[^\d]/g, '');
      const hasUSPTOKey = this.getUSPTOApiKey();
      
      // Try USPTO first if API key is available
      if (hasUSPTOKey) {
        try {
          const usptoResult = await this.getUSPTODetail(cleanNumber);
          if (usptoResult) {
            return [this.formatUSPTOResult(usptoResult)];
          }
        } catch (usptoError) {
          console.log('USPTO API failed for patent number lookup:', usptoError.message);
        }
      }

      // Fallback to Google Patents
      const googleResult = await this.getGooglePatentDetail(patentNumber);
      if (googleResult) {
        return [this.formatGoogleResult(googleResult)];
      }

      // No results found
      return [];

    } catch (error) {
      console.error('Error searching by patent number:', error);
      throw new Error(`Failed to search by patent number: ${error.message}`);
    }
  }

  // Search by assignee (company)
  async searchByAssignee(assigneeName, filters = {}) {
    try {
      const query = `assignee:(${assigneeName})`;
      return await this.searchByKeywords(query, filters);
    } catch (error) {
      console.error('Error searching by assignee:', error);
      throw new Error(`Failed to search by assignee: ${error.message}`);
    }
  }

  // USPTO API search with API key support
  async searchUSPTO(query, filters = {}) {
    const apiKey = this.getUSPTOApiKey();
    if (!apiKey) {
      throw new Error('USPTO API key not configured');
    }

    const cacheKey = `uspto_${query}_${JSON.stringify(filters)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const params = new URLSearchParams({
      q: query,
      max: '50',
      sort: 'date desc'
    });

    if (filters.dateRange && filters.dateRange !== 'all') {
      const dateFilter = this.getDateFilter(filters.dateRange);
      params.append('dateRange', dateFilter);
    }

    // Add API key to headers
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'PatentBuddy/1.0',
      'X-API-Key': apiKey
    };

    const response = await fetch(`${USPTO_ENDPOINTS.search}?${params}`, {
      method: 'GET',
      headers: headers,
      mode: 'cors'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('USPTO API key is invalid or expired');
      } else if (response.status === 429) {
        throw new Error('USPTO API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`USPTO API error: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // Cache the results
    this.cache.set(cacheKey, {
      data: data.results || [],
      timestamp: Date.now()
    });

    return data.results || [];
  }

  // Get USPTO patent detail with API key support
  async getUSPTODetail(patentNumber) {
    const apiKey = this.getUSPTOApiKey();
    if (!apiKey) {
      throw new Error('USPTO API key not configured');
    }

    const cacheKey = `uspto_detail_${patentNumber}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'PatentBuddy/1.0',
      'X-API-Key': apiKey
    };

    const response = await fetch(`${USPTO_ENDPOINTS.detail}/${patentNumber}`, {
      method: 'GET',
      headers: headers,
      mode: 'cors'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('USPTO API key is invalid or expired');
      } else if (response.status === 404) {
        throw new Error('Patent not found');
      } else if (response.status === 429) {
        throw new Error('USPTO API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`USPTO API error: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    this.cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  }

  // Google Patents search (more reliable)
  async searchGooglePatents(query, filters = {}) {
    const cacheKey = `google_${query}_${JSON.stringify(filters)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const params = new URLSearchParams({
      q: query,
      language: 'ENGLISH',
      type: 'PATENT',
      num: '50'
    });

    // Add date filters if specified
    if (filters.dateRange && filters.dateRange !== 'all') {
      const dateFilter = this.getGoogleDateFilter(filters.dateRange);
      params.append('dateRange', dateFilter);
    }

    try {
      const response = await fetch(`${GOOGLE_PATENTS_BASE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PatentBuddy/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Patents API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: data.results || [],
        timestamp: Date.now()
      });

      return data.results || [];
    } catch (error) {
      console.error('Google Patents API error:', error);
      throw error;
    }
  }

  // Get Google Patent detail
  async getGooglePatentDetail(patentNumber) {
    const cacheKey = `google_detail_${patentNumber}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${GOOGLE_PATENTS_BASE_URL}?q=${patentNumber}&type=PATENT`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PatentBuddy/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Patents API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.results?.[0] || null;
      
      if (result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      console.error('Google Patents detail error:', error);
      throw error;
    }
  }

  // Format USPTO results
  formatUSPTOResults(results) {
    return results.map(patent => ({
      id: patent.patentNumber,
      title: patent.title,
      inventors: patent.inventors?.map(inv => inv.name) || [],
      assignee: patent.assignee?.name || 'Unknown',
      filingDate: patent.filingDate,
      publicationDate: patent.publicationDate,
      status: patent.status || 'Published',
      abstract: patent.abstract,
      claims: patent.claims?.length || 0,
      citations: patent.citations?.length || 0,
      similarity: this.calculateSimilarity(patent),
      source: 'USPTO'
    }));
  }

  // Format single USPTO result
  formatUSPTOResult(patent) {
    return {
      id: patent.patentNumber,
      title: patent.title,
      inventors: patent.inventors?.map(inv => inv.name) || [],
      assignee: patent.assignee?.name || 'Unknown',
      filingDate: patent.filingDate,
      publicationDate: patent.publicationDate,
      status: patent.status || 'Published',
      abstract: patent.abstract,
      claims: patent.claims?.length || 0,
      citations: patent.citations?.length || 0,
      similarity: 1.0,
      source: 'USPTO'
    };
  }

  // Format Google results
  formatGoogleResults(results) {
    return results.map(patent => ({
      id: patent.patentNumber || patent.id,
      title: patent.title,
      inventors: patent.inventors || [],
      assignee: patent.assignee || 'Unknown',
      filingDate: patent.filingDate,
      publicationDate: patent.publicationDate,
      status: 'Published',
      abstract: patent.abstract,
      claims: patent.claims?.length || 0,
      citations: patent.citations?.length || 0,
      similarity: this.calculateSimilarity(patent),
      source: 'Google Patents'
    }));
  }

  // Format single Google result
  formatGoogleResult(patent) {
    return {
      id: patent.patentNumber || patent.id,
      title: patent.title,
      inventors: patent.inventors || [],
      assignee: patent.assignee || 'Unknown',
      filingDate: patent.filingDate,
      publicationDate: patent.publicationDate,
      status: 'Published',
      abstract: patent.abstract,
      claims: patent.claims?.length || 0,
      citations: patent.citations?.length || 0,
      similarity: 1.0,
      source: 'Google Patents'
    };
  }

  // Calculate similarity score (placeholder for AI integration)
  calculateSimilarity(patent) {
    // This would be replaced with actual AI similarity calculation
    return Math.random() * 0.4 + 0.6; // 0.6 to 1.0
  }

  // Get date filter for USPTO
  getDateFilter(dateRange) {
    const now = new Date();
    const year = now.getFullYear();
    
    switch (dateRange) {
      case '1year':
        return `${year - 1}-01-01:${year}-12-31`;
      case '5years':
        return `${year - 5}-01-01:${year}-12-31`;
      case '10years':
        return `${year - 10}-01-01:${year}-12-31`;
      default:
        return '';
    }
  }

  // Get date filter for Google Patents
  getGoogleDateFilter(dateRange) {
    const now = new Date();
    const year = now.getFullYear();
    
    switch (dateRange) {
      case '1year':
        return `after:${year - 1}`;
      case '5years':
        return `after:${year - 5}`;
      case '10years':
        return `after:${year - 10}`;
      default:
        return '';
    }
  }

  // Get patent citations
  async getPatentCitations(patentNumber) {
    try {
      // Try Google Patents first
      const googleCitations = await this.getGooglePatentCitations(patentNumber);
      if (googleCitations) {
        return googleCitations;
      }

      // Fallback to USPTO (may fail due to CORS)
      try {
        const response = await fetch(`${USPTO_ENDPOINTS.citations}/${patentNumber}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PatentBuddy/1.0'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`USPTO Citations API error: ${response.status}`);
        }

        const data = await response.json();
        return this.formatCitations(data);
      } catch (usptoError) {
        console.log('USPTO citations API failed:', usptoError.message);
      }

      // No citations found
      return { forward: [], backward: [] };

    } catch (error) {
      console.error('Error fetching citations:', error);
      throw new Error(`Failed to fetch citations: ${error.message}`);
    }
  }

  // Get Google Patent citations
  async getGooglePatentCitations(patentNumber) {
    try {
      const response = await fetch(`${GOOGLE_PATENTS_BASE_URL}?q=cites:${patentNumber}&type=PATENT`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PatentBuddy/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Patents Citations API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatGoogleCitations(data);
    } catch (error) {
      console.error('Google Patents citations error:', error);
      return null;
    }
  }

  // Format citations data
  formatCitations(data) {
    return {
      forward: data.forwardCitations?.map(citation => ({
        id: citation.patentNumber,
        title: citation.title,
        inventors: citation.inventors?.map(inv => inv.name) || [],
        assignee: citation.assignee?.name || 'Unknown',
        date: citation.filingDate,
        relevance: citation.relevance || 0.8
      })) || [],
      backward: data.backwardCitations?.map(citation => ({
        id: citation.patentNumber,
        title: citation.title,
        inventors: citation.inventors?.map(inv => inv.name) || [],
        assignee: citation.assignee?.name || 'Unknown',
        date: citation.filingDate,
        relevance: citation.relevance || 0.8
      })) || []
    };
  }

  // Format Google citations data
  formatGoogleCitations(data) {
    return {
      forward: data.results?.map(citation => ({
        id: citation.patentNumber || citation.id,
        title: citation.title,
        inventors: citation.inventors || [],
        assignee: citation.assignee || 'Unknown',
        date: citation.filingDate,
        relevance: 0.8
      })) || [],
      backward: [] // Google Patents doesn't provide backward citations in this format
    };
  }
}

export default new PatentSearchService(); 