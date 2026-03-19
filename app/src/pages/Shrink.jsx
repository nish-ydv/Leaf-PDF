import React, { useState, useRef } from 'react';
import * as PDFLib from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ShrinkPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false, visible: false });
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.type !== "application/pdf") {
      return `File ${file.name} is not a valid PDF.`;
    }
    const maxFile = 50 * 1024 * 1024;
    if (file.size > maxFile) {
      return `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 50MB limit.`;
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

  const pdfPageToCompressed = async (page, scale = 1.0, quality = 0.75) => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    return new Promise(resolve => {
      canvas.toBlob((blob) => {
        canvas.width = 0;
        canvas.height = 0;
        resolve(blob);
      }, "image/jpeg", quality);
    });
  };

  const shrinkPDF = async () => {
    if (!selectedFile) return;
    setLoading(true);

    try {
      const pdfBytes = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const newPdf = await PDFLib.PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const imageBlob = await pdfPageToCompressed(page, 1, 0.75);
        const imageBytes = await imageBlob.arrayBuffer();

        const image = await newPdf.embedJpg(imageBytes);
        const pdfPage = newPdf.addPage([image.width, image.height]);

        pdfPage.drawImage(image, {
          x: 0, y: 0, width: image.width, height: image.height,
        });
      }

      const shrinkedBytes = await newPdf.save();
      downloadPDF(shrinkedBytes);
      showToast("PDF Shrinked Successfully!");
      reset();
    } catch (err) {
      console.error(err);
      showToast("Failed to shrink PDF", true);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (bytes) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shrinked.pdf";
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="hero-leaves">
        <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
        <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
        <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
      </div>
      <div className="tool-page">
        <div className="tool-header">
          <div className="tool-icon-big">📦</div>
          <h1 className="tool-h1">Compress PDF</h1>
          <p className="tool-sub">Reduce the file size of your PDF without losing readability.</p>
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
            · PDF files only · Max 50MB · Nothing uploaded
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
            onClick={shrinkPDF}
          >
            <i className="fa-solid fa-compress"></i>
            {loading ? "Processing..." : "Compress PDF"}
          </button>
          <p className="action-note">
            🔒 Files stay on your device — nothing is uploaded
          </p>
        </div>
      </div>
    </>
  );
};

export default ShrinkPDF;