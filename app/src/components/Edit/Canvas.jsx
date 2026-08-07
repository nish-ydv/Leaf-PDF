import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful"

function Canvas({ pdfDoc, pages, currentPage, onPageChange, activeTool, textBoxes, onAddTextBox, onUpdateTextBox, onSetActiveTool,
    selectedTextBox, setSelectedTextBox, onUpdateFontSize, onDeleteTextBox, onUpdateColor, showColorPicker, setShowColorPicker,
    draggingId, setDraggingId, onUpdatePosition, duplicateTextBox, signatureImage, signatures, onAddSignature, selectedSignature, setSelectedSignature,
    updateSignaturePosition, updateSignatureSize, deleteSignature, watermarkType, watermarkText, watermarkImage, watermarkOpacity, watermarkPosition, watermarkApplyTo,
    applyWatermark, watermarks, setWatermarks, setSelectedWatermark, selectedWatermark
}) {
    const canvasRef = useRef(null);
    useEffect(() => {
        let renderTask = null;
        async function render() {
            const pdfPage = await pdfDoc.getPage(pages[currentPage].id);
            const rotation = pages[currentPage].rotation;
            const viewport = pdfPage.getViewport({ scale: 1.5, rotation: rotation });
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            renderTask = pdfPage.render({ canvasContext: ctx, viewport });
            await renderTask.promise;
        }
        render()
        return () => { if (renderTask) renderTask.cancel() }
    }, [pdfDoc, currentPage, pages[currentPage]?.rotation, pages[currentPage]?.id])
    useEffect(() => {
        applyWatermarkToCanvas();
    }, [applyWatermark])
    function applyWatermarkToCanvas() {
        if (watermarkType === "text" && !watermarkText.trim()) {
            return;
        }
        else if (watermarkType === "image" && !watermarkImage) {
            return;
        }
        const watermark = {
            id: crypto.randomUUID(),
            pageIndex: currentPage,
            allPages: watermarkApplyTo === "all",
            type: watermarkType,
            text: watermarkText,
            image: watermarkImage,
            opacity: watermarkOpacity,
            position: watermarkPosition,
        }
        setWatermarks(prev => [...prev, watermark])
    }
    function getWatermarkPosition(position) {
        switch (position) {
            case "center":
                return {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                };

            case "top-left":
                return {
                    top: "20px",
                    left: "20px",
                };

            case "top-right":
                return {
                    top: "20px",
                    right: "20px",
                };

            case "bottom-left":
                return {
                    bottom: "20px",
                    left: "20px",
                };

            case "bottom-right":
                return {
                    bottom: "20px",
                    right: "20px",
                };

            default:
                return {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                };
        }
    }
    function handleCanvasClick(e) {
        setSelectedTextBox(null);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (activeTool === "text") {
            onAddTextBox({
                id: Date.now(),
                pageIndex: currentPage,
                x,
                y,
                text: "",
                fontSize: 16,
                color: "#000000",
            });
            onSetActiveTool("select");
            return;
        }
        if (activeTool === "signature") {
            onAddSignature({

                id: crypto.randomUUID(),
                pageIndex: currentPage,
                x,
                y,
                width: 120,
                height: 60,
                image: signatureImage,
            })
            onSetActiveTool("select");
            return;
        }
        setShowColorPicker(false);
    }
    function startDrag(e, box) {
        e.preventDefault();
        e.stopPropagation();
        setDraggingId(box.id);
        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = box.x;
        const initialY = box.y;
        document.body.style.userSelect = "none";
        function onMove(ev) {
            onUpdatePosition(
                box.id,
                initialX + (ev.clientX - startX),
                initialY + (ev.clientY - startY)
            );
        }
        function onUp() {
            setDraggingId(null);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            document.body.style.userSelect = "";
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }
    function startSignatureDrag(e, box) {
        e.preventDefault();
        e.stopPropagation();
        setDraggingId(box.id);
        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = box.x;
        const initialY = box.y;
        document.body.style.userSelect = "none";
        function onMove(ev) {
            updateSignaturePosition(
                box.id,
                initialX + (ev.clientX - startX),
                initialY + (ev.clientY - startY)
            );
        }
        function onUp() {
            setDraggingId(null);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            document.body.style.userSelect = "";
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }
    function startResize(e, sig) {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;

        const startWidth = sig.width;
        const ratio = sig.height / sig.width;

        const MIN_SIGNATURE_WIDTH = 40;
        const MAX_SIGNATURE_WIDTH = 10000;

        function onMove(ev) {
            const deltaX = ev.clientX - startX;

            const newWidth = Math.min(
                MAX_SIGNATURE_WIDTH,
                Math.max(
                    MIN_SIGNATURE_WIDTH,
                    startWidth + deltaX
                )
            );

            updateSignatureSize(
                sig.id,
                newWidth,
                newWidth * ratio
            );
        }

        function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }
    return (
        <div className="canvas-area">
            <div className="canvas-scroll">
                {pages[currentPage]?.deleted ? (
                    <p>Page deleted — undo to restore</p>
                ) : (
                    <div style={{ position: 'relative', display: 'inline-block', cursor: activeTool === 'text' ? 'text' : 'default' }}
                        onClick={handleCanvasClick}>
                        <canvas ref={canvasRef} />
                        {textBoxes
                            .filter(box => box.pageIndex === currentPage)
                            .map(box => (
                                <div
                                    key={box.id}
                                    style={{
                                        position: 'absolute',
                                        left: box.x,
                                        top: box.y,
                                    }}
                                >
                                    {selectedTextBox === box.id && (
                                        <div className="font-toolbar"
                                            style={{
                                                position: 'absolute',
                                                top: '-40px',
                                                left: '0',
                                                display: 'flex',
                                                gap: '4px',
                                                background: '#1c1917',
                                                padding: '4px',
                                                borderRadius: '6px',
                                                border: '1px solid #444',
                                                zIndex: 1000,
                                            }}
                                        >
                                            <div
                                                onMouseDown={(e) => startDrag(e, box)}
                                                style={{
                                                    cursor: draggingId === box.id ? "grabbing" : "grab",
                                                    padding: "0 6px",
                                                    fontWeight: "bold",
                                                    userSelect: "none",
                                                    color: "white",
                                                    fontSize: "18px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                ⠿
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateFontSize(box.id, box.fontSize - 2)
                                                }
                                                }
                                            >
                                                A-
                                            </button>
                                            <span style={{
                                                color: "white",
                                                minWidth: "24px",
                                                textAlign: "center",
                                                fontWeight: "600",
                                            }}>{box.fontSize}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateFontSize(box.id, box.fontSize + 2)
                                                }
                                                }
                                            >
                                                A+
                                            </button>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowColorPicker(prev => !prev);
                                                }}
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    backgroundColor: box.color,
                                                    border: "1px solid white",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {showColorPicker && selectedTextBox === box.id && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        position: "absolute",
                                                        top: "40px",
                                                        left: "70px",
                                                        zIndex: 2000,
                                                    }}
                                                >
                                                    <HexColorPicker
                                                        color={box.color}
                                                        onChange={(color) => onUpdateColor(box.id, color)}
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteTextBox(box.id);
                                                    setSelectedTextBox(null);
                                                }}>
                                                ❌
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        style={{
                                            fontSize: box.fontSize,
                                            border: '1px dashed #14532d',
                                            background: '#ffffff',
                                            outline: 'none',
                                            width: "250px",
                                            minHeight: `${box.fontSize * 1.4}px`,
                                            resize: "none",
                                            overflow: "hidden",
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "break-word",
                                            padding: '2px 4px',
                                            fontFamily: 'inherit',
                                            color: box.color,
                                            cursor: 'text',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        value={box.text}
                                        onFocus={() => setSelectedTextBox(box.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTextBox(box.id)
                                        }
                                        }
                                        onChange={e => {
                                            onUpdateTextBox(box.id, e.target.value);
                                            e.target.style.height = "auto";
                                            e.target.style.height = `${e.target.scrollHeight}px`
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Escape') {
                                                onSetActiveTool('select')
                                                e.target.blur()
                                            }
                                            if (
                                                e.altKey &&
                                                !e.ctrlKey &&
                                                !e.shiftKey &&
                                                e.key.toLowerCase() === "c"
                                            ) {
                                                e.preventDefault();

                                                if (selectedTextBox) {
                                                    duplicateTextBox(selectedTextBox);
                                                }
                                            }
                                        }}
                                        autoFocus
                                    />
                                </div>
                            ))
                        }
                        {signatures
                            .filter(sig => sig.pageIndex === currentPage)
                            .map(sig => (
                                <div
                                    key={sig.id}
                                    style={{
                                        position: "absolute",
                                        left: sig.x,
                                        top: sig.y,
                                        width: sig.width,
                                        height: sig.height,
                                        border:
                                            selectedSignature === sig.id
                                                ? "2px solid #22c55e"
                                                : "none",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <img
                                        src={sig.image}
                                        alt="signature"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSignature(sig.id);
                                        }}
                                        onMouseDown={(e) => startSignatureDrag(e, sig)}
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            userSelect: "none",
                                            cursor: draggingId === sig.id ? "grabbing" : "grab",
                                            display: "block",
                                        }}
                                    />

                                    {selectedSignature === sig.id && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSignature(sig.id);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: -12,
                                                    right: -12,
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: "none",
                                                    background: "#ef4444",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontWeight: "bold",
                                                    zIndex: 1001,
                                                }}
                                            >
                                                ×
                                            </button>

                                            <div
                                                onMouseDown={(e) => startResize(e, sig)}
                                                style={{
                                                    position: "absolute",
                                                    right: -6,
                                                    bottom: -6,
                                                    width: 12,
                                                    height: 12,
                                                    background: "#22c55e",
                                                    border: "2px solid white",
                                                    borderRadius: "50%",
                                                    cursor: "nwse-resize",
                                                    zIndex: 1000,
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            ))
                        }
                        {watermarks
                            .filter(water =>
                                water.allPages ||
                                water.pageIndex === currentPage
                            )
                            .map(water => (
                                <div
                                    key={water.id}
                                    className="watermark"
                                    onClick={() => {
                                        console.log("Clicked:", water.id);
                                        setSelectedWatermark(water.id);
                                    }}
                                    style={{
                                        opacity: water.opacity / 100,
                                        position: "absolute",
                                        border:
                                            selectedWatermark === water.id
                                                ? "2px solid #2d6a3f"
                                                : "none",
                                        borderRadius: "6px",
                                        ...getWatermarkPosition(water.position),
                                    }}
                                >
                                    {water.type === "text" ? (
                                        <span className="watermark-text">
                                            {water.text}
                                        </span>
                                    ) : (
                                        <img
                                            src={URL.createObjectURL(water.image)}
                                            className="watermark-image"
                                            alt=""
                                        />
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
export default Canvas