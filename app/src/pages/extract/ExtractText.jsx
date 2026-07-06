import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
function ExtractText() {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [extractedText, setExtractedText] = useState("");
    const [statusMessage, setStatusMessage] = useState({
        text: "",
        isError: false,
        visible: false,
    });
    function showToast(text, isError = false) {
        setStatusMessage({
            text,
            isError,
            visible: true,
        });

        setTimeout(() => {
            setStatusMessage(prev => ({
                ...prev,
                visible: false,
            }));
        }, 3000);
    }
    async function validFile(file) {
        if (!file) {
            setMessage("No File Selected");
            return false;
        }

        if (file.type !== "application/pdf") {
            setSelectedFile(null);
            setMessage(`${file.name} is not a valid PDF.`);
            return false;
        }

        if (file.size > 50 * 1024 * 1024) {
            const size = (file.size / 1024 / 1024).toFixed(2);
            setSelectedFile(null);
            setMessage(`File size ${size}MB exceeds 50MB.`);
            return false;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();

            const pdfDoc = await PDFDocument.load(arrayBuffer);

            setSelectedFile(file);
            setPageCount(pdfDoc.getPageCount());

            setMessage("");
            setExtractedText("");
            return true;
        } catch (err) {
            console.error(err);
            setMessage("Failed to load PDF.");
            return false;
        }
    }
    function handleDragOver(e) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        validFile(e.dataTransfer.files[0]);
    }

    function handleFile(e) {
        validFile(e.target.files[0]);
    }

    function removeFile() {
        setSelectedFile(null);
        setMessage("");
        setPageCount(0);
        setExtractedText("");

        setStatusMessage({
            text: "",
            isError: false,
            visible: false,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
    async function copyText() {
        if (!extractedText) {
            showToast("No Text To Copy", true);
            return;
        }
        try {
            await navigator.clipboard.writeText(extractedText);
            showToast("Text Copied To Clipboard");
        }
        catch (err) {
            console.error(err);
            showToast("Failed To Copy Text", true);
        }
    }
    async function handleExtractText() {
        if (!selectedFile) {
            showToast("Select A PDF First", true);
            return;
        }
        setLoading(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
            }).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map(item => ("str" in item ? item.str : ""))
                    .join(" ");
                text += pageText + "\n\n";
            }
            setExtractedText(text);
            showToast("Text Extracted Successfully");
        }
        catch (err) {
            console.error(err);
            showToast("Failed To Extract Text", true);
        }
        finally {
            setLoading(false);
        }
    }
    function downloadTxt() {
        if (!extractedText) {
            showToast("No text to download", true);
            return;
        }

        const blob = new Blob([extractedText], {
            type: "text/plain",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        const fileName = selectedFile
            ? selectedFile.name.replace(/\.pdf$/i, "")
            : "extracted_text";

        a.download = `${fileName}.txt`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        showToast("Text downloaded successfully!");
    }
    return (
        <>
            {statusMessage.visible && (
                <div
                    className={`toast ${statusMessage.isError ? "error" : ""}`}
                >
                    {statusMessage.isError ? "❌" : "✅"}
                    <span>{statusMessage.text}</span>
                </div>
            )}
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>

            <main className="tool-page">

                <div className="tool-header">
                    <div className="tool-icon-big">📝</div>

                    <h1 className="tool-h1">
                        Extract Text
                    </h1>

                    <p className="tool-sub">
                        Extract all text from your PDF and copy or download it as a TXT file.
                    </p>
                </div>

                <div
                    className={`upload-zone${isDragging ? " drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="upload-zone-icon">📄</div>

                    <div className="upload-zone-title">
                        Drop your PDF here
                    </div>

                    <div className="upload-zone-sub">
                        or click the button to browse
                    </div>

                    <label
                        htmlFor="extracttext"
                        className="upload-zone-btn"
                    >
                        Choose PDF file
                    </label>

                    <input
                        ref={fileInputRef}
                        id="extracttext"
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={handleFile}
                    />

                    <div className="upload-zone-note">
                        · PDF files only · Max 50MB
                    </div>
                </div>

                {message && (
                    <p className="msg-error">
                        {message}
                    </p>
                )}

                {selectedFile && (
                    <>
                        <div className="split-file-wrap">
                            <div className="split-file-item">

                                <span className="split-file-icon">
                                    📄
                                </span>

                                <span className="split-file-name">
                                    {selectedFile.name}
                                </span>

                                <span className="split-page-badge">
                                    {pageCount} pages
                                </span>

                                <button
                                    className="remove-btn"
                                    onClick={removeFile}
                                >
                                    ❌
                                </button>

                            </div>
                        </div>
                        <div className="action-wrap">

                            <button
                                className="action-btn"
                                onClick={handleExtractText}
                                disabled={loading}
                            >
                                {loading
                                    ? "Extracting..."
                                    : "📝 Extract Text"}
                            </button>

                            <p className="action-note">
                                🔒 Files stay on your device — nothing is uploaded
                            </p>

                        </div>

                        {extractedText && (
                            <>
                                <div className="text-preview">

                                    <textarea
                                        className="text-preview-box"
                                        value={extractedText}
                                        readOnly
                                    />

                                </div>

                                <div className="extract-toolbar">

                                    <div className="extract-selected">
                                        {extractedText.length.toLocaleString()} characters extracted
                                    </div>

                                    <div className="extract-actions">

                                        <button
                                            className="extract-small-btn"
                                            onClick={copyText}
                                        >
                                            📋 Copy
                                        </button>

                                        <button
                                            className="extract-small-btn"
                                            onClick={downloadTxt}
                                        >
                                            📄 Download TXT
                                        </button>

                                    </div>

                                </div>
                            </>
                        )}

                    </>
                )}

            </main>
        </>
    );
}

export default ExtractText;