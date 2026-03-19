import { useRef, useEffect } from "react";
function PageThumbnail({ page, index, pdfDoc, isSelected, onSelect }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        let renderTask = null;
        async function render() {
            const pdfPage = await pdfDoc.getPage(index + 1);
            const viewport = pdfPage.getViewport({ scale: 0.25, rotation: page.rotation });
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            renderTask = pdfPage.render({ canvasContext: ctx, viewport });
            await renderTask.promise;
        }
        render()
        return () => { if (renderTask) renderTask.cancel() }
    }, [pdfDoc, index, page.rotation])
    return (
        <div 
            className={`page-thumb ${isSelected ? 'selected' : ''} ${page.deleted ? 'deleted' : ''}`}
            onClick={() => onSelect(index)}>
            <canvas ref={canvasRef} />
            <span> {index + 1}</span>
        </div>
        

    )
}
export default PageThumbnail