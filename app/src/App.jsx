import { HashRouter, Routes, Route } from 'react-router-dom'
import { CloudProvider } from './context/cloudContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Merge from './pages/Merge'
import Split from './pages/Split'
import Convert from './pages/Convert'
import Shrink from './pages/Shrink'
import About from './pages/About'
import Contact from './pages/Contact'
import Editor from './pages/Editor'
import ExtractPages from './pages/extract/ExtractPages'
import ExtractImages from './pages/extract/ExtractImages'
import ExtractText from './pages/extract/ExtractText'
import LockPDF from './pages/security/Lock'
import UnlockPDF from './pages/security/Unlock'
import Word from './pages/Word'

import './css/style.css'
import './css/tools.css'
import './css/index.css'
import './css/editor.css'
import './css/backend.css'
function Layout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge" element={<Merge />} />
        <Route path="/split" element={<Split />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/shrink" element={<Shrink />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/word" element={<Word />} />
        <Route path='/extract/pages' element={<ExtractPages />} />
        <Route path='/extract/images' element={<ExtractImages />} />
        <Route path='/extract/text' element={<ExtractText />} />
        <Route path='/security/lock' element={<LockPDF />} />
        <Route path='/security/unlock' element={<UnlockPDF />} />
      </Routes>
      <Footer />
    </>
  )
}

function App() {
  return (
    <CloudProvider>
      <HashRouter>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </HashRouter>
    </CloudProvider>
  )
}

export default App