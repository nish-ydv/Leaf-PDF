import { useEffect, useState } from "react";
import { PDFDocument, degrees, rgb } from "pdf-lib"
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
import UploadZone from "../components/Edit/Upload";
import LeftPanel from "../components/Edit/LeftPanel";
import Canvas from "../components/Edit/Canvas";
import Toolbar from "../components/Edit/Toolbar";
import RightPanel from "../components/Edit/RightPanel";
import SignaturePad from "../components/Edit/SignaturePad";
import {
    arrayMove,
} from "@dnd-kit/sortable"
import { ServerCog } from "lucide-react";
function Editor() {
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pdfBytes, setPdfBytes] = useState(null);
    const [fileName, setFileName] = useState('');
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [history, setHistory] = useState([]);
    const [textBoxes, setTextBoxes] = useState([]);
    const [activeTool, setActiveTool] = useState('select');
    const [selectedTextBox, setSelectedTextBox] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const [signatures, setSignatures] = useState([]);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureImage, setSignatureImage] = useState(null);
    const [selectedSignature, setSelectedSignature] = useState(null);
    const [watermarkType, setWatermarkType] = useState("text");
    const [watermarkText, setWatermarkText] = useState("");
    const [watermarkImage, setWatermarkImage] = useState(null);
    const [watermarkOpacity, setWatermarkOpacity] = useState(30);
    const [watermarkPosition, setWatermarkPosition] = useState("center");
    const [watermarkApplyTo, setWatermarkApplyTo] = useState("current");
    const [applyWatermark, setApplyWatermark] = useState(0);
    const [selectedWatermark, setSelectedWatermark] = useState(null);
    const [watermarks,setWatermarks]=useState([]);    
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault()
                undo()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                savePDF()
            }
            if (e.key === 't' && !e.ctrlKey && e.target.tagName !== 'INPUT') {
                setActiveTool(prev => prev === 'text' ? 'select' : 'text')
            }
            if (e.key === 'Escape') {
                setActiveTool('select')
            }
            if (e.key === 'Delete' && e.target.tagName !== 'Input') {
                deletePage()
            }
            if (selectedTextBox) {
                const box = textBoxes.find(b => b.id === selectedTextBox);
                if (e.key === ']') {
                    e.preventDefault();
                    updateFontSize(box.id, box.fontSize + 2);
                }
                if (e.key === '[') {
                    e.preventDefault();
                    updateFontSize(box.id, box.fontSize - 2);
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [pages, textBoxes, history, currentPage])
    function handleReorder(event) {
        const { active, over } = event
        if (!over) return
        const oldIndex = pages.findIndex(p => p.id === active.id)
        const newIndex = pages.findIndex(p => p.id === over.id)
        if (oldIndex === newIndex) return
        setHistory(h => [
            ...h,
            {
                pages,
                textBoxes,
                signatures,
            },
        ]);
        setPages(prev => arrayMove(prev, oldIndex, newIndex));
        if (currentPage === oldIndex) {
            setCurrentPage(newIndex)
        } else if (oldIndex < currentPage && newIndex >= currentPage) {
            setCurrentPage(prev => prev - 1)
        } else if (oldIndex > currentPage && newIndex <= currentPage) {
            setCurrentPage(prev => prev + 1)
        }
    }
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
        setHistory(h => [...h, { pages, textBoxes, signatures }])
        setPages(prev => prev.map((p, i) =>
            i === currentPage
                ? { ...p, rotation: (p.rotation + 90) % 360 }
                : p
        ))
    }
    function rotateCCW() {
        setHistory(h => [...h, { pages, textBoxes, signatures }])
        setPages(prev => prev.map((p, i) =>
            i === currentPage
                ? { ...p, rotation: (p.rotation + 270) % 360 }
                : p
        ))
    }
    function deletePage() {
        setHistory(h => [...h, { pages, textBoxes, signatures }])
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
        const last = history[history.length - 1]
        setPages(last.pages)
        setTextBoxes(last.textBoxes)
        setSignatures(last.signatures)
        setWatermarkText(last.watermarkText)
        setWatermarkImage(last.watermarkImage)
        setHistory(h => h.slice(0, -1))
    }
    function updateFontSize(id, size) {
        setTextBoxes(prev =>
            prev.map(box =>
                box.id === id
                    ? { ...box, fontSize: Math.max(8, size) }
                    : box
            )
        );
    }
    function deleteTextBox(id) {
        setHistory(h => [
            ...h,
            {
                pages,
                textBoxes,
                signatures,
            },
        ]);
        setTextBoxes(prev =>
            prev.filter(box => box.id !== id)
        );
        setSelectedTextBox(null);
    }
    function updateColor(id, color) {
        setTextBoxes(prev =>
            prev.map(box =>
                box.id === id ? { ...box, color: color } : box
            )
        )
    }
    function updatePosition(id, x, y) {
        setTextBoxes(prev =>
            prev.map(box =>
                box.id === id ? { ...box, x, y } : box
            )
        )
    }
    function duplicateTextBox(id) {
        setHistory(h => [...h, { pages, textBoxes }]);
        const box = textBoxes.find(b => b.id === id);
        if (!box) return;
        const newid = Date.now() + Math.random()
        setTextBoxes(prev => [
            ...prev,
            {
                ...box,
                id: newid,
                x: box.x + 20,
                y: box.y + 20,
            },
        ]);
        setSelectedTextBox(newid)
    }
    function addSignature(signature) {
        setHistory(h => [
            ...h,
            {
                pages,
                textBoxes,
                signatures,
            }
        ])
        setSignatures(prev => [...prev, signature])
    }
    function updateSignaturePosition(id, x, y) {
        setSignatures(prev =>
            prev.map(sig =>
                sig.id === id ? { ...sig, x, y } : sig
            )
        );
    }
    function updateSignatureSize(id, width, height) {
        setSignatures(prev =>
            prev.map(sig =>
                sig.id === id ? { ...sig, width, height } : sig
            )
        );
    }
    function deleteSignature(id) {
        setHistory(h => [
            ...h,
            {
                pages,
                textBoxes,
                signatures,
            },
        ]);

        setSignatures(prev =>
            prev.filter(sig => sig.id !== id)
        );

        setSelectedSignature(null);
    }
    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return rgb(r, g, b);
    }
    function onApplyWatermark(){
        setHistory(h => [
            ...h,
            {
                pages,
                textBoxes,
                signatures,
            },
        ])
        setApplyWatermark(prev=>prev+1);
    }
    function onRemoveWatermark(){
        setHistory(h => [
            ...h,
            {
                pages,
                textBoxes,
                signatures,
            },
        ])
        setWatermarks([]);
        setSelectedWatermark(null);
    }
    async function savePDF() {
        if (!pdfBytes) return;
        const srcDoc = await PDFDocument.load(pdfBytes);
        const newDoc = await PDFDocument.create();
        const canvasScale = 1.5;
        for (let i = 0; i < pages.length; i++) {
            const pageMeta = pages[i];
            if (pageMeta.deleted) continue;
            const [copiedPage] = await newDoc.copyPages(srcDoc, [pageMeta.id - 1]);
            if (pageMeta.rotation !== 0) {
                copiedPage.setRotation(degrees(pageMeta.rotation));
            }
            const pageHeight = copiedPage.getHeight();
            const pageTextBoxes = textBoxes.filter(
                box => box.pageIndex === i
            );
            const pageSignatures = signatures.filter(
                sig => sig.pageIndex === i
            );
            pageTextBoxes
                .filter(box => box.text.trim() !== "")
                .forEach(box => {
                    const lines = box.text.split("\n");

                    lines.forEach((line, index) => {
                        copiedPage.drawText(line, {
                            x: box.x / canvasScale,
                            y:
                                pageHeight -
                                (box.y / canvasScale) -
                                (index * (box.fontSize * 1.2 / canvasScale)),
                            size: box.fontSize / canvasScale,
                            color: hexToRgb(box.color),
                        });
                    });
                });
            for(const sig of pageSignatures){
                const png = await newDoc.embedPng(sig.image);
                copiedPage.drawImage(png, {
                    x: sig.x / canvasScale,
                    y:
                        pageHeight -
                        (sig.y/canvasScale)-
                        (sig.height/canvasScale),
                    width: sig.width/ canvasScale,
                    height: sig.height/ canvasScale,
                });
            }
            newDoc.addPage(copiedPage);
        }
        const savedBytes = await newDoc.save()
        const blob = new Blob([savedBytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        const baseName = fileName.replace(/\.pdf$/i, "");
        a.download = `${baseName}-edited.pdf`
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
                        onSave={savePDF}
                        isLoaded={pages.length > 0}
                    />
                    <div className="editor-layout">
                        <LeftPanel
                            pages={pages}
                            currentPage={currentPage}
                            pdfDoc={pdfDoc}
                            onSelect={setCurrentPage}
                            onReorder={handleReorder}
                        />
                        <Canvas
                            pdfDoc={pdfDoc}
                            pages={pages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            activeTool={activeTool}
                            textBoxes={textBoxes}
                            onAddTextBox={(box) => {
                                setHistory(h => [...h, { pages, textBoxes, signatures }])
                                setTextBoxes(prev => [...prev, box])
                            }
                            }
                            onUpdateTextBox={(id, text) => setTextBoxes(prev =>
                                prev.map(b => b.id === id ? { ...b, text } : b)
                            )}
                            onSetActiveTool={setActiveTool}
                            selectedTextBox={selectedTextBox}
                            setSelectedTextBox={setSelectedTextBox}
                            onUpdateFontSize={updateFontSize}
                            onDeleteTextBox={deleteTextBox}
                            onUpdateColor={updateColor}
                            showColorPicker={showColorPicker}
                            setShowColorPicker={setShowColorPicker}
                            draggingId={draggingId}
                            setDraggingId={setDraggingId}
                            onUpdatePosition={updatePosition}
                            duplicateTextBox={duplicateTextBox}
                            signatureImage={signatureImage}
                            signatures={signatures}
                            onAddSignature={addSignature}
                            selectedSignature={selectedSignature}
                            setSelectedSignature={setSelectedSignature}
                            updateSignaturePosition={updateSignaturePosition}
                            updateSignatureSize={updateSignatureSize}
                            deleteSignature={deleteSignature}
                            watermarkType={watermarkType}
                            watermarkText={watermarkText}
                            watermarkImage={watermarkImage}
                            watermarkOpacity={watermarkOpacity}
                            watermarkPosition={watermarkPosition}
                            watermarkApplyTo={watermarkApplyTo}
                            applyWatermark={applyWatermark}
                            watermarks={watermarks}
                            setWatermarks={setWatermarks}
                        />
                        <RightPanel
                            onRotateCW={rotateCW}
                            onRotateCCW={rotateCCW}
                            onDelete={deletePage}
                            isLoaded={pages.length > 0}
                            activeTool={activeTool}
                            onSetActiveTool={setActiveTool}
                            pages={pages}
                            currentPage={currentPage}
                            showSignaturePad={showSignaturePad}
                            setShowSignaturePad={setShowSignaturePad}
                            watermarkType={watermarkType}
                            setWatermarkType={setWatermarkType}
                            watermarkText={watermarkText}
                            setWatermarkText={setWatermarkText}
                            watermarkImage={watermarkImage}
                            setWatermarkImage={setWatermarkImage}
                            watermarkOpacity={watermarkOpacity}
                            setWatermarkOpacity={setWatermarkOpacity}
                            watermarkPosition={watermarkPosition}
                            setWatermarkPosition={setWatermarkPosition}
                            watermarkApplyTo={watermarkApplyTo}
                            setWatermarkApplyTo={setWatermarkApplyTo}
                            onApplyWatermark={onApplyWatermark}
                            onRemoveWatermark={onRemoveWatermark}
                            selectedWatermark={selectedWatermark}
                        />
                    </div>
                    {showSignaturePad && (
                        <SignaturePad
                            onClose={() => setShowSignaturePad(false)}
                            signatureImage={signatureImage}
                            setSignatureImage={setSignatureImage}
                            setActiveTool={setActiveTool}
                        />
                    )}
                </>
            )
            }
        </div>
    )
}
export default Editor