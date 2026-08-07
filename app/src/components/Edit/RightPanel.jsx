import { Link } from "react-router-dom"
import { Signature, Sliders } from "lucide-react";
import { useState } from "react";
function RightPanel({ onRotateCW, onRotateCCW, onDelete, isLoaded, activeTool, onSetActiveTool, pages, currentPage, showSignaturePad, setShowSignaturePad, watermarkType, setWatermarkType
    , watermarkText, setWatermarkText, watermarkImage, setWatermarkImage, watermarkOpacity, setWatermarkOpacity, watermarkPosition, setWatermarkPosition, watermarkApplyTo, setWatermarkApplyTo
    , onApplyWatermark, onRemoveWatermark, selectedWatermark, onRemoveSelectedWatermark, removeMode, setRemoveMode }) {
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
                <div className="rpanel-title">Watermark</div>
                <button
                    className={`rpanel-btn ${activeTool === "watermark" ? "active" : ""}`}
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
                {activeTool === "watermark" && (
                    <div className="watermark-options">
                        <div className="watermark-type-selector">
                            <button
                                className={`watermark-type-btn ${watermarkType === "text" ? "active" : ""
                                    }`}
                                onClick={() => setWatermarkType("text")}
                            >
                                📝 Text
                            </button>

                            <button
                                className={`watermark-type-btn ${watermarkType === "image" ? "active" : ""
                                    }`}
                                onClick={() => setWatermarkType("image")}
                            >
                                🖼 Image
                            </button>
                        </div>
                        {watermarkType === "text" && (
                            <input
                                type="text"
                                placeholder="Enter Watermark"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                            />
                        )}
                        {watermarkType === "image" && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setWatermarkImage(e.target.files[0])}
                            />
                        )}
                        <label htmlFor="opacity-slider" className="opacity">Opacity:</label>
                        <input
                            type="range"
                            id="opacity-slider"
                            min="0"
                            max="100"
                            value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        />
                        <span className="opacity-value">
                            {watermarkOpacity}%
                        </span>
                        <label htmlFor="watermark-position">
                            Position:
                        </label>
                        <select
                            id="watermark-position"
                            value={watermarkPosition}
                            onChange={(e) => setWatermarkPosition(e.target.value)}
                        >
                            <option value="center">Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                        </select>
                        <select
                            value={watermarkApplyTo}
                            onChange={(e) => setWatermarkApplyTo(e.target.value)}
                        >
                            <option value="current">Current Page</option>
                            <option value="all">All Page</option>
                        </select>
                        <button className="rpanel-btn" onClick={onApplyWatermark}>
                            💧 Apply Watermark
                        </button>
                    </div>
                )}
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