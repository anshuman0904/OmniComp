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
  const [progressStages, setProgressStages] = useState([]);
  const [currentStage, setCurrentStage] = useState("");

  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setDownloadUrl("");
    setResultData(null);
    setProgressStages([]);
    setCurrentStage("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage("");
      setDownloadUrl("");
      setResultData(null);
      setProgressStages([]);
      setCurrentStage("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const openFileDialog = () => inputRef.current.click();

  const addProgressStage = (stage) => {
    setProgressStages(prev => [...prev, stage]);
    setCurrentStage(stage);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    setIsLoading(true);
    setMessage("");
    setDownloadUrl("");
    setResultData(null);
    setProgressStages([]);
    setCurrentStage("");

    // Simulate the progress stages based on backend logs
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Stage 1: File received
      addProgressStage(`📁 Received file for ${mode}ion: ${file.name} (${file.type})`);
      await delay(800);

      // Stage 2: Connecting to Hugging Face
      addProgressStage("🔗 Connecting to Hugging Face Space");
      await delay(1000);

      // Stage 3: File size
      addProgressStage(`📊 File size: ${formatFileSize(file.size)}`);
      await delay(500);

      // Stage 4: Sending to route
      addProgressStage(`🚀 Sending file to /${mode}_file route on Hugging Face`);
      
      const formData = new FormData();
      formData.append("file", file);
      const baseUrl = import.meta.env.VITE_API_BASE || window.location.origin;
      const res = await fetch(`${baseUrl}/api/${mode}`, {
        method: "POST",
        body: formData,
      });

      await delay(1500);
      
      const data = await res.json();
      
      if (data.error) {
        setCurrentStage("");
        setMessage("❌ " + data.error);
      } else {
        // Stage 5: Complete
        addProgressStage(`✅ ${mode === "compress" ? "Compression" : "Decompression"} complete!`);
        await delay(800);
        
        setCurrentStage("");
        setMessage("🎉 " + (mode === "compress" ? "File compressed successfully!" : "File decompressed successfully!"));
        setDownloadUrl(data.compressedFileUrl || data.decompressedFileUrl);
        setResultData(data);
      }
    } catch (error) {
      setCurrentStage("");
      setMessage("❌ Failed to process file.");
      console.error("Upload error:", error);
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
            onClick={() => { setMode("compress"); setFile(null); setResultData(null); setProgressStages([]); setCurrentStage(""); setMessage(""); setDownloadUrl("");}}
          >🗜️ Compress</button>
          <button
            className={`action-btn${mode==="decompress"?"":" outline"}`}
            style={{background: mode==="decompress"?"var(--accent)":"#e5f0fa", color:mode==="decompress"?"#fff":"var(--accent)", border:mode==="decompress"?"none":"2px solid #3f79fd"}}
            onClick={() => { setMode("decompress"); setFile(null); setResultData(null); setProgressStages([]); setCurrentStage(""); setMessage(""); setDownloadUrl(""); }}
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

        {isLoading && (
          <div className="progress-container">
            <div className="progress-spinner">
              <div className="spinner"></div>
            </div>
            <div className="progress-stages">
              {progressStages.map((stage, index) => (
                <div 
                  key={index} 
                  className={`progress-stage ${index === progressStages.length - 1 ? 'current' : 'completed'}`}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        )}
        
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
