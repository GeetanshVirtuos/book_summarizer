import React, { useRef, useState } from "react";
import "./App.css";

function App() {
  const [dragActive, setDragActive] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryType, setSummaryType] = useState("g"); // Default to gist
  const inputRef = useRef(null);

  const summaryOptions = [
    { value: "g", label: "Gist", description: "Quick overview (~200 words)" },
    { value: "o", label: "One Page", description: "Detailed summary (~500 words)" },
    { value: "a", label: "Abridged", description: "Comprehensive summary (2% of book)" },
    { value: "ps", label: "Progressive", description: "Real-time streaming summary" }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSummary("");
    setError("");
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    uploadPDF(file);
  };

  const uploadPDF = (file) => {
    setLoading(true);
    setSummary("");
    setError("");

    const formData = new FormData();
    formData.append("pdf", file);

    fetch(`http://localhost:3000/summarize_pdf?summary_type=${summaryType}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.body) throw new Error("No response body");
        
        if (summaryType === "ps") {
          // Handle streaming response for progressive summary
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          function read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                setLoading(false);
                return;
              }
              const chunk = decoder.decode(value, { stream: true });
              // Parse SSE: data: ...\n\n
              chunk.split("\n").forEach((line) => {
                if (line.startsWith("data:")) {
                  const data = line.replace("data:", "").trim();
                  setSummary((prev) => prev + data);
                }
              });
              read();
            });
          }
          read();
        } else {
          // Handle regular JSON response for other summary types
          response.json().then((data) => {
            setLoading(false);
            if (data.error) {
              setError(data.error);
            } else {
              setSummary(data.summary || data.result || "Summary generated successfully.");
            }
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to summarize PDF. Please try again.");
        console.error("Error:", err);
      });
  };

  const currentOption = summaryOptions.find(opt => opt.value === summaryType);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1 className="title">PDF Summarizer</h1>
          <p className="subtitle">Transform lengthy documents into concise, actionable summaries</p>
        </div>

        <div className="summary-options">
          <h3>Choose Summary Type</h3>
          <div className="options-grid">
            {summaryOptions.map((option) => (
              <label key={option.value} className={`option-card ${summaryType === option.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="summaryType"
                  value={option.value}
                  checked={summaryType === option.value}
                  onChange={(e) => setSummaryType(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-label">{option.label}</span>
                  <span className="option-description">{option.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div
          className={`dropzone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <div className="dropzone-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>
              Drag & drop your <span className="highlight">PDF</span> here, or{" "}
              <span className="highlight">click to select</span>
            </span>
            {currentOption && (
              <div className="selected-type">
                Selected: {currentOption.label} - {currentOption.description}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="loader">
            <div className="spinner"></div>
            <span>
              {summaryType === "ps" ? "Generating progressive summary..." : "Processing your PDF..."}
            </span>
          </div>
        )}

        {(summary || loading) && (
          <div className={`summary-area ${summary ? "show" : ""}`}>
            <h2>Summary</h2>
            <div className={`summary-text ${!summary ? "placeholder" : ""}`}>
              {summary || "Your summary will appear here..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
