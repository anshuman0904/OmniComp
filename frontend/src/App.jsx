import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("compress"); // compress or decompress

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setDownloadUrl("");
  };

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
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to process file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>🗜️ OmniComp Web</h1>
      <p>Smart file compression and decompression powered by ML</p>

      <div className="mode-switch">
        <button
          className={mode === "compress" ? "active" : ""}
          onClick={() => setMode("compress")}
        >
          Compress
        </button>
        <button
          className={mode === "decompress" ? "active" : ""}
          onClick={() => setMode("decompress")}
        >
          Decompress
        </button>
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        style={{ marginTop: "20px" }}
      />

      <button
        onClick={handleUpload}
        disabled={isLoading}
        style={{ marginTop: "20px" }}
      >
        {isLoading
          ? "Processing..."
          : mode === "compress"
          ? "Compress File"
          : "Decompress File"}
      </button>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="download-btn"
        >
          ⬇️ Download Result
        </a>
      )}
    </div>
  );
}

export default App;
