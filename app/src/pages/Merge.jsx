import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import {
    DndContext
} from "@dnd-kit/core"

import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

function SortableItem({ file, removeFile, index, }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.name });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }
    return (
        <li ref={setNodeRef} style={style}>
            <span {...attributes} {...listeners} style={{ cursor: "grab", marginRight: "10px" }}>
                ≡
            </span>
            {file.name} — {(file.size / 1024 / 1024).toFixed(2)}MB
            <button className="remove-btn" onClick={() => removeFile(index)}>❌</button>
        </li>
    )
}
function Merge() {
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
            if (file.type !== 'application/pdf') {
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
            setMessage(newFiles.length < 2 ? 'Select two files to merge' : '')
            setSelectedFiles(newFiles)
        }

        if (inputRef.current) inputRef.current.value = ''
    }
    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            setSelectedFiles(prev => {
                const oldIndex = prev.findIndex(f => f.name === active.id);
                const newIndex = prev.findIndex(f => f.name === over.id);
                return arrayMove(prev, oldIndex, newIndex)
            })
        }
    }
    function removeFile(index) {
        const newFiles = selectedFiles.filter((_, i) => i !== index)
        setSelectedFiles(newFiles)
        if (newFiles.length < 2) setMessage('Select two files to merge')
    }

    async function handleMerge() {
        setLoading(true)
        try {
            const mergePdf = await PDFDocument.create()
            for (const file of selectedFiles) {
                const arrayBuffer = await file.arrayBuffer()
                const pdf = await PDFDocument.load(arrayBuffer)
                const pages = await mergePdf.copyPages(pdf, pdf.getPageIndices())
                pages.forEach(page => mergePdf.addPage(page))
            }
            const mergedBytes = await mergePdf.save()
            downloadPDF(mergedBytes)
            setResult('Merged PDF successfully!')
            setSelectedFiles([])
            setMessage('')
            setTimeout(() => setResult(''), 3000)
        } catch (err) {
            setResult('Failed to merge PDF')
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
        a.download = 'merged.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const canMerge = selectedFiles.length >= 2 && !loading

    return (
        <>
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>
            <main className="tool-page">
                <div className="tool-header">
                    <div className="tool-icon-big">🔗</div>
                    <h1 className="tool-h1">Merge PDF</h1>
                    <p className="tool-sub">Combine multiple PDF files into a single document in just a few clicks.</p>
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
                    <div className="upload-zone-icon">🔗</div>
                    <div className="upload-zone-title">Drop your PDF files here</div>
                    <div className="upload-zone-sub">or click the button to browse</div>
                    <label htmlFor="mergepdf" className="upload-zone-btn">
                        Choose PDF files
                    </label>
                    <input
                        type="file"
                        multiple
                        id="mergepdf"
                        ref={inputRef}
                        accept="application/pdf"
                        onChange={e => handleFiles(e.target.files)}
                        style={{ display: 'none' }}
                    />
                    <div className="upload-zone-note">
                        · PDF files only · Max 50MB each · Nothing uploaded
                    </div>
                </div>

                {message && <p className="msg-error">{message}</p>}

                {selectedFiles.length > 0 && (
                    <div id="preview">
                        <DndContext onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={selectedFiles.map(f => f.name)}
                                strategy={verticalListSortingStrategy}>
                                <ul>
                                    {selectedFiles.map((file, index) => (
                                        <SortableItem
                                            key={file.name}
                                            file={file}
                                            index={index}
                                            removeFile={removeFile} />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    </div>
                )}

                {result && <div className="result-msg">{result}</div>}

                <div className="action-wrap">
                    <button
                        className="action-btn"
                        onClick={handleMerge}
                        disabled={!canMerge}
                    >
                        {loading ? 'Processing…' : '🔗 Merge PDFs'}
                    </button>
                    <p className="action-note">
                        🔒 Files stay on your device — nothing is uploaded
                    </p>
                </div>
            </main>
        </>
    )
}

export default Merge