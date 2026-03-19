import { useRef, useState } from "react";

function UploadZone({ onFile }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);
    function validateFile(file) {
        if (!file) return
        if (file.type !== "application/pdf") {
            setError("Please Select A Valid File Type");
            return
        }
        if (file.size > 50 * 1024 * 1024) {
            setError("File Size Should Be Less Than 50 MB")
            return
        }
        setError("");
        onFile(file);
    }
    function handleDragOver(e) { e.preventDefault(); setIsDragging(true) }
    function handleDragLeave(e) { e.preventDefault(); setIsDragging(false) }
    function handleDrop(e) {
        e.preventDefault()
        setIsDragging(false)
        validateFile(e.dataTransfer.files[0])
    }
    function handleChange(e) { validateFile(e.target.files[0]) }
    return (
        <div className="upload-overlay">
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>
            <div
                className={`upload-zone${isDragging ? ' drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="upload-zone-icon">📄</div>
                <div className="upload-zone-title">Drop your PDF here</div>
                <div className="upload-zone-sub">or click the button to browse</div>
                <label htmlFor="splitpdf" className="upload-zone-btn">
                    Choose PDF file
                </label>
                <input
                    type="file"
                    id="splitpdf"
                    ref={inputRef}
                    onChange={handleChange}
                    accept="application/pdf"
                    style={{ display: 'none' }}
                />
                <div className="upload-zone-note">
                    · PDF files only · Max 50MB · Nothing uploaded
                </div>
            </div>
            {error && <p className="msg-error">{error}</p>}
            <a href="../../index.html" className="upload-back"></a>
        </div>

    )
}
export default UploadZone