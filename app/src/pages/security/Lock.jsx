import { useRef, useState } from "react";
import { PDFDocument } from "@cantoo/pdf-lib";
function LockPDF() {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
        setPassword("");
        setConfirmPassword("");
        setStatusMessage({
            text: "",
            isError: false,
            visible: false,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
    async function lockPDF() {
        setLoading(true);
        setMessage("");
        try {
            if (!selectedFile) {
                setMessage("Select a Pdf first");
                return;
            }
            if (!password || !confirmPassword) {
                setMessage("Fill both password fields");
                return;
            }
            if (password !== confirmPassword) {
                setMessage("Password do not match");
                return;
            }
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                }
            })
            const pdfBytes = await pdfDoc.save();
            downloadPDF(pdfBytes,`${selectedFile.name.replace(/\.pdf$/i, '')}-locked.pdf`);
            setSelectedFile(null);
            setPassword("");
            setConfirmPassword("");
            showToast("PDF downloaded Successfully");
            setTimeout(() => {
                setPageCount(0);
                setMessage("");
                fileInputRef.current.value = ""
            }, 3000)
        }
        catch (error) {
            setMessage("Failed to lock PDF");
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    }
    function downloadPDF(bytes, file) {
        const blob = new Blob([bytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = file
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
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
                    <div className="tool-icon-big">🔒</div>

                    <h1 className="tool-h1">
                        Lock PDF
                    </h1>

                    <p className="tool-sub">
                        Protect Your PDF Using Password.
                    </p>
                </div>

                <div
                    className={`upload-zone${isDragging ? " drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="upload-zone-icon">🔒</div>

                    <div className="upload-zone-title">
                        Drop your PDF here
                    </div>

                    <div className="upload-zone-sub">
                        or click the button to browse
                    </div>

                    <label
                        htmlFor="lockpdf"
                        className="upload-zone-btn"
                    >
                        Choose PDF file
                    </label>

                    <input
                        id="lockpdf"
                        ref={fileInputRef}
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
                                    🔒
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
                        <div className="password-section">
                            <input
                                type="password"
                                className="password-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                className="password-input"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="action-wrap">

                            <button
                                className="action-btn"
                                onClick={lockPDF}
                                disabled={loading}
                            >
                                {loading
                                    ? "Locking..."
                                    : "🔒 Lock PDF"}
                            </button>

                            <p className="action-note">
                                🔒 Files stay on your device — nothing is uploaded
                            </p>

                        </div>
                    </>
                )}

            </main>
        </>
    );
}

export default LockPDF;