import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatentAudit = () => {
  const [file, setFile] = useState(null);
  const [concerns, setConcerns] = useState('');
  const [feedbackType, setFeedbackType] = useState('ai');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the file upload and form submission
    navigate('/patent-audit-thanks');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Upload Your Patent Draft — I'll Roast It for Free
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Before you waste thousands or embarrass yourself at the USPTO, let me show you what's broken.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-16 space-y-8">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Drop your draft here (AI-written messes welcome)
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label className="relative cursor-pointer rounded-md bg-white font-semibold text-pink-950 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-950 focus-within:ring-offset-2 hover:text-pink-900">
                    <span>Upload a file</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept=".docx,.pdf"
                      required
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PDF or DOCX up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Concerns Text Box */}
          <div>
            <label htmlFor="concerns" className="block text-sm font-medium text-gray-700">
              What's stressing you out about this patent?
            </label>
            <div className="mt-2">
              <textarea
                id="concerns"
                name="concerns"
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                placeholder="Like… I used ChatGPT and I'm scared it makes no sense."
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
              />
            </div>
          </div>

          {/* Feedback Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              How do you want your feedback?
            </label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center">
                <input
                  id="ai-roast"
                  name="feedback-type"
                  type="radio"
                  value="ai"
                  checked={feedbackType === 'ai'}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-pink-950 focus:ring-pink-950"
                />
                <label htmlFor="ai-roast" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                  AI roast
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="human-roast"
                  name="feedback-type"
                  type="radio"
                  value="human"
                  checked={feedbackType === 'human'}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-pink-950 focus:ring-pink-950"
                />
                <label htmlFor="human-roast" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                  Human roast
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="both-roast"
                  name="feedback-type"
                  type="radio"
                  value="both"
                  checked={feedbackType === 'both'}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-pink-950 focus:ring-pink-950"
                />
                <label htmlFor="both-roast" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                  Both (I can handle the truth)
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full rounded-md bg-pink-950 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950"
            >
              Get My Audit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatentAudit; 