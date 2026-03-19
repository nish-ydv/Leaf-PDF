import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib"
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
import { Link } from "react-router-dom";
import UploadZone from "../components/Edit/Upload";
import LeftPanel from "../components/Edit/LeftPanel";
import Canvas from "../components/Edit/Canvas";
import Toolbar from "../components/Edit/Toolbar";
function Editor() {
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pdfBytes, setPdfBytes] = useState(null);
    const [fileName, setFileName] = useState('');
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [history, setHistory] = useState([])
    async function handleFile(file) {
        try {
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            const doc = await pdfjsLib.getDocument({ data: bytes }).promise
            const pageCount = doc.numPages
            setPages(Array.from({ length: pageCount }, (_, i) => ({
                id: i + 1,
                rotation: 0,
                deleted: false,
            })))
            const buffer2 = await file.arrayBuffer()
            setPdfBytes(new Uint8Array(buffer2))
            setPdfDoc(doc)
            setFileName(file.name)
        } catch (err) {
            console.log(err);
        }
    }
    function rotateCW() {
        setHistory(h => [...h, pages])
        setPages(prev => prev.map((p, i) =>
            i === currentPage
                ? { ...p, rotation: (p.rotation + 90) % 360 }
                : p
        ))
    }
    function rotateCCW() {
        setHistory(h => [...h, pages])
        setPages(prev => prev.map((p, i) =>
            i === currentPage
                ? { ...p, rotation: (p.rotation + 270) % 360 }
                : p
        ))
    }
    function deletePage() {
        setHistory(h => [...h, pages])
        setPages(prev => prev.map((p, i) =>
            i === currentPage ? { ...p, deleted: true } : p
        ))
        const nextPage = pages.findIndex((p, i) => i > currentPage && !p.deleted)
        const prevPage = [...pages].reverse().findIndex((p, i) =>
            pages.length - 1 - i < currentPage && !p.deleted)

        if (nextPage !== -1) setCurrentPage(nextPage)
        else if (prevPage !== -1) setCurrentPage(pages.length - 1 - prevPage)
    }
    function undo() {
        if (!history.length) return
        setPages(history[history.length - 1])
        setHistory(h => h.slice(0, -1))
    }
    async function savePDF() {
        if (!pdfBytes) return;
        const doc = await PDFDocument.load(pdfBytes);
        const pdfPages = doc.getPages();
        pages.forEach((page, i) => {
            if (page.rotation !== 0) {
                pdfPages[i].setRotation(degrees(page.rotation));
            }
        })
        const deletedIndices = pages
            .map((page, i) => page.deleted ? i : -1)
            .filter(i => i !== -1)
            .reverse()
        deletedIndices.forEach(i => doc.removePage(i))
        const savedBytes = await doc.save()
        const blob = new Blob([savedBytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "edited.pdf"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    return (
        <div className="editor-root">
            {!pdfDoc ? (
                <UploadZone onFile={handleFile} />
            ) : (
                <>
                    <Toolbar
                        fileName={fileName}
                        canUndo={history.length > 0}
                        onUndo={undo}
                        onRotateCW={rotateCW}
                        onRotateCCW={rotateCCW}
                        onDelete={deletePage}
                        onSave={savePDF}
                        isLoaded={pages.length > 0}
                    />
                    <div className="editor-layout">
                        <LeftPanel
                            pages={pages}
                            currentPage={currentPage}
                            pdfDoc={pdfDoc}
                            onSelect={setCurrentPage}
                        />
                        <Canvas
                            pdfDoc={pdfDoc}
                            pages={pages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            )
            }
        </div>
    )
}
export default Editor