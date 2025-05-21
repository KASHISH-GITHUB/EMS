import React, { useState } from "react";

const ResumeScreening = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !jobDescription) {
      setError("Please select a resume file and enter a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    formData.append("resumes", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("http://localhost:5050/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.message || "Error uploading file.");
      }
    } catch (err) {
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Resume Screening Tool</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 bg-white p-6 rounded-md shadow-md">
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            rows="4"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the job description here..."
            required
          />
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Resume (PDF)
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-600 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Uploading..." : "Upload and Analyze"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 text-sm font-medium">{error}</div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resume Analysis Results:</h3>
          <ul className="space-y-6">
            {results.map((result, index) => (
              <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
                <p className="font-semibold text-blue-700">{result.filename}</p>
                <p className="text-sm text-gray-600">Score: {result.score}</p>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Preview:</p>
                  <pre className="text-sm bg-white border border-gray-200 rounded-md p-2 overflow-auto whitespace-pre-wrap text-gray-800 max-h-60">
                    {result.preview}
                  </pre>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeScreening;
