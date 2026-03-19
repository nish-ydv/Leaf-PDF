import { useState, useRef } from 'react'
import { PDFDocument } from "pdf-lib"

function SplitPDF() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState("")
  const [index, setIndex] = useState("")
  const [indexError, setIndexError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  async function validFile(file) {
    if (!file) { setMessage("No File Selected"); return false }
    if (file.type !== "application/pdf") {
      setSelectedFile(null)
      setMessage(`${file.name} is not a valid type`)
      return false
    }
    if (file.size > 50 * 1024 * 1024) {
      const f_size = (file.size / 1024 / 1024).toFixed(2)
      setSelectedFile(null)
      setMessage(`file size: ${f_size}mb is over 50mb`)
      return false
    }
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPageCount()
      setPageCount(pages)
      setSelectedFile(file)
      setMessage("")
      setIndex("")
      setIndexError("")
      return true
    } catch (error) {
      setMessage("Failed to load PDF")
    }
  }

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true) }
  function handleDragLeave(e) { e.preventDefault(); setIsDragging(false) }
  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    validFile(e.dataTransfer.files[0])
  }
  function handleFile(e) { validFile(e.target.files[0]) }

  function handleIndex(e) {
    const value = e.target.value
    setIndex(value)
    if (!value) { setIndexError(""); return }
    if (Number(value) <= 0) { setIndexError("Index should be greater than 0"); return }
    if (Number(value) >= pageCount) { setIndexError("Index should be less than pdf pages"); return }
    setIndexError("")
  }

  function removeFile() {
    setSelectedFile(null)
    setMessage("")
    setSuccessMessage("")
    setIndex("")
    setIndexError("")
    setPageCount(0)
    fileInputRef.current.value = ""
  }

  async function handleSplit() {
    setLoading(true)
    setMessage("")
    setSuccessMessage("")
    try {
      const og_file = selectedFile.name.replace(/\.pdf$/i, "")
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const splitIndex = Number(index)

      const pdf1 = await PDFDocument.create()
      for (let i = 0; i < splitIndex; i++) {
        const pages = await pdf1.copyPages(pdfDoc, [i])
        pages.forEach(page => pdf1.addPage(page))
      }

      const pdf2 = await PDFDocument.create()
      for (let i = splitIndex; i < pageCount; i++) {
        const pages = await pdf2.copyPages(pdfDoc, [i])
        pages.forEach(page => pdf2.addPage(page))
      }

      const pdf1Bytes = await pdf1.save()
      const pdf2Bytes = await pdf2.save()
      downloadPDF(pdf1Bytes, `${og_file}_part1.pdf`)
      downloadPDF(pdf2Bytes, `${og_file}_part2.pdf`)
      setSelectedFile(null)
      setSuccessMessage("PDF downloaded Successfully")

      setTimeout(() => {
        setIndex("")
        setPageCount(0)
        setSuccessMessage("")
        fileInputRef.current.value = ""
      }, 3000)
    } catch (error) {
      setMessage("Failed To Split PDF")
      console.error(error)
    } finally {
      setLoading(false)
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

  const canSplit = selectedFile && index && !indexError && !loading

  return (
    <>
    <div className="hero-leaves">
      <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
      <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
      <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
    </div>
    <main className="tool-page">
      <div className="tool-header">
        <div className="tool-icon-big">✂️</div>
        <h1 className="tool-h1">Split PDF</h1>
        <p className="tool-sub">
          Enter a page number to divide your PDF into two parts —
          one before and one after the selected page.
        </p>
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
          ref={fileInputRef}
          onChange={handleFile}
          accept="application/pdf"
          style={{ display: 'none' }}
        />
        <div className="upload-zone-note">
          · PDF files only · Max 50MB · Nothing uploaded
        </div>
      </div>

      {message && <p className="msg-error">{message}</p>}

      {selectedFile && (
        <div className="split-file-wrap">
          <div className="split-file-item">
            <span className="split-file-icon">📄</span>
            <span className="split-file-name">{selectedFile.name}</span>
            {pageCount > 0 && (
              <span className="split-page-badge">{pageCount} pages</span>
            )}
            <button className="remove-btn" onClick={removeFile}>❌</button>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="split-input-card">
          <label className="split-input-label">Split after page number</label>
          <div className="split-input-row">
            <input
              type="number"
              className="split-number-input"
              value={index}
              onChange={handleIndex}
              min={1}
              max={pageCount - 1}
              placeholder="e.g. 3"
            />
            {pageCount > 0 && (
              <span className="split-of-total">of {pageCount} pages</span>
            )}
          </div>
          {indexError && <p className="msg-error">{indexError}</p>}
          {index && !indexError && (
            <div className="split-preview-row">
              <div className="split-part">
                <span className="split-part-label">Part 1</span>
                <span className="split-part-value">Pages 1 — {index}</span>
              </div>
              <span className="split-divider-icon">✂️</span>
              <div className="split-part">
                <span className="split-part-label">Part 2</span>
                <span className="split-part-value">Pages {Number(index) + 1} — {pageCount}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="result-msg">{successMessage}</div>
      )}

      <div className="action-wrap">
        <button
          className="action-btn"
          onClick={handleSplit}
          disabled={!canSplit}
        >
          {loading ? 'Processing…' : '✂️ Split PDF'}
        </button>
        <p className="action-note">
          🔒 Files stay on your device — nothing is uploaded
        </p>
      </div>

    </main>
    </>
  )
}
export default SplitPDF