import axios from 'axios'
const BACKEND_URL = 'https://leafpdf-backend.onrender.com'
export const checkBackendStatus = async()=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/health`)
        return response.data.status === 'healthy'
    }
    catch{
        return false
    }
}

export const cloudMerge = async(files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('pdfs', file))
    const response = await axios.post(`${BACKEND_URL}/merge`, formData, {
        responseType: 'blob'
    })
    return response.data
}
export const cloudConvert = async(files) =>{
    const formData = new FormData()
    files.forEach(file => formData.append('images',file))
    const response = await axios.post(`${BACKEND_URL}/convert`,formData,{
        responseType:'blob'
    })
    return response.data
}
export const cloudCompress = async(file,quality) =>{
    const formData = new FormData()
    formData.append('pdf',file)
    formData.append('quality',quality)
    const response = await axios.post(`${BACKEND_URL}/compress`, formData, {
        responseType: 'blob'
    })
    return response.data
}
export const cloudExtractPages = async (file, pages) => {
    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('pages', pages)
    
    const response = await axios.post(`${BACKEND_URL}/extract-pages`, formData, {
        responseType: 'blob'
    })
    return response.data
}
export const cloudWord = async (file) => {
    const formData = new FormData()
    formData.append('pdf', file)
    try {
        const response = await axios.post(`${BACKEND_URL}/word`, formData, {
            responseType: 'blob',
            timeout: 120000
        })
        return response.data
    } catch (err) {
        if (err.response?.data instanceof Blob) {
            const text = await err.response.data.text()
            try {
                const json = JSON.parse(text)
                throw new Error(json.error || 'Conversion failed')
            } catch {
                throw new Error('Conversion failed')
            }
        }
        throw new Error('Network error — check your connection')
    }
}
export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}