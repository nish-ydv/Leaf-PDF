import { useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function PageThumbnail({ page, index, pdfDoc, isSelected, onSelect }) {
    const canvasRef = useRef(null)
    const renderTaskRef = useRef(null)

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    useEffect(() => {
        async function render() {
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel() } catch (e) { }
                renderTaskRef.current = null
            }
            if (!pdfDoc) return

            try {
                const pdfPage = await pdfDoc.getPage(page.id)
                const viewport = pdfPage.getViewport({ scale: 0.25, rotation: page.rotation })

                const canvas = canvasRef.current
                if (!canvas) return

                canvas.width = viewport.width
                canvas.height = viewport.height

                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                renderTaskRef.current = pdfPage.render({ canvasContext: ctx, viewport })
                await renderTaskRef.current.promise
                renderTaskRef.current = null
            } catch (e) {
            }
        }

        render()

        return () => {
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel() } catch (e) { }
                renderTaskRef.current = null
            }
        }
    }, [pdfDoc, page.id, page.rotation])

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`page-thumb ${isSelected ? 'selected' : ''} ${page.deleted ? 'deleted' : ''}`}
            onClick={() => onSelect(index)}
        >
            <span
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab', padding: '8px', fontSize: '18px', display: 'block', textAlign: 'center', touchAction: 'none' }}
            >
                ≡
            </span>
            <canvas ref={canvasRef} />
            <span>{index + 1}</span>
        </div>
    )
}

export default PageThumbnail