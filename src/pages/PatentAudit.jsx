import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { savePatentApplication, updatePatentApplication, getPatentApplication, uploadPatentImage } from '../services/patentService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isSupabaseAvailable } from '../services/supabaseClient.js';

const PatentAudit = () => {
  const { id: applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 1. Replace currentSection with currentStep (index-based navigation)
  const [currentStep, setCurrentStep] = useState(0);

  // 2. Add Yes/No state for each optional section
  const [wantsCrossReference, setWantsCrossReference] = useState(null); // null = not answered, true/false = answered
  const [wantsFederalResearch, setWantsFederalResearch] = useState(null);

  // 3. Build wizardSteps array dynamically based on answers
  const getWizardSteps = () => {
    const steps = [
      { key: 'Title' },
      { key: 'CrossReferenceGate' },
    ];
    
    if (wantsCrossReference === true) {
      steps.push({ key: 'CrossReference' });
    }
    
    steps.push({ key: 'FederalResearchGate' });
    
    if (wantsFederalResearch === true) {
      steps.push({ key: 'FederalResearch' });
    }
    
    steps.push(
      { key: 'Inventors' },
      { key: 'Abstract' },
      { key: 'Field' },
      { key: 'Background' },
      { key: 'Summary' },
      { key: 'Drawings' },
      { key: 'DetailedDescription' },
      { key: 'Review' }
    );
    
    return steps;
  };
  


  // 4. Render only the current step
  const renderCurrentStep = () => {
    const currentStepData = getWizardSteps()[currentStep];
    
    if (!currentStepData) return null;
    
    switch (currentStepData.key) {
      case 'Title':
        return renderTitleSection();
      case 'CrossReferenceGate':
        return renderCrossReferenceGate();
      case 'CrossReference':
        return renderCrossReferenceSection();
      case 'FederalResearchGate':
        return renderFederalResearchGate();
      case 'FederalResearch':
        return renderFederalResearchSection();
      case 'Inventors':
        return renderInventorsSection();
      case 'Abstract':
        return renderAbstractSection();
      case 'Field':
        return renderFieldSection();
      case 'Background':
        return renderBackgroundSection();
      case 'Summary':
        return renderSummarySection();
      case 'Drawings':
        return renderDrawingsSection();
      case 'DetailedDescription':
        return renderDetailedDescriptionSection();
      case 'Review':
        return renderReviewSection();
      default:
        return <div>Unknown step</div>;
    }
  };

  // 5. Next/Back button logic
  const goToNextStep = () => {
    if (currentStep < getWizardSteps().length - 1) setCurrentStep(currentStep + 1);
  };
  const goToPrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // 6. Progress indicator
  const renderProgress = () => (
    <div className="w-full flex justify-center items-center mb-6">
      <span className="text-gray-700 font-medium">Step {currentStep + 1} of {getWizardSteps().length}</span>
    </div>
  );

  // 7. Gate question renderers for optional sections
  function renderCrossReferenceGate() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cross-Reference to Related Applications</h2>
        <p className="text-gray-600 mb-6">Are you claiming priority to an earlier U.S. or foreign patent application?</p>
        <div className="flex gap-4">
          <button onClick={() => { setWantsCrossReference(true); goToNextStep(); }} className="px-4 py-2 bg-blue-600 text-white rounded">Yes</button>
          <button onClick={() => { setWantsCrossReference(false); goToNextStep(); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">No</button>
        </div>
      </div>
    );
  }
  function renderFederalResearchGate() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Federally Sponsored Research or Development</h2>
        <p className="text-gray-600 mb-6">Was this invention made with U.S. federal government support?</p>
        <div className="flex gap-4">
          <button onClick={() => { setWantsFederalResearch(true); goToNextStep(); }} className="px-4 py-2 bg-blue-600 text-white rounded">Yes</button>
          <button onClick={() => { setWantsFederalResearch(false); goToNextStep(); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">No</button>
        </div>
      </div>
    );
  }

  // Add missing render functions for each section
  function renderTitleSection() {
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
        </div>
      </div>
    );
  }

  function renderCrossReferenceSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cross-Reference to Related Applications</h2>
        <p className="text-gray-600 mb-6">Provide the application number and filing date of the earlier application you are claiming priority to.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          placeholder="e.g., This application claims the benefit of U.S. Provisional Application No. 62/123,456, filed Jan. 1, 2023."
          value={crossReference}
          onChange={(e) => setCrossReference(e.target.value)}
        />
      </div>
    );
  }

  function renderFederalResearchSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Federally Sponsored Research or Development</h2>
        <p className="text-gray-600 mb-6">Provide the contract or grant number and the government agency that supported this invention.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          placeholder="e.g., This invention was made with government support under contract no. ABC-123 awarded by the National Science Foundation. The government has certain rights in the invention."
          value={federalResearch}
          onChange={(e) => setFederalResearch(e.target.value)}
        />
      </div>
    );
  }

  function renderInventorsSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventors</h2>
        <p className="text-gray-600 mb-6">List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution to the inventive concept.</p>
        
        <div className="space-y-6">
          {inventors.map((inventor, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Inventor {index + 1}</h3>
                {inventors.length > 1 && (
                  <button
                    onClick={() => {
                      const newInventors = inventors.filter((_, i) => i !== index);
                      setInventors(newInventors);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., John Smith"
                    value={inventor.name}
                    onChange={(e) => {
                      const newInventors = [...inventors];
                      newInventors[index].name = e.target.value;
                      setInventors(newInventors);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 123 Main St, City, State, ZIP"
                    value={inventor.address}
                    onChange={(e) => {
                      const newInventors = [...inventors];
                      newInventors[index].address = e.target.value;
                      setInventors(newInventors);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., United States"
                    value={inventor.citizenship}
                    onChange={(e) => {
                      const newInventors = [...inventors];
                      newInventors[index].citizenship = e.target.value;
                      setInventors(newInventors);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Residence</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., California"
                    value={inventor.residence}
                    onChange={(e) => {
                      const newInventors = [...inventors];
                      newInventors[index].residence = e.target.value;
                      setInventors(newInventors);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => setInventors([...inventors, { name: '', address: '', citizenship: '', residence: '' }])}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
          >
            + Add Another Inventor
          </button>
        </div>
      </div>
    );
  }

  function renderAbstractSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
        <p className="text-gray-600 mb-6">Provide a concise summary of your invention (150 words or less). This should explain what your invention does and its key benefits.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={6}
          placeholder="Describe your invention in a clear, concise manner..."
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        />
      </div>
    );
  }

  function renderFieldSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Field of Invention</h2>
        <p className="text-gray-600 mb-6">Describe the technical field to which your invention relates.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          placeholder="e.g., The present invention relates to artificial intelligence and machine learning systems, specifically to natural language processing and content generation."
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
      </div>
    );
  }

  function renderBackgroundSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Background</h2>
        <p className="text-gray-600 mb-6">Describe the current state of the art and the problems your invention solves.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={8}
          placeholder="Describe the existing technology and the problems it has..."
          value={background}
          onChange={(e) => setBackground(e.target.value)}
        />
      </div>
    );
  }

  function renderSummarySection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-600 mb-6">Provide a brief summary of your invention, including its main features and advantages.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={6}
          placeholder="Summarize your invention and its key features..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
    );
  }

  function renderDrawingsSection() {
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Initialize names for new files
      const newNames = {};
      files.forEach(file => {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        newNames[file.name] = fileName;
      });
      setImageNames(prev => ({ ...prev, ...newNames }));
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) return;
      
      setUploading(true);
      setUploadError('');
      
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          // Create a new file with the custom name if provided
          let fileToUpload = file;
          if (imageNames[file.name]) {
            const customName = imageNames[file.name];
            const extension = file.name.split('.').pop();
            const newFileName = `${customName}.${extension}`;
            
            // Create a new File object with the custom name
            fileToUpload = new File([file], newFileName, {
              type: file.type,
              lastModified: file.lastModified,
            });
          }
          
          const response = await uploadPatentImage(fileToUpload, user.id, applicationId || 'draft');
          return response;
        });
        
        const uploadedImages = await Promise.all(uploadPromises);
        setImages(prev => [...prev, ...uploadedImages]);
        setSelectedFiles([]);
        setImageNames({});
        
      } catch (error) {
        console.error('Error uploading images:', error);
        setUploadError('Failed to upload images. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    const removeImage = (imageToRemove) => {
      setImages(prev => prev.filter(img => img !== imageToRemove));
    };

    const openImageModal = (image) => {
      setSelectedImage(image);
      setShowImageModal(true);
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Drawings and Images</h2>
        <p className="text-gray-600 mb-6">Upload drawings and images that accompany your patent application. You can provide custom names for each image.</p>
        
        {/* Text Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description of Drawings</label>
          <textarea
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="e.g., FIG. 1 is a block diagram showing the overall system architecture..."
            value={drawings}
            onChange={(e) => setDrawings(e.target.value)}
          />
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Custom Name</label>
                    <input
                      type="text"
                      value={imageNames[file.name] || ''}
                      onChange={(e) => setImageNames(prev => ({ ...prev, [file.name]: e.target.value }))}
                      placeholder="e.g., Figure 1 - System Architecture"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      setImageNames(prev => {
                        const newNames = { ...prev };
                        delete newNames[file.name];
                        return newNames;
                      });
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Upload Button */}
            <div className="mt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                  uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
            </div>
          </div>
        )}

        {/* Uploaded Images */}
        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name || `Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => openImageModal(image)}
                    title="Click to enlarge"
                  />
                  {/* Click indicator */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image);
                        }}
                        className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 truncate">
                    {image.name || `Image ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setShowImageModal(false)}
          >
            <div className="max-w-6xl max-h-full p-4 relative">
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(false);
                  }}
                  className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-200 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Zoom indicator */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-10">
                  Click outside to close • ESC to close
                </div>

                {/* Main image */}
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name || 'Selected image'}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Image info */}
                <div className="mt-4 text-center text-white">
                  <p className="font-medium text-lg">{selectedImage.name || 'Untitled Image'}</p>
                  {selectedImage.size && (
                    <p className="text-sm text-gray-300 mt-1">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderDetailedDescriptionSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Description</h2>
        <p className="text-gray-600 mb-6">Provide a detailed description of your invention, including how it works and how to make and use it.</p>
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={12}
          placeholder="Provide a detailed description of your invention..."
          value={detailedDescription}
          onChange={(e) => setDetailedDescription(e.target.value)}
        />
      </div>
    );
  }

  function renderReviewSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Application</h2>
        <p className="text-gray-600 mb-6">Review all sections of your patent application before saving.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Title</span>
            <span className={title.trim() ? 'text-green-600' : 'text-red-600'}>
              {title.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Inventors</span>
            <span className={inventors.some(inv => inv.name.trim() && inv.address.trim()) ? 'text-green-600' : 'text-red-600'}>
              {inventors.some(inv => inv.name.trim() && inv.address.trim()) ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Abstract</span>
            <span className={abstract.trim() ? 'text-green-600' : 'text-red-600'}>
              {abstract.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Field</span>
            <span className={field.trim() ? 'text-green-600' : 'text-red-600'}>
              {field.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Background</span>
            <span className={background.trim() ? 'text-green-600' : 'text-red-600'}>
              {background.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Summary</span>
            <span className={summary.trim() ? 'text-green-600' : 'text-red-600'}>
              {summary.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Drawings</span>
            <span className={drawings.trim() ? 'text-green-600' : 'text-red-600'}>
              {drawings.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Detailed Description</span>
            <span className={detailedDescription.trim() ? 'text-green-600' : 'text-red-600'}>
              {detailedDescription.trim() ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>
    );
  }

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
  
  // Add state for inventors
  const [inventors, setInventors] = useState([{
    name: '',
    address: '',
    citizenship: '',
    residence: ''
  }]);

  // Completion status for each section
  const [completedSections, setCompletedSections] = useState({
    Title: false,
    'Cross-Reference to Related Applications (Optional)': false,
    'Federally Sponsored Research or Development (Optional)': false,
    Inventors: false,
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
    'Inventors',
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
    inventors.some(inv => inv.name.trim() && inv.address.trim()),
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
          setInventors(application.inventors || [{
            name: '',
            address: '',
            citizenship: '',
            residence: ''
          }]);
          
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
        inventors,
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
    switch (currentStep) {
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

      case 'Inventors':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventors</h2>
            <p className="text-gray-600 mb-6">List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution to the inventive concept.</p>
            
            <div className="space-y-6">
              {inventors.map((inventor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Inventor {index + 1}</h3>
                    {inventors.length > 1 && (
                      <button
                        onClick={() => {
                          const newInventors = inventors.filter((_, i) => i !== index);
                          setInventors(newInventors);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., John Smith"
                        value={inventor.name}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].name = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., United States"
                        value={inventor.citizenship}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].citizenship = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residence *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., California, United States"
                        value={inventor.residence}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].residence = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <textarea
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={2}
                        placeholder="Full mailing address"
                        value={inventor.address}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].address = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setInventors([...inventors, {
                    name: '',
                    address: '',
                    citizenship: '',
                    residence: ''
                  }]);
                }}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                + Add Another Inventor
              </button>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Inventor Requirements</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Each inventor must have contributed to the conception of the invention</li>
                  <li>• Include all inventors who made significant contributions</li>
                  <li>• Provide complete and accurate information for each inventor</li>
                  <li>• All inventors must sign the application</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Inventors: !prev.Inventors }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Inventors
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Inventors ? (
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
      'Inventors': {
        title: 'Current Section: Inventors',
        description: 'List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution.',
        link: 'USPTO Inventor Requirements',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/inventorship'
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
    return helpContent[currentStep] || helpContent['Title'];
  };

  // Add a live document preview with watermark
  const renderDocumentPreview = () => (
    <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-lg mt-8 max-w-2xl mx-auto overflow-hidden" style={{ minHeight: 600 }}>
      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          left: '-40%',
          bottom: '-10%',
          width: '180%',
          height: '180%',
          pointerEvents: 'none',
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-25deg)',
        }}
      >
        <span
          style={{
            fontSize: 80,
            color: '#2563eb',
            opacity: 0.08,
            fontWeight: 900,
            letterSpacing: 8,
            userSelect: 'none',
          }}
        >
          ThinkTactAI
        </span>
      </div>
      {/* Document Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PROVISIONAL PATENT APPLICATION</h1>
          <p className="text-gray-600">United States Patent and Trademark Office</p>
        </div>
        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">TITLE OF THE INVENTION</h2>
          <p className="text-gray-800 pl-4">{title || '[TITLE OF THE INVENTION]'}</p>
        </div>
        {/* Inventors */}
        {inventors && inventors.length > 0 && inventors.some(inv => inv.name.trim()) && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">INVENTORS</h2>
            <ul className="pl-4 space-y-2">
              {inventors.filter(inv => inv.name.trim()).map((inv, idx) => (
                <li key={idx} className="text-gray-800">
                  <span className="font-semibold">{inv.name}</span>
                  {inv.citizenship && <span>, Citizenship: {inv.citizenship}</span>}
                  {inv.residence && <span>, Residence: {inv.residence}</span>}
                  {inv.address && <span>, Address: {inv.address}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Cross-Reference */}
        {crossReference && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">CROSS-REFERENCE TO RELATED APPLICATIONS</h2>
            <p className="text-gray-800 pl-4">{crossReference}</p>
          </div>
        )}
        {/* Federal Research */}
        {federalResearch && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT</h2>
            <p className="text-gray-800 pl-4">{federalResearch}</p>
          </div>
        )}
        {/* Abstract */}
        {abstract && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">ABSTRACT</h2>
            <p className="text-gray-800 pl-4">{abstract}</p>
          </div>
        )}
        {/* Field */}
        {field && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">FIELD OF THE INVENTION</h2>
            <p className="text-gray-800 pl-4">{field}</p>
          </div>
        )}
        {/* Background */}
        {background && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">BACKGROUND OF THE INVENTION</h2>
            <p className="text-gray-800 pl-4">{background}</p>
          </div>
        )}
        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">SUMMARY OF THE INVENTION</h2>
            <p className="text-gray-800 pl-4">{summary}</p>
          </div>
        )}
        {/* Drawings */}
        {drawings && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">BRIEF DESCRIPTION OF THE DRAWINGS</h2>
            <p className="text-gray-800 pl-4">{drawings}</p>
          </div>
        )}
        {/* Detailed Description */}
        {detailedDescription && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 mt-6">DETAILED DESCRIPTION OF THE INVENTION</h2>
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
    </div>
  );

  // Add state for tracking sections that need review
  const [sectionsNeedingReview, setSectionsNeedingReview] = useState(new Set());

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);
  
  // Helper function to check if a section is completed
  const isSectionCompleted = (stepKey) => {
    switch (stepKey) {
      case 'Title':
        return title.trim() !== '';
      case 'CrossReference':
        return wantsCrossReference === false || (wantsCrossReference === true && crossReference.trim() !== '');
      case 'FederalResearch':
        return wantsFederalResearch === false || (wantsFederalResearch === true && federalResearch.trim() !== '');
      case 'Inventors':
        return inventors.some(inv => inv.name.trim() && inv.address.trim());
      case 'Abstract':
        return abstract.trim() !== '';
      case 'Field':
        return field.trim() !== '';
      case 'Background':
        return background.trim() !== '';
      case 'Summary':
        return summary.trim() !== '';
      case 'Drawings':
        return drawings.trim() !== '';
      case 'DetailedDescription':
        return detailedDescription.trim() !== '';
      default:
        return false;
    }
  };

  // Helper function to get step display name
  const getStepDisplayName = (stepKey) => {
    switch (stepKey) {
      case 'Title':
        return 'Title of Invention';
      case 'CrossReferenceGate':
        return 'Cross-Reference (Optional)';
      case 'CrossReference':
        return 'Cross-Reference Details';
      case 'FederalResearchGate':
        return 'Federal Research (Optional)';
      case 'FederalResearch':
        return 'Federal Research Details';
      case 'Inventors':
        return 'Inventors';
      case 'Abstract':
        return 'Abstract';
      case 'Field':
        return 'Field of Invention';
      case 'Background':
        return 'Background';
      case 'Summary':
        return 'Summary';
      case 'Drawings':
        return 'Drawings';
      case 'DetailedDescription':
        return 'Detailed Description';
      case 'Review':
        return 'Review & Save';
      default:
        return stepKey;
    }
  };

  // Helper function to check if step needs review
  const needsReview = (stepKey) => {
    return sectionsNeedingReview.has(stepKey);
  };

  // Mark section for review
  const markForReview = (stepKey) => {
    setSectionsNeedingReview(prev => new Set([...prev, stepKey]));
  };

  // Clear review mark when section is completed
  const clearReviewMark = (stepKey) => {
    setSectionsNeedingReview(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepKey);
      return newSet;
    });
  };

  // Render progress tracker sidebar
  const renderProgressTracker = () => (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      {/* Logo & Title */}
      <div className="flex items-center space-x-3 mb-8">
        <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-bold text-xl text-gray-900">Patent Buddy</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-8">
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

      {/* Progress Tracker */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Progress</h3>
        <div className="space-y-2">
          {getWizardSteps().map((step, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = isSectionCompleted(step.key);
            const needsReviewFlag = needsReview(step.key);
            
            return (
              <div
                key={step.key}
                className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50'
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : needsReviewFlag
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                {/* Step Number */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCurrent
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : needsReviewFlag
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Info */}
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : needsReviewFlag ? 'text-yellow-900' : 'text-gray-700'
                  }`}>
                    {getStepDisplayName(step.key)}
                  </p>
                  {needsReviewFlag && (
                    <p className="text-xs text-yellow-700 mt-1">Needs review</p>
                  )}
                </div>

                {/* Status Icons */}
                <div className="flex-shrink-0">
                  {needsReviewFlag && !isCompleted && (
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Progress Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium text-green-600">
              {getWizardSteps().filter(step => isSectionCompleted(step.key)).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Needs Review:</span>
            <span className="font-medium text-yellow-600">
              {sectionsNeedingReview.size}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium text-gray-600">
              {getWizardSteps().length - getWizardSteps().filter(step => isSectionCompleted(step.key)).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Add "Come Back Later" button to each step
  const renderComeBackLaterButton = () => (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <button
        onClick={() => {
          markForReview(getWizardSteps()[currentStep].key);
          goToNextStep();
        }}
        className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Come Back Later
      </button>
    </div>
  );

  // Update the main return to include sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Progress Tracker */}
      {renderProgressTracker()}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          {/* Progress Indicator */}
          {renderProgress()}

          {/* Step Content */}
          <div className="w-full max-w-2xl mx-auto">
            {renderCurrentStep()}
            {renderComeBackLaterButton()}
          </div>

          {/* Document Preview */}
          <div className="w-full max-w-2xl mx-auto">{renderDocumentPreview()}</div>

          {/* Navigation Buttons */}
          <div className="w-full max-w-2xl mx-auto flex justify-between mt-8">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-md font-medium ${currentStep === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Back
            </button>
            {currentStep === getWizardSteps().length - 1 ? (
              <button
                onClick={saveApplication}
                className="px-6 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (isSectionCompleted(getWizardSteps()[currentStep].key)) {
                    clearReviewMark(getWizardSteps()[currentStep].key);
                  }
                  goToNextStep();
                }}
                className="px-6 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>

          {/* Save message */}
          {saveMessage && (
            <div className="mt-4 text-center text-green-700 font-medium">{saveMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentAudit; 