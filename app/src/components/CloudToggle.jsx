import { useCloud } from "../context/cloudContext";

function CloudToggle(){
    const {cloudMode, backendOnline, checking, toggleCloud} = useCloud()
    if(checking) return <div className="cloud-toggle">Checking Cloud</div>
    
    return(
        <div className="cloud-toggle">
            <span className={`status-dot ${cloudMode ? 'online' : 'offline'}`}/>
            <span className="toggle-label">
                Cloud Mode
            </span>
            <button
                className={`toggle-btn ${cloudMode ? 'active' : ''} ${!backendOnline ? 'disabled' : ''}`}
                onClick={toggleCloud}
                disabled={!backendOnline}
                title={!backendOnline ? 'Backend offline' : ''}
            >
                {cloudMode ? 'ON' : 'OFF'}
            </button>
        </div>
    )
}
export default CloudToggle