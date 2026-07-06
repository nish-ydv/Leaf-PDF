import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function ExtractImages() {
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [statusMessage, setStatusMessage] = useState({
        text: "",
        isError: false,
        visible: false,
    });
    const [selectedImages, setSelectedImages] = useState([]);
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

            setImages([]);
            setMessage("");

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
        setImages([]);

        setStatusMessage({
            text: "",
            isError: false,
            visible: false,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setSelectedImages([]);
    }
    function toggleImage(index) {
        setSelectedImages(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    }
    function selectAllImages() {
        setSelectedImages(images.map((_, i) => i));
    }
    function clearSelection() {
        setSelectedImages([]);
    }
    async function handleExtractImages() {
        if (!selectedFile) {
            showToast("Select a PDF first", true);
            return;
        }
        setLoading(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
            }).promise;
            const extractedImages = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                console.log("Page", i);
                const operatorList = await page.getOperatorList();
                for (let j = 0; j < operatorList.fnArray.length; j++) {
                    const fn = operatorList.fnArray[j];
                    if (
                        fn === pdfjsLib.OPS.paintImageMaskXObject ||
                        fn === pdfjsLib.OPS.paintInlineImageXObject ||
                        fn === pdfjsLib.OPS.paintImageXObject
                    ) {
                        const imageName = operatorList.argsArray[j][0];
                        await new Promise(resolve => {
                            page.objs.get(imageName, (img) => {
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");

                                canvas.width = img.width;
                                canvas.height = img.height;

                                ctx.drawImage(img.bitmap, 0, 0);

                                extractedImages.push({
                                    src: canvas.toDataURL("image/png"),
                                    name: `page${i}_image.png`,
                                });

                                resolve();
                            });
                        });
                    }
                }
            }
            setImages(extractedImages)
            setSelectedImages(
                extractedImages.map((_, i) => i)
            );
            showToast("PDF loaded successfully");
        } catch (err) {
            console.error(err);
            showToast("Failed to load PDF", true);
        } finally {
            setLoading(false);
        }
    }
    function downloadSelectedImages() {
        if (selectedImages.length === 0) {
            showToast("Select at least one image", true);
            return;
        }

        selectedImages.forEach(index => {
            const img = images[index];

            const a = document.createElement("a");
            a.href = img.src;
            a.download = img.name;
            a.click();
        });

        showToast(`${selectedImages.length} image(s) downloaded`);
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
                    <div className="tool-icon-big">🖼️</div>
                    <h1 className="tool-h1">Extract Images</h1>
                    <p className="tool-sub">
                        Extract all embedded images from your PDF.
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
                                onClick={
                                    images.length === 0
                                        ? handleExtractImages
                                        : downloadSelectedImages
                                }
                                disabled={
                                    loading ||
                                    (images.length > 0 && selectedImages.length === 0)
                                }
                            >
                                {loading
                                    ? "Processing..."
                                    : images.length === 0
                                        ? "🖼 Extract Images"
                                        : "⬇ Download Selected"}
                            </button>

                        </div>
                        {images.length > 0 && (
                            <div className="extract-toolbar">
                                <div className="extract-selected">
                                    Selected: {selectedImages.length}/{images.length}
                                </div>

                                <div className="extract-actions">
                                    <button
                                        className="extract-small-btn"
                                        onClick={selectAllImages}
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
                        )}
                        {images.length > 0 && (
                            <div className="image-grid">
                                {images.length === 0 ? (
                                    <p className="extract-empty">
                                        No images extracted yet.
                                    </p>
                                ) : (
                                    images.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`image-card ${selectedImages.includes(index) ? "selected" : ""
                                                }`}
                                            onClick={() => toggleImage(index)}
                                        >
                                            {selectedImages.includes(index) && (
                                                <div className="image-check">✓</div>
                                            )}
                                            <img
                                                src={image.src}
                                                alt=""
                                            />
                                        </div>
                                    ))
                                )}

                            </div>
                        )}
                    </>
                )}

            </main>
        </>
    );
}
export default ExtractImages