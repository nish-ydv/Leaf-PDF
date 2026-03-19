import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'

function Convert() {
    const [selectedFiles, setSelectedFiles] = useState([])
    const [message, setMessage] = useState('')
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef(null)

    function handleFiles(files) {
        let hasError = false
        const newFiles = [...selectedFiles]

        for (const file of files) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setMessage(`File name: ${file.name} is not a valid type`)
                hasError = true
                break
            }
            const isDuplicate = newFiles.some(f => f.name === file.name && f.size === file.size)
            if (isDuplicate) {
                setMessage(`File name: ${file.name} is already selected`)
                hasError = true
                break
            }
            if (file.size > 50 * 1024 * 1024) {
                const f_size = (file.size / 1024 / 1024).toFixed(2)
                setMessage(`File size: ${f_size}MB is over 50MB`)
                hasError = true
                break
            }
            newFiles.push(file)
        }

        if (!hasError) {
            setMessage(newFiles.length < 1 ? 'Select at least 1 file' : '')
            setSelectedFiles(newFiles)
        }

        if (inputRef.current) inputRef.current.value = ''
    }

    function removeFile(index) {
        const newFiles = selectedFiles.filter((_, i) => i !== index)
        setSelectedFiles(newFiles)
        if (newFiles.length < 1) setMessage('Select at least 1 file')
    }

    async function handleConvert() {
        setLoading(true)
        try {
            const convertPdf = await PDFDocument.create()
            for (const file of selectedFiles) {
                const arrayBuffer = await file.arrayBuffer()
                let image
                if (file.type === 'image/png') {
                    image = await convertPdf.embedPng(arrayBuffer)
                } else if (file.type === 'image/jpeg') {
                    image = await convertPdf.embedJpg(arrayBuffer)
                }
                const page = convertPdf.addPage([image.width, image.height])
                page.drawImage(image, {
                    x: 0, y: 0,
                    width: image.width,
                    height: image.height,
                })
            }
            const bytes = await convertPdf.save()
            downloadPDF(bytes)
            setResult('PDF created successfully!')
            setSelectedFiles([])
            setMessage('')
            setTimeout(() => setResult(''), 3000)
        } catch (err) {
            setResult('Failed to convert images')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    function downloadPDF(bytes) {
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'converted.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const canConvert = selectedFiles.length >= 1 && !loading

    return (
        <main className="tool-page">
            <div className="tool-header">
                <div className="tool-icon-big">🖼</div>
                <h1 className="tool-h1">Image to PDF</h1>
                <p className="tool-sub">Convert JPG or PNG images into a high-quality PDF file. Perfect for scanned notes and photos.</p>
            </div>

            <div
                className={`upload-zone${isDragging ? ' drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
                onDrop={e => {
                    e.preventDefault()
                    setIsDragging(false)
                    handleFiles(e.dataTransfer.files)
                }}
            >
                <div className="upload-zone-icon">🖼</div>
                <div className="upload-zone-title">Drop your images here</div>
                <div className="upload-zone-sub">or click the button to browse</div>
                <label htmlFor="convertpdf" className="upload-zone-btn">
                    Choose Images
                </label>
                <input
                    type="file"
                    multiple
                    id="convertpdf"
                    ref={inputRef}
                    accept="image/jpeg, image/png"
                    onChange={e => handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                />
                <div className="upload-zone-note">
                    · JPG and PNG only · Max 50MB each · Nothing uploaded
                </div>
            </div>

            {message && <p className="msg-error">{message}</p>}

            {selectedFiles.length > 0 && (
                <div id="preview-con">
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>
                                <span>🏞️</span>
                                {file.name} — {(file.size / 1024 / 1024).toFixed(2)}MB
                                <button className="remove-btn" onClick={() => removeFile(index)}>❌</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {result && <div className="result-msg">{result}</div>}

            <div className="action-wrap">
                <button
                    className="action-btn"
                    onClick={handleConvert}
                    disabled={!canConvert}
                >
                    {loading ? 'Processing…' : '🖼 Convert to PDF'}
                </button>
                <p className="action-note">
                    🔒 Files stay on your device — nothing is uploaded
                </p>
            </div>
        </main>
    )
}

export default Convert