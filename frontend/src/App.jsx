import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState("compress");
  const [resultData, setResultData] = useState(null);

  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setDownloadUrl("");
    setResultData(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage("");
      setDownloadUrl("");
      setResultData(null);
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
    setResultData(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const baseUrl = import.meta.env.VITE_API_BASE || window.location.origin;
      const res = await fetch(`${baseUrl}/api/${mode}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setMessage("❌ " + data.error);
      } else {
        setMessage("✅ " + (mode === "compress" ? "File compressed successfully!" : "File decompressed successfully!"));
        setDownloadUrl(data.compressedFileUrl || data.decompressedFileUrl);
        setResultData(data);
      }
    } catch {
      setMessage("❌ Failed to process file.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
            onClick={() => { setMode("compress"); setFile(null); setResultData(null); }}
          >🗜️ Compress</button>
          <button
            className={`action-btn${mode==="decompress"?"":" outline"}`}
            style={{background: mode==="decompress"?"var(--accent)":"#e5f0fa", color:mode==="decompress"?"#fff":"var(--accent)", border:mode==="decompress"?"none":"2px solid #3f79fd"}}
            onClick={() => { setMode("decompress"); setFile(null); setResultData(null); }}
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
        
        {(message || downloadUrl || resultData) && (
          <div className="result-section">
            {message && <div className="result-message">{message}</div>}
            
            {resultData && mode === "compress" && (
              <div className="compression-stats">
                <h3 className="stats-title">📊 Compression Results</h3>
                <div className="compression-stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Algorithm</div>
                    <div className="stat-value algorithm-badge">{resultData.algorithm}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Reduction</div>
                    <div className="stat-value reduction-percent">{resultData.reductionPercent?.toFixed(1)}%</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Compression Ratio</div>
                    <div className="stat-value">{resultData.compressionRatio?.toFixed(2)}:1</div>
                  </div>
                </div>
                <div className="size-comparison">
                  <div className="size-item original">
                    <span className="size-label">Original Size</span>
                    <span className="size-value">{formatFileSize(resultData.originalSize)}</span>
                  </div>
                  <div className="size-arrow">→</div>
                  <div className="size-item compressed">
                    <span className="size-label">Compressed Size</span>
                    <span className="size-value">{formatFileSize(resultData.compressedSize)}</span>
                  </div>
                </div>
              </div>
            )}

            {resultData && mode === "decompress" && (
              <div className="decompression-stats">
                <h3 className="stats-title">🎈 Decompression Results</h3>
                <div className="decompression-stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Algorithm</div>
                    <div className="stat-value algorithm-badge">{resultData.algorithm}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Restored File</div>
                    <div className="stat-value file-name">{resultData.restoredFileName}</div>
                  </div>
                </div>
              </div>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="download-link"
              >⬇️ Download {mode === "compress" ? "Compressed" : "Decompressed"} File</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
