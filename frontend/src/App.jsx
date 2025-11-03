import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState("compress");

  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setDownloadUrl("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage("");
      setDownloadUrl("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const openFileDialog = () => inputRef.current.click();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    setIsLoading(true);
    setMessage("");
    setDownloadUrl("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`http://localhost:5001/api/${mode}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setMessage("❌ " + data.error);
      } else {
        setMessage("✅ " + data.message);
        setDownloadUrl(data.compressedFileUrl || data.decompressedFileUrl);
      }
    } catch {
      setMessage("❌ Failed to process file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero-wrap">
      <div className="hero-content">
        <h1 className="hero-title">OmniComp</h1>
        <div className="hero-subtitle">
          Compress or decompress your files instantly.<br />
          Fast, secure & effortless <span style={{color: "#3f79fd", fontWeight:500}}>by ML</span>.
        </div>
        <div style={{marginBottom:"1.1em", display:"flex",gap:"1rem"}}>
          <button
            className={`action-btn${mode==="compress"?"":" outline"}`}
            style={{background: mode==="compress"?"var(--accent)":"#e5f0fa", color:mode==="compress"?"#fff":"var(--accent)", border:mode==="compress"?"none":"2px solid #3f79fd"}}
            onClick={() => { setMode("compress"); setFile(null); }}
          >🗜️ Compress</button>
          <button
            className={`action-btn${mode==="decompress"?"":" outline"}`}
            style={{background: mode==="decompress"?"var(--accent)":"#e5f0fa", color:mode==="decompress"?"#fff":"var(--accent)", border:mode==="decompress"?"none":"2px solid #3f79fd"}}
            onClick={() => { setMode("decompress"); setFile(null); }}
          >🎈 Decompress</button>
        </div>
        <div
          className={`upload-zone${dragActive ? " active" : ""}`}
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <span className="upload-icon">📁</span>
          <div className="upload-zone-text">
            <b>Click or drag & drop your file here</b>
          </div>
          {file && <div className="selected-file">Selected: {file.name}</div>}
        </div>
        <button
          className="action-btn"
          onClick={handleUpload}
          disabled={isLoading}
          style={{width:"100%", maxWidth:"330px"}}
        >
          {isLoading
            ? "Processing..."
            : mode === "compress"
            ? "Compress File"
            : "Decompress File"}
        </button>
        {(message || downloadUrl) && (
          <div className="result-section">
            {message && <div>{message}</div>}
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="download-link"
              >⬇️ Download Result</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
