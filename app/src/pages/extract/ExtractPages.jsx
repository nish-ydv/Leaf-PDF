import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function ExtractPages() {
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [selectedPages, setSelectedPages] = useState([]);
    const [thumbnails, setThumbnails] = useState([]);

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
            setSelectedPages([]);
            setThumbnails([]);

            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
            }).promise;

            const thumbs = [];

            for (let i = 1; i <= pdf.numPages; i++) {

                const page = await pdf.getPage(i);

                const viewport = page.getViewport({
                    scale: 0.3,
                });

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: ctx,
                    viewport,
                }).promise;

                thumbs.push({
                    page: i,
                    image: canvas.toDataURL("image/png"),
                });
            }

            setThumbnails(thumbs);

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
        setSelectedPages([]);
        setThumbnails([]);

        setStatusMessage({
            text: "",
            isError: false,
            visible: false,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function togglePage(pageNumber) {
        setSelectedPages(prev => {
            if (prev.includes(pageNumber)) {
                return prev.filter(p => p !== pageNumber);
            }

            return [...prev, pageNumber];
        });
    }

    function selectAllPages() {
        const pages = [];

        for (let i = 1; i <= pageCount; i++) {
            pages.push(i);
        }

        setSelectedPages(pages);
    }

    function clearSelection() {
        setSelectedPages([]);
    }

    async function handleExtract() {

        if (selectedPages.length === 0) {
            showToast("Select at least one page.", true);
            return;
        }

        setLoading(true);

        try {

            const originalName = selectedFile.name.replace(/\.pdf$/i, "");

            const arrayBuffer = await selectedFile.arrayBuffer();

            const originalPdf = await PDFDocument.load(arrayBuffer);

            const newPdf = await PDFDocument.create();

            const copiedPages = await newPdf.copyPages(
                originalPdf,
                [...selectedPages]
                    .sort((a, b) => a - b)
                    .map(page => page - 1)
            );

            copiedPages.forEach(page => newPdf.addPage(page));

            const bytes = await newPdf.save();

            downloadPDF(bytes, `${originalName}_extract.pdf`);

            showToast("Pages extracted successfully!");

            setSelectedPages([]);

        } catch (err) {
            console.error(err);
            showToast("Failed to extract pages.", true);

        } finally {
            setLoading(false);

        }
    }
    function downloadPDF(bytes, fileName) {

        const blob = new Blob([bytes], {
            type: "application/pdf",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }
    return (
        <>
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>

            <main className="tool-page">

                <div className="tool-header">
                    <div className="tool-icon-big">📄</div>
                    <h1 className="tool-h1">Extract Pages</h1>
                    <p className="tool-sub">
                        Select the pages you want to extract into a new PDF.
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
                        htmlFor="extractpdf"
                        className="upload-zone-btn"
                    >
                        Choose PDF file
                    </label>

                    <input
                        ref={fileInputRef}
                        id="extractpdf"
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
                        {statusMessage.visible && (
                            <div
                                className={`result-msg ${statusMessage.isError ? "error" : ""
                                    }`}
                            >
                                {statusMessage.text}
                            </div>
                        )}

                        <div className="action-wrap">

                            <button
                                className="action-btn"
                                disabled={
                                    selectedPages.length === 0 || loading
                                }
                                onClick={handleExtract}
                            >
                                {loading
                                    ? "Extracting..."
                                    : "📄 Extract Pages"}
                            </button>

                            <p className="action-note">
                                🔒 Files stay on your device — nothing is uploaded
                            </p>

                        </div>
                        <div className="extract-toolbar">

                            <div className="extract-selected">
                                Selected {selectedPages.length} / {pageCount} pages
                            </div>

                            <div className="extract-actions">

                                <button
                                    className="extract-small-btn"
                                    onClick={selectAllPages}
                                >
                                    Select All
                                </button>

                                <button
                                    className="extract-small-btn secondary"
                                    onClick={clearSelection}
                                >
                                    Clear
                                </button>

                            </div>

                        </div>

                        <div className="extract-grid">

                            {thumbnails.map((thumb) => (

                                <div
                                    key={thumb.page}
                                    className={`extract-thumb ${selectedPages.includes(thumb.page)
                                        ? "selected"
                                        : ""
                                        }`}
                                    onClick={() => togglePage(thumb.page)}
                                >

                                    {selectedPages.includes(thumb.page) && (
                                        <div className="extract-check">
                                            ✓
                                        </div>
                                    )}

                                    <img
                                        src={thumb.image}
                                        alt={`Page ${thumb.page}`}
                                    />

                                    <p>Page {thumb.page}</p>

                                </div>

                            ))}

                        </div>
                    </>
                )}

            </main>
        </>
    );
}
export default ExtractPages