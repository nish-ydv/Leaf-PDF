import PageThumbnail from "./PageThumbnail"
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
function LeftPanel({ pages, currentPage, pdfDoc, onSelect, onReorder }) {
    return (
        <div className="page-panel">
            <div className="page-panel-header">
                <span>Pages</span>
                <span>{pages.length}</span>
            </div>
            <div className="page-panel-scroll">
                <DndContext onDragEnd={onReorder}>
                    <SortableContext items={pages.map(p => p.id)}
                        strategy={verticalListSortingStrategy}>
                        {pages.map((page, index) => (
                            <PageThumbnail
                                key={page.id}
                                page={page}
                                index={index}
                                pdfDoc={pdfDoc}
                                isSelected={currentPage === index}
                                onSelect={onSelect}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    )
}
export default LeftPanel