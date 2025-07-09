import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { savePatentApplication, updatePatentApplication, getPatentApplication } from '../services/patentService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // New state for other sections
  const [field, setField] = useState('');
  const [background, setBackground] = useState('');
  const [summary, setSummary] = useState('');
  const [drawings, setDrawings] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [critical, setCritical] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [boilerplate, setBoilerplate] = useState('');

  // Completion status for each section
  const [completedSections, setCompletedSections] = useState({
    Title: false,
    Field: false,
    Background: false,
    Summary: false,
    Drawings: false,
    'Detailed Description': false,
    Critical: false,
    Alternatives: false,
    Boilerplate: false
  });

  const sections = ['Title', 'Field', 'Background', 'Summary', 'Drawings', 'Detailed Description', 'Critical', 'Alternatives', 'Boilerplate'];
  
  // Calculate actual completed sections
  const completedSectionsCount = [
    title.trim(),
    field.trim(),
    background.trim(),
    summary.trim(),
    drawings.trim(),
    detailedDescription.trim(),
    critical.trim(),
    alternatives.trim(),
    boilerplate.trim()
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
          setField(application.field || '');
          setBackground(application.background || '');
          setSummary(application.summary || '');
          setDrawings(application.drawings || '');
          setDetailedDescription(application.detailedDescription || '');
          setCritical(application.critical || '');
          setAlternatives(application.alternatives || '');
          setBoilerplate(application.boilerplate || '');
          
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
        field,
        background,
        summary,
        drawings,
        detailedDescription,
        critical,
        alternatives,
        boilerplate,
        completedSections,
        status: Object.values(completedSections).filter(Boolean).length === sections.length ? 'complete' : 'draft'
      };

      let result;
      if (applicationId) {
        // Update existing application
        result = await updatePatentApplication(applicationId, applicationData);
        setSaveMessage('Application updated successfully!');
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

      case 'Critical':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Critical Elements and Novel Features</h2>
            <p className="text-gray-600 mb-6">Identify the most important and novel aspects of your invention.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Critical Elements</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={6}
                  placeholder="Describe the critical, novel elements that make your invention unique and patentable..."
                  value={critical}
                  onChange={(e) => setCritical(e.target.value)}
                />
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">Critical Elements Focus</h4>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li>• What makes your invention different from prior art?</li>
                  <li>• Which elements are essential to the invention?</li>
                  <li>• What would break if these elements were removed?</li>
                  <li>• Focus on technical innovations, not obvious combinations</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Critical: !prev.Critical }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Critical
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Critical ? (
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

      case 'Alternatives':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alternative Embodiments</h2>
            <p className="text-gray-600 mb-6">Describe alternative ways to implement your invention or variations of the core concept.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Implementations</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={8}
                  placeholder="Describe alternative ways to implement your invention, different materials, methods, or configurations..."
                  value={alternatives}
                  onChange={(e) => setAlternatives(e.target.value)}
                />
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-2">Alternative Embodiments Tips</h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li>• Consider different materials or components</li>
                  <li>• Describe variations in implementation</li>
                  <li>• Include different use cases or applications</li>
                  <li>• Show flexibility in your invention design</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Alternatives: !prev.Alternatives }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Alternatives
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Alternatives ? (
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

      case 'Boilerplate':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Standard Language and Disclaimers</h2>
            <p className="text-gray-600 mb-6">Include standard patent language, disclaimers, and legal boilerplate text.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boilerplate Text</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={8}
                  placeholder="Include standard patent language such as: 'While the invention has been described with reference to specific embodiments...'"
                  value={boilerplate}
                  onChange={(e) => setBoilerplate(e.target.value)}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Standard Boilerplate Elements</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Disclaimer of specific embodiments</li>
                  <li>• Statement about equivalents</li>
                  <li>• Reservation of rights</li>
                  <li>• Standard legal language</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Boilerplate: !prev.Boilerplate }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Boilerplate
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Boilerplate ? (
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
        link: 'Learn more about titles'
      },
      'Field': {
        title: 'Current Section: Field',
        description: 'Define the technical area your invention belongs to. Be broad enough to encompass your invention.',
        link: 'Learn more about field definitions'
      },
      'Background': {
        title: 'Current Section: Background',
        description: 'Describe the problem your invention solves and why existing solutions are inadequate.',
        link: 'Learn more about background sections'
      },
      'Summary': {
        title: 'Current Section: Summary',
        description: 'Provide a concise overview of your invention and its key advantages.',
        link: 'Learn more about summaries'
      },
      'Drawings': {
        title: 'Current Section: Drawings',
        description: 'Describe any figures or diagrams that illustrate your invention.',
        link: 'Learn more about drawing descriptions'
      },
      'Detailed Description': {
        title: 'Current Section: Detailed Description',
        description: 'This is the most critical section. Provide complete details on how your invention works.',
        link: 'Learn more about detailed descriptions'
      },
      'Critical': {
        title: 'Current Section: Critical Elements',
        description: 'Identify the novel and essential aspects that make your invention patentable.',
        link: 'Learn more about critical elements'
      },
      'Alternatives': {
        title: 'Current Section: Alternatives',
        description: 'Describe different ways to implement your invention or variations.',
        link: 'Learn more about alternative embodiments'
      },
      'Boilerplate': {
        title: 'Current Section: Boilerplate',
        description: 'Include standard patent language and legal disclaimers.',
        link: 'Learn more about boilerplate language'
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
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
            <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Provisional
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            My Documents
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
            </svg>
            Resources
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </a>
        </nav>

        {/* Recent Documents */}
        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Documents</h3>
          <div className="mt-2 space-y-1">
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">AI-Powered Content Gen...</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Smart Home Controller</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Neural Network Architect...</a>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed left-8 bottom-8 w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-5xl mx-auto p-8">
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
              <div className="bg-gray-50 rounded-md p-6 space-y-4">
                <h4 className="text-xl font-semibold text-gray-900 text-center">PROVISIONAL PATENT APPLICATION</h4>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">{title || '[TITLE OF THE INVENTION]'}</h5>
                  <p className="text-gray-600">FIELD OF THE INVENTION — {field ? 'Completed' : 'Not yet completed'}</p>
                  <p className="text-gray-600">BACKGROUND OF THE INVENTION — {background ? 'Completed' : 'Not yet completed'}</p>
                  <p className="text-gray-600">SUMMARY OF THE INVENTION — {summary ? 'Completed' : 'Not yet completed'}</p>
                  <p className="text-gray-600">BRIEF DESCRIPTION OF THE DRAWINGS — {drawings ? 'Completed' : 'Not yet completed'}</p>
                  <p className="text-gray-600">DETAILED DESCRIPTION — {detailedDescription ? 'Completed' : 'Not yet completed'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help & Resources Panel */}
      <div className="w-80 bg-blue-50 border-l border-gray-200 p-6">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Help & Resources</h3>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{getSectionHelp().title}</h4>
            <p className="text-sm text-gray-600 mb-4">{getSectionHelp().description}</p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">{getSectionHelp().link}</a>
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
    </div>
  );
};

export default PatentAudit; 