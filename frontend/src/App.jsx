import React, { useRef, useState } from "react";
import "./App.css";

function App() {
  const [dragActive, setDragActive] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

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

    fetch("http://localhost:3000/summarize_pdf", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
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
                fullText += data;
                setSummary((prev) => prev + data);
              }
            });
            read();
          });
        }
        read();
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to summarize PDF.");
      });
  };

  return (
    <div className="container">
      <h1 className="title">Book Summarizer</h1>
      <div
        className={`dropzone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleChange}
        />
        <div className="dropzone-content">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
            <rect width="24" height="24" rx="12" fill="#7C3AED" />
            <path
              d="M12 16V8M12 8L8 12M12 8l4 4"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>
            Drag &amp; drop your{" "}
            <span className="highlight">PDF</span> here, or{" "}
            <span className="highlight">click</span> to select
          </p>
        </div>
      </div>
      {loading && (
        <div className="loader">
          <div className="spinner"></div>
          <span>Summarizing your PDF...</span>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      <div className={`summary-area ${summary ? "show" : ""}`}>
        <h2>Summary</h2>
        <div className="summary-text">
          {summary ? (
            summary
          ) : (
            <span className="placeholder">
              Your summary will appear here.
            </span>
          )}
        </div>
      </div>
      <footer>
        <span>
          Made with{" "}
          <span style={{ color: "#F59E42" }}>❤️</span> for books. Do read the whole book if you can!
        </span>
      </footer>
    </div>
  );
}

export default App;
