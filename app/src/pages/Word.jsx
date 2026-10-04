import React, { useState, useRef } from 'react';
import { useCloud } from '../context/cloudContext'
import { cloudWord, downloadBlob } from '../api'
const Word = () => {
  const {cloudMode, toggleCloud} = useCloud();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false, visible: false });
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  if(!cloudMode){
    return(
      <main className="tool-page">
                <div className="tool-header">
                    <div className="tool-icon-big">📦</div>
                    <h1 className="tool-h1">Compress PDF</h1>
                </div>
                <div className="cloud-gate">
                    <div className="cloud-gate-icon">☁️</div>
                    <h2 className="cloud-gate-title">Cloud Mode Required</h2>
                    <p className="cloud-gate-desc">
                        PDF to Word conversion uses backend tools on our server.
                        Enable Cloud Mode to use this feature.
                    </p>
                    <button 
                        className="action-btn"
                        onClick={toggleCloud}
                    >
                        ☁️ Enable Cloud Mode
                    </button>
                </div>
            </main>
    )
  }
  const validateFile = (file) => {
    if (file.type !== "application/pdf") {
      return `File ${file.name} is not a valid PDF.`;
    }
    return null;
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setMessage(error);
      setSelectedFile(null);
    } else {
      setMessage('');
      setSelectedFile(file);
    }
  };

  const wordPDF = async () => {
    if (!selectedFile) return;
    try{
      setLoading(true)
      const blob = await cloudWord(selectedFile)
      downloadBlob(blob,'converted.docx')
    }
    catch(err){
      showToast('Conversion failed. Try a different PDF.', true)
      console.error('Cloud Compress failed',err);
    }
    finally{
      setLoading(false);
    }
  };
  const showToast = (msg, isError = false) => {
    setStatusMessage({ text: msg, isError, visible: true });
    setTimeout(() => setStatusMessage(prev => ({ ...prev, visible: false })), 3000);
  };

  const reset = () => {
    setSelectedFile(null);
    setMessage('');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div className="tool-page">
        <div className="tool-header">
          <div className="tool-icon-big">📄</div>
          <h1 className="tool-h1">PDF To Word</h1>
          <p className="tool-sub">Convert PDF files to word document.</p>
        </div>

        <div
          className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div className="upload-zone-icon">
            <i className="fa-solid fa-file-zipper"></i>
          </div>
          <div className="upload-zone-title">Drop your PDF here</div>
          <div className="upload-zone-sub">or click the button to browse</div>

          <label htmlFor="shrinkpdf" className="upload-zone-btn" style={{ cursor: 'pointer' }}>
             Choose PDF file
          </label>

          <input
            type="file"
            id="shrinkpdf"
            accept="application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />

          <div className="upload-zone-note">
            · PDF files only ·
          </div>
        </div>

        {message && <p className="msg-error">{message}</p>}

        {selectedFile && (
          <div id="preview">
            <ul>
              <li>
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}mb)
                <button className="remove-btn" onClick={reset}>❌</button>
              </li>
            </ul>
          </div>
        )}

        {statusMessage.visible && (
          <div className={`result-msg ${statusMessage.isError ? 'error' : ''}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="action-wrap">
          <button
            className="action-btn"
            disabled={!selectedFile || loading}
            onClick={wordPDF}
          >
            <i className="fa-solid fa-compress"></i>
            {loading ? "Processing..." : "PDF To Word"}
          </button>
          <p className="action-note">
            ☁️ File is processed on our server and deleted immediately after download
          </p>
        </div>
      </div>
    </>
  );
};

export default Word;