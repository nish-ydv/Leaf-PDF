import { Signature } from "lucide-react";
function RightPanel({ onRotateCW, onRotateCCW, onDelete, isLoaded, activeTool, onSetActiveTool, showSignaturePad, setShowSignaturePad, onRemoveWatermark }) {
    return (
        <div className="right-panel">
            <div className="rpanel-section">
                <div className="rpanel-title">Page</div>
                <button className='rpanel-btn' onClick={onRotateCW} disabled={!isLoaded}>↻ Rotate CW</button>
                <button className='rpanel-btn' onClick={onRotateCCW} disabled={!isLoaded}>↺ Rotate CCW</button>
                <button className='rpanel-btn danger' onClick={onDelete} disabled={!isLoaded}>🗑 Delete</button>
            </div>
            <div className="rpanel-section">
                <div className="rpanel-title">Annotate</div>
                <button
                    className={`rpanel-btn ${activeTool === 'text' ? 'active' : ''}`}
                    onClick={() => onSetActiveTool(activeTool === 'text' ? 'select' : 'text')}
                >
                    T Add Text
                </button>
                <button
                    className={`rpanel-btn ${showSignaturePad ? 'active' : ''}`}
                    onClick={() => setShowSignaturePad(prev => !prev)}
                >
                    <Signature size={18} />
                    <span>Add Signature</span>
                </button>
                <div className="rpanel-title">
                    Watermark
                </div>

                <button
                    className={`rpanel-btn ${
                        activeTool === "watermark" ? "active" : ""
                    }`}
                    onClick={() =>
                        onSetActiveTool(
                            activeTool === "watermark"
                                ? "select"
                                : "watermark"
                        )
                    }
                >
                    💧 Add Watermark
                </button>
                <button
                    className="rpanel-btn danger"
                    onClick={onRemoveWatermark}
                >
                    🗑 Remove Watermarks
                </button>
            </div>
        </div>
    )
}
export default RightPanel