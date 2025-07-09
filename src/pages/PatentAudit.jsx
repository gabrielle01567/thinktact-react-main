import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { savePatentApplication, updatePatentApplication, getPatentApplication, uploadPatentImage } from '../services/patentService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isSupabaseAvailable } from '../services/supabaseClient.js';

const PatentAudit = () => {
  const { id: applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentSection, setCurrentSection] = useState('Title');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [showCommonMistakes, setShowCommonMistakes] = useState(true);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // New state for other sections
  const [abstract, setAbstract] = useState('');
  const [field, setField] = useState('');
  const [background, setBackground] = useState('');
  const [summary, setSummary] = useState('');
  const [drawings, setDrawings] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');

  // Add state for new optional sections
  const [crossReference, setCrossReference] = useState('');
  const [federalResearch, setFederalResearch] = useState('');

  // Completion status for each section
  const [completedSections, setCompletedSections] = useState({
    Title: false,
    'Cross-Reference to Related Applications (Optional)': false,
    'Federally Sponsored Research or Development (Optional)': false,
    Abstract: false,
    Field: false,
    Background: false,
    Summary: false,
    Drawings: false,
    'Detailed Description': false
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageNames, setImageNames] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const sections = [
    'Title',
    'Cross-Reference to Related Applications (Optional)',
    'Federally Sponsored Research or Development (Optional)',
    'Abstract',
    'Field',
    'Background',
    'Summary',
    'Drawings',
    'Detailed Description'
  ];
  
  // Calculate actual completed sections
  const completedSectionsCount = [
    title.trim(),
    crossReference.trim(),
    federalResearch.trim(),
    abstract.trim(),
    field.trim(),
    background.trim(),
    summary.trim(),
    drawings.trim(),
    detailedDescription.trim()
  ].filter(Boolean).length;

  // Load existing application data if editing
  useEffect(() => {
    const loadApplication = async () => {
      if (applicationId && user) {
        setIsLoading(true);
        try {
          const application = await getPatentApplication(applicationId);
          
          // Populate form fields
          setTitle(application.title || '');
          setShortDescription(application.shortDescription || '');
          setAbstract(application.abstract || '');
          setField(application.field || '');
          setBackground(application.background || '');
          setSummary(application.summary || '');
          setDrawings(application.drawings || '');
          setDetailedDescription(application.detailedDescription || '');
          setImages(application.images || []);
          setCrossReference(application.crossReference || '');
          setFederalResearch(application.federalResearch || '');
          
          // Set completion status
          if (application.completedSections) {
            setCompletedSections(application.completedSections);
          }
          
        } catch (error) {
          console.error('Error loading application:', error);
          // If application not found, redirect to new application
          if (error.response?.status === 404) {
            navigate('/patent-audit');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadApplication();
  }, [applicationId, user, navigate]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal]);

  // Save application data
  const saveApplication = async () => {
    if (!user) {
      setSaveMessage('Please log in to save your application');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const applicationData = {
        title,
        shortDescription,
        crossReference,
        federalResearch,
        abstract,
        field,
        background,
        summary,
        drawings,
        detailedDescription,
        images,
        completedSections,
        status: Object.values(completedSections).filter(Boolean).length === sections.length ? 'complete' : 'draft'
      };

      let result;
      if (applicationId) {
        // Update existing application
        result = await updatePatentApplication(applicationId, applicationData);
        setSaveMessage('Application updated successfully!');
        // Redirect to the updated application (if needed)
        // navigate(`/patent-audit/${result.id}`); // Uncomment if you want to redirect after update
      } else {
        // Save new application
        result = await savePatentApplication(applicationData);
        setSaveMessage('Application saved successfully!');
        // Redirect to the saved application
        navigate(`/patent-audit/${result.application.id}`);
      }

      // Clear save message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error saving application:', error);
      // Check if it's a limit exceeded error
      if (error.response?.data?.error?.includes('maximum limit of 5 patent applications')) {
        setSaveMessage('You have reached the maximum limit of 5 applications. Please delete an existing application before creating a new one.');
      } else {
        setSaveMessage('Error saving application. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to render section content
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'Title':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Title of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a clear, concise title that accurately describes your invention. Avoid overly broad or vague titles.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder='e.g., "System and Method for AI-Powered Content Generation"'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="A brief description to help you identify this invention in your documents"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-blue-900"
                  onClick={() => setShowTips(!showTips)}
                >
                  Tips for a Strong Title
                  <span>{showTips ? '▲' : '▼'}</span>
                </button>
                {showTips && (
                  <ul className="mt-2 space-y-2 text-sm text-blue-800">
                    <li>• Be specific about the technology area</li>
                    <li>• Include key technical features that make your invention unique</li>
                    <li>• Avoid marketing language or superlatives</li>
                    <li>• Keep it under 15 words if possible</li>
                  </ul>
                )}
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Title: !prev.Title }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Title
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Title ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Cross-Reference to Related Applications (Optional)':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cross-Reference to Related Applications <span className="text-xs text-gray-500">(Optional)</span></h2>
            <p className="text-gray-600 mb-6">If you are claiming priority to an earlier U.S. or foreign patent application, provide the application number and filing date here. <span className="font-medium">If you are not claiming priority, you can leave this section blank.</span></p>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="e.g., This application claims the benefit of U.S. Provisional Application No. 62/123,456, filed Jan. 1, 2023."
              value={crossReference}
              onChange={(e) => setCrossReference(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setCompletedSections(prev => ({ ...prev, 'Cross-Reference to Related Applications (Optional)': !prev['Cross-Reference to Related Applications (Optional)'] }))}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                  completedSections['Cross-Reference to Related Applications (Optional)']
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {completedSections['Cross-Reference to Related Applications (Optional)'] ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        );
      case 'Federally Sponsored Research or Development (Optional)':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Federally Sponsored Research or Development <span className="text-xs text-gray-500">(Optional)</span></h2>
            <p className="text-gray-600 mb-6">If your invention was made with U.S. federal government support, you must disclose the contract or grant number and the government agency. <span className="font-medium">If your invention was not federally funded, you can leave this section blank.</span></p>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="e.g., This invention was made with government support under contract no. ABC-123 awarded by the National Science Foundation. The government has certain rights in the invention."
              value={federalResearch}
              onChange={(e) => setFederalResearch(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setCompletedSections(prev => ({ ...prev, 'Federally Sponsored Research or Development (Optional)': !prev['Federally Sponsored Research or Development (Optional)'] }))}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                  completedSections['Federally Sponsored Research or Development (Optional)']
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {completedSections['Federally Sponsored Research or Development (Optional)'] ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        );

      case 'Abstract':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a concise overview of your invention and its key advantages.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={6}
                  placeholder="Provide a clear, concise summary of your invention, including its key features and advantages..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Abstract Best Practices</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Keep it concise but comprehensive</li>
                  <li>• Highlight key technical features</li>
                  <li>• Mention advantages over prior art</li>
                  <li>• Avoid overly technical jargon</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Abstract: !prev.Abstract }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Abstract
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Abstract ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Field':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Field of the Invention</h2>
            <p className="text-gray-600 mb-6">Describe the technical field or area of technology to which your invention relates.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Description</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="e.g., This invention relates to the field of artificial intelligence and machine learning, specifically to natural language processing systems for content generation."
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Tips for Field Section</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Be broad enough to encompass your invention</li>
                  <li>• Include relevant technical disciplines</li>
                  <li>• Avoid being too narrow or too broad</li>
                  <li>• Reference established technical areas</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Field: !prev.Field }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Field
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Field ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Background':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Background of the Invention</h2>
            <p className="text-gray-600 mb-6">Describe the problem your invention solves and the limitations of existing solutions.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe the specific problem or need that your invention addresses..."
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Background Section Guidelines</h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Focus on the problem, not just the solution</li>
                  <li>• Explain why existing solutions are inadequate</li>
                  <li>• Provide context for your invention</li>
                  <li>• Be objective and factual</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Background: !prev.Background }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Background
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Background ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Summary':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a concise overview of your invention and its key advantages.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={6}
                  placeholder="Provide a clear, concise summary of your invention, including its key features and advantages..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Summary Best Practices</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Keep it concise but comprehensive</li>
                  <li>• Highlight key technical features</li>
                  <li>• Mention advantages over prior art</li>
                  <li>• Avoid overly technical jargon</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Summary: !prev.Summary }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Summary
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Summary ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Drawings':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Brief Description of the Drawings</h2>
            <p className="text-gray-600 mb-6">Describe any drawings or figures that illustrate your invention.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Drawing Images</label>
                {isSupabaseAvailable() ? (
                  <>
                    {/* File Selection */}
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setSelectedFiles(files);
                          // Initialize names for new files
                          const newNames = {};
                          files.forEach((file, index) => {
                            const defaultName = `Figure ${images.length + index + 1}`;
                            newNames[file.name] = defaultName;
                          });
                          setImageNames(prev => ({ ...prev, ...newNames }));
                        }}
                        className="hidden"
                        id="file-input"
                      />
                      <label
                        htmlFor="file-input"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Select Images
                      </label>
                    </div>

                    {/* Selected Files with Names */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images:</h4>
                        <div className="space-y-3">
                          {selectedFiles.map((file, index) => (
                            <div key={file.name} className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-16 h-16 border rounded overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={file.name} 
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">{file.name}</p>
                                <input
                                  type="text"
                                  placeholder="Enter image name (e.g., Figure 1)"
                                  value={imageNames[file.name] || ''}
                                  onChange={(e) => setImageNames(prev => ({
                                    ...prev,
                                    [file.name]: e.target.value
                                  }))}
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={async () => {
                              if (!user || !applicationId) return;
                              setUploading(true);
                              setUploadError('');
                              try {
                                const uploaded = [];
                                for (const file of selectedFiles) {
                                  const img = await uploadPatentImage(file, user.id, applicationId || 'new');
                                  // Add the custom name to the uploaded image
                                  const namedImg = {
                                    ...img,
                                    name: imageNames[file.name] || file.name
                                  };
                                  uploaded.push(namedImg);
                                }
                                setImages(prev => [...prev, ...uploaded]);
                                setSelectedFiles([]);
                                setImageNames({});
                              } catch (err) {
                                setUploadError('Failed to upload image(s).');
                              } finally {
                                setUploading(false);
                              }
                            }}
                            disabled={uploading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {uploading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload Images
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFiles([]);
                              setImageNames({});
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadError && <div className="text-red-600 text-sm mb-2">{uploadError}</div>}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-2">
                    <p className="text-sm text-yellow-800">
                      Image upload is not available. Please configure Supabase environment variables to enable this feature.
                    </p>
                  </div>
                )}

                {/* Uploaded Images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images:</h4>
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, idx) => (
                        <div key={img.url} className="relative w-24 h-24 border rounded overflow-hidden group cursor-pointer">
                          <img 
                            src={img.url} 
                            alt={img.name} 
                            className="object-cover w-full h-full group-hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedImage(img);
                              setShowImageModal(true);
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {img.name}
                          </div>
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs hover:bg-opacity-100 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Descriptions</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={6}
                  placeholder="Describe your drawings, figures, or diagrams. For example: Figure 1 shows a block diagram of the system architecture..."
                  value={drawings}
                  onChange={(e) => setDrawings(e.target.value)}
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Drawing Guidelines</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>• Number your figures (Figure 1, Figure 2, etc.)</li>
                  <li>• Describe what each drawing shows</li>
                  <li>• Reference specific elements in the drawings</li>
                  <li>• Keep descriptions clear and technical</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Drawings: !prev.Drawings }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Drawings
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Drawings ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Detailed Description':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Description of the Invention</h2>
            <p className="text-gray-600 mb-6">This is the most critical section. Provide a complete, detailed description of how your invention works.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={12}
                  placeholder="Provide a comprehensive description of your invention, including how it works, its components, and implementation details..."
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                />
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Critical Section Requirements</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>• Must enable someone skilled in the art to make and use your invention</li>
                  <li>• Include specific implementation details</li>
                  <li>• Describe the "how" not just the "what"</li>
                  <li>• Provide sufficient detail for reproducibility</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, 'Detailed Description': !prev['Detailed Description'] }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections['Detailed Description']
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections['Detailed Description'] ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Helper function to get section-specific help content
  const getSectionHelp = () => {
    const helpContent = {
      'Title': {
        title: 'Current Section: Title',
        description: 'The title should be brief but technically accurate, avoiding marketing language.',
        link: 'USPTO Patent Application Guide',
        url: 'https://www.uspto.gov/patents/basics/patent-process-overview'
      },
      'Cross-Reference to Related Applications (Optional)': {
        title: 'Current Section: Cross-Reference to Related Applications (Optional)',
        description: 'Needed only if you are claiming priority to an earlier U.S. or foreign patent application. Otherwise, leave blank.',
        link: 'USPTO Priority Claims Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/priority-claims'
      },
      'Federally Sponsored Research or Development (Optional)': {
        title: 'Current Section: Federally Sponsored Research or Development (Optional)',
        description: 'Needed only if your invention was made with U.S. federal government support. Otherwise, leave blank.',
        link: 'USPTO Federal Funding Disclosure',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/federally-sponsored-research'
      },
      'Abstract': {
        title: 'Current Section: Abstract',
        description: 'Provide a concise overview of your invention and its key advantages.',
        link: 'USPTO Abstract Guidelines',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/abstract-guidelines'
      },
      'Field': {
        title: 'Current Section: Field',
        description: 'Define the technical area your invention belongs to. Be broad enough to encompass your invention.',
        link: 'USPTO Field of Invention Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/field-invention'
      },
      'Background': {
        title: 'Current Section: Background',
        description: 'Describe the problem your invention solves and why existing solutions are inadequate.',
        link: 'USPTO Background Section Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/background-invention'
      },
      'Summary': {
        title: 'Current Section: Summary',
        description: 'Provide a concise overview of your invention and its key advantages.',
        link: 'USPTO Summary Guidelines',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/summary-invention'
      },
      'Drawings': {
        title: 'Current Section: Drawings',
        description: 'Describe any figures or diagrams that illustrate your invention.',
        link: 'USPTO Drawing Requirements',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/drawing-requirements'
      },
      'Detailed Description': {
        title: 'Current Section: Detailed Description',
        description: 'This is the most critical section. Provide complete details on how your invention works.',
        link: 'USPTO Detailed Description Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/detailed-description'
      }
    };
    return helpContent[currentSection] || helpContent['Title'];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation */}
      <div className="w-72 bg-gray-50 border-r border-gray-200 p-6">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 mb-8">
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-bold text-xl text-gray-900">Patent Buddy</span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation Buttons */}
        <nav className="space-y-1">
          <Link 
            to="/patent-applications"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            My Applications
          </Link>
        </nav>

        {/* Floating Action Button */}
        <button className="fixed left-8 bottom-8 w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`overflow-auto bg-white ${showHelpPanel ? 'flex-1' : 'flex-1'}`}>
        <div className={`mx-auto p-8 ${showHelpPanel ? 'max-w-5xl' : 'max-w-7xl'}`}>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading application...</span>
            </div>
          )}
          {/* Header Strip */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Provisional Patent Application</h1>
              <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">Draft</span>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={saveApplication}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isSaving 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-blue-600 bg-white border border-blue-600 hover:bg-blue-50'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              {saveMessage && (
                <span className={`px-3 py-2 text-sm rounded-md ${
                  saveMessage.includes('Error') 
                    ? 'text-red-700 bg-red-100' 
                    : 'text-green-700 bg-green-100'
                }`}>
                  {saveMessage}
                </span>
              )}
              <button 
                onClick={saveApplication}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                  Object.values(completedSections).filter(Boolean).length === sections.length
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                }`}
                disabled={Object.values(completedSections).filter(Boolean).length !== sections.length || isSaving}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isSaving ? 'Saving...' : (Object.values(completedSections).filter(Boolean).length === sections.length ? 'Complete' : `${Object.values(completedSections).filter(Boolean).length}/${sections.length} Complete`)}
              </button>
              <button 
                onClick={() => setShowHelpPanel(!showHelpPanel)}
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showHelpPanel ? 'Hide Help' : 'Show Help'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress: {Object.values(completedSections).filter(Boolean).length} of {sections.length} sections complete</span>
              <span className="text-sm text-gray-500">{Math.round((Object.values(completedSections).filter(Boolean).length / sections.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(Object.values(completedSections).filter(Boolean).length / sections.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex space-x-2 mb-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap flex items-center ${
                  section === currentSection
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentSection(section)}
              >
                {section}
                {section === 'Detailed Description' && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-orange-500 rounded-full">Critical</span>
                )}
                {completedSections[section] && (
                  <svg className="ml-2 w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                  <li>Keep this application confidential until officially filed</li>
                  <li>Focus on the "how" rather than just stating goals</li>
                  <li>DO NOT include claims in a provisional application</li>
                  <li>Detailed Description is the most critical section</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dynamic Section Content */}
          {renderSectionContent()}

          {/* Document Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Document Preview</h3>
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowDocumentPreview(!showDocumentPreview)}
              >
                {showDocumentPreview ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showDocumentPreview && (
              <div className="bg-gray-50 rounded-md p-6 space-y-6 font-serif text-sm leading-relaxed">
                {/* Header */}
                <div className="text-center border-b-2 border-gray-300 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">PROVISIONAL PATENT APPLICATION</h1>
                  <p className="text-gray-600">United States Patent and Trademark Office</p>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">TITLE OF THE INVENTION</h2>
                  <p className="text-gray-800 pl-4">{title || '[TITLE OF THE INVENTION]'}</p>
                </div>

                {/* Cross-Reference */}
                {crossReference && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">CROSS-REFERENCE TO RELATED APPLICATIONS</h2>
                    <p className="text-gray-800 pl-4">{crossReference}</p>
                  </div>
                )}

                {/* Federal Research */}
                {federalResearch && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT</h2>
                    <p className="text-gray-800 pl-4">{federalResearch}</p>
                  </div>
                )}

                {/* Abstract */}
                {abstract && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">ABSTRACT</h2>
                    <p className="text-gray-800 pl-4">{abstract}</p>
                  </div>
                )}

                {/* Field */}
                {field && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">FIELD OF THE INVENTION</h2>
                    <p className="text-gray-800 pl-4">{field}</p>
                  </div>
                )}

                {/* Background */}
                {background && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">BACKGROUND OF THE INVENTION</h2>
                    <p className="text-gray-800 pl-4">{background}</p>
                  </div>
                )}

                {/* Summary */}
                {summary && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">SUMMARY OF THE INVENTION</h2>
                    <p className="text-gray-800 pl-4">{summary}</p>
                  </div>
                )}

                {/* Drawings */}
                {drawings && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">BRIEF DESCRIPTION OF THE DRAWINGS</h2>
                    <p className="text-gray-800 pl-4">{drawings}</p>
                  </div>
                )}

                {/* Detailed Description */}
                {detailedDescription && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">DETAILED DESCRIPTION OF THE INVENTION</h2>
                    <p className="text-gray-800 pl-4">{detailedDescription}</p>
                  </div>
                )}

                {/* Missing Sections Notice */}
                {(!title || !abstract || !field || !background || !summary || !detailedDescription) && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Incomplete Application</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>The following required sections are missing:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {!title && <li>Title of the Invention</li>}
                            {!abstract && <li>Abstract</li>}
                            {!field && <li>Field of the Invention</li>}
                            {!background && <li>Background of the Invention</li>}
                            {!summary && <li>Summary of the Invention</li>}
                            {!detailedDescription && <li>Detailed Description of the Invention</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-gray-300">
                  <p>This document is a draft and should be reviewed by a patent attorney before filing.</p>
                  <p>Provisional applications do not require claims but must provide sufficient disclosure.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help & Resources Panel */}
      {showHelpPanel && (
        <div className="w-80 bg-blue-50 border-l border-gray-200 p-6">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Help & Resources</h3>
            <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{getSectionHelp().title}</h4>
            <p className="text-sm text-gray-600 mb-4">{getSectionHelp().description}</p>
            <a 
              href={getSectionHelp().url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {getSectionHelp().link}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            </div>
          </div>

          {/* Section Importance Chart */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Section Importance</h4>
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section} className="flex items-center">
                  <span className="w-32 text-sm text-gray-600">{section}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        section === 'Detailed Description'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${100 - index * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Common Mistakes</h4>
            <ul className="space-y-2 text-sm text-red-800">
              <li>• Including claims (not needed for provisionals)</li>
              <li>• Being too vague</li>
              <li>• Public disclosure before filing</li>
              <li>• Focusing only on the problem</li>
            </ul>
            <a href="#" className="mt-4 text-sm text-blue-600 hover:text-blue-800 block">
              View example applications
            </a>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImage(null);
              }}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-opacity"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              {/* Image */}
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              {/* Image info */}
              <div className="p-4 bg-gray-50 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedImage.name}</h3>
                <p className="text-sm text-gray-600">Click outside or press ESC to close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatentAudit; 