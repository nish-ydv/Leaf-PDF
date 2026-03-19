import { Link } from "react-router-dom"
function Toolbar({ fileName, onRotateCW, onRotateCCW, onDelete, onSave, onUndo, canUndo, isLoaded }) {
    return (
        <div className='editor-toolbar'>
            <Link to="/" className="logo">
                <div className="logo-mark">🍃</div>
                <span className="logo-text">Leaf<span>PDF</span></span>
            </Link>
            <div className="toolbar-divider" />
            <button className='tb-btn' onClick={onUndo} disabled={!canUndo}>↩ Undo</button>
            <div className="toolbar-divider" />
            <button className='tb-btn' onClick={onRotateCW} disabled={!isLoaded}>↻ Rotate CW</button>
            <button className='tb-btn' onClick={onRotateCCW} disabled={!isLoaded}>↺ Rotate CCW</button>
            <button className='tb-btn danger' onClick={onDelete} disabled={!isLoaded}>🗑 Delete</button>
            <div className="toolbar-divider" />
            <span className="toolbar-filename">{fileName}</span>
            <div className="toolbar-spacer" />
            <button className='tb-btn-save' onClick={onSave} disabled={!isLoaded}>💾 Save PDF</button>
        </div>
    )
}
export default Toolbar