import { createContext,useContext,useState,useEffect } from "react";
import { checkBackendStatus } from "../api";

const CloudContext = createContext()

export function CloudProvider({ children }) {
    const [cloudMode,setCloudMode] = useState(false)
    const [backendOnline,setBackendOnline] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(()=>{
        const checkStatus = async ()=>{
            const online = await checkBackendStatus()
            setBackendOnline(online)
            setChecking(false)
        }
        checkStatus()
    },[])
    const toggleCloud = ()=>{
        if(!backendOnline) return
        setCloudMode(prev=>!prev)
    }
    return(
        <CloudContext.Provider value={{ cloudMode,backendOnline,checking,toggleCloud }}>
            {children}
        </CloudContext.Provider>
    )
}
export const useCloud = () => useContext(CloudContext)