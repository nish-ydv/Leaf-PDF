import PageThumbnail from "./PageThumbnail"
function LeftPanel({ pages, currentPage, pdfDoc, onSelect }) {
    return (
        <div className="page-panel">
            <div className="page-panel-header">
                <span>Pages</span>
                <span>{pages.length}</span>
            </div>
            <div className="page-panel-scroll">
                {pages.map((page, index) => (
                    <PageThumbnail 
                        key={page.id}
                        page={page}
                        index={index}
                        pdfDoc={pdfDoc}
                        isSelected={currentPage===index}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    )
}
export default LeftPanel