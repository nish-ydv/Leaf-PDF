import { useEffect, useRef } from "react";
function Canvas({ pdfDoc, pages, currentPage,onPageChange }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        let renderTask = null;
        async function render() {
            const pdfPage = await pdfDoc.getPage(currentPage + 1);
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
    }, [pdfDoc, currentPage, pages[currentPage].rotation])
    return (
        <div className="canvas-area">
            <div className="canvas-scroll">
                {pages[currentPage]?.deleted ? (
                    <p>Page deleted — undo to restore</p>
                ) : (
                    <canvas ref={canvasRef} />
                )}
            </div>
            <div className="mobile-page-nav">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >←</button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === pages.length - 1}
                >→</button>
            </div>

        </div>
    )
}
export default Canvas