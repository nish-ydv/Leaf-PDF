import { Link } from "react-router-dom"
import { useRef } from "react"
import SignatureCanvas from "react-signature-canvas";
function SignaturePad({ onClose, signatureImage, setSignatureImage, setActiveTool }) {
    const sigCanvas = useRef(null);
    function clearSignature() {
        sigCanvas.current.clear()
    }
    function saveSignature() {
        if (sigCanvas.current.isEmpty()) return;
        const image = sigCanvas.current.toDataURL("image/png");
        console.log(image);
        setSignatureImage(image);
        sigCanvas.current.clear()
        setActiveTool("signature")
        onClose();
    }
    return (
        <div className="signature-overlay">
            <div className="signature-modal">
                <h2>Draw Signature</h2>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: 500,
                        height: 200,
                        className: "signature-canvas"
                    }}
                />
                <div className="signature-actions">
                    <button onClick={clearSignature}>Clear</button>
                    <button onClick={saveSignature}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}
export default SignaturePad