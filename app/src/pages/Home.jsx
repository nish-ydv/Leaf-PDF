import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    useEffect(() => {
        function handleScroll() {
            const nav = document.getElementById('navbar')
            if (!nav) return
            nav.classList.toggle('scrolled', window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const tools = [
        { name: 'Edit PDF', desc: 'Rotate, delete, reorder, sign — all in one editor', icon: '🍃', category: 'organize', path: '/editor', featured: true, badge: 'Editor', badgeClass: 'badge-editor' },
        { name: 'Merge PDF', desc: 'Combine multiple PDFs into one', icon: '🔗', category: 'organize', path: '/merge', badge: 'Live', badgeClass: 'badge-live' },
        { name: 'Split PDF', desc: 'Split into two PDFs at any page', icon: '✂️', category: 'organize', path: '/split', badge: 'Live', badgeClass: 'badge-live' },
        { name: 'Image to PDF', desc: 'Convert JPG or PNG to PDF', icon: '🖼', category: 'convert', path: '/convert', badge: 'Live', badgeClass: 'badge-live' },
        { name: 'Compress PDF', desc: 'Shrink file size without quality loss', icon: '📦', category: 'optimize', path: '/shrink', badge: 'Live', badgeClass: 'badge-live' },
    ]

    const categories = [
        { id: 'organize', name: 'Organize', desc: 'Manage and rearrange pages' },
        { id: 'convert', name: 'Convert', desc: 'PDF to and from other formats' },
        { id: 'optimize', name: 'Optimize', desc: 'Reduce size and improve quality' },
    ]

    const filteredTools = tools.filter(tool => {
        const matchSearch = !search ||
            tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.desc.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || tool.category === filter
        return matchSearch && matchFilter
    })

    return (
        <>
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-pill">
                        <span className="pill-leaf">🍃</span>
                        Free · No uploads · Works offline
                    </div>
                    <h1 className="hero-h1">
                        PDF tools,<br />
                        <span className="hero-green">light </span>as a<span className="hero-italic"> leaf.</span>
                    </h1>
                    <p className="hero-sub">
                        Merge, split, compress, edit and convert your PDFs —
                        everything runs locally in your browser. Nothing ever leaves your device.
                    </p>
                    <div className="hero-btns">
                        <Link to="/convert" className="btn-primary">🍃 Get started free</Link>
                        <a href="#tools" className="btn-secondary">Browse all tools</a>
                    </div>
                    <div className="hero-stat">
                        <div className="stat">
                            <span className="stat-num hero-green">5</span>
                            <span className="stat-label">Current tools</span>
                        </div>
                        <div className="stat">
                            <span className="stat-num">0</span>
                            <span className="stat-label">files uploaded to server</span>
                        </div>
                        <div className="stat">
                            <span className="stat-num">100%</span>
                            <span className="stat-label">Free forever</span>
                        </div>
                    </div>
                </div>
            </section>
            <div className="paper-container">
                <section className="trust-bar">
                    <div className="trust-item"><span>🍃</span>Local Processing Only</div>
                    <div className="trust-item"><span>🍃</span>No Sign Up Needed</div>
                    <div className="trust-item"><span>🍃</span>Always Free</div>
                    <div className="trust-item"><span>🍃</span>Works Offline</div>
                </section>
                <section className="editor-banner">
                    <div className="banner-inner">
                        <div className="banner left">
                            <p className="banner-eyebrow">✦ Full Editor</p>
                            <h2 className="banner-title">Edit PDF — everything in one place</h2>
                            <p className="banner-sub">
                                Open once, do everything. Rotate, delete, reorder pages,
                                add text, signatures and watermarks — all before saving once.
                            </p>
                            <div className="banner-tags">
                                <span className="btag">Rotate pages</span>
                                <span className="btag">Delete pages</span>
                                <span className="btag">Reorder</span>
                                <span className="btag">Signatures</span>
                                <span className="btag">Watermarks</span>
                            </div>
                        </div>
                        <Link to="/editor" className="banner-cta">Open Editor →</Link>
                    </div>
                </section>
                <section className="tools-search" id="tools">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search tools — merge, compress, rotate…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-chips">
                        {['all', 'organize', 'convert', 'optimize'].map(f => (
                            <button
                                key={f}
                                className={`chip ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)} tools
                            </button>
                        ))}
                    </div>
                </section>
                <main className="tool-grid">
                    {categories.map(cat => {
                        const catTools = filteredTools.filter(t => t.category === cat.id)
                        if (catTools.length === 0) return null
                        return (
                            <section key={cat.id} className="tool-category">
                                <div className="cat-header">
                                    <h2 className="cat-name">{cat.name}</h2>
                                    <span className="cat-count">{catTools.length}</span>
                                    <span className="cat-desc">{cat.desc}</span>
                                </div>
                                <div className="grid">
                                    {catTools.map(tool => (
                                        <Link
                                            key={tool.name}
                                            to={tool.path}
                                            className={`tool-card ${tool.featured ? 'featured' : ''}`}
                                        >
                                            <div className="card-icon">{tool.icon}</div>
                                            <div className="card-body">
                                                <h3 className="card-name">{tool.name}</h3>
                                                <p className="card-desc">{tool.desc}</p>
                                            </div>
                                            <div className="card-footer">
                                                <span className={`badge ${tool.badgeClass}`}>{tool.badge}</span>
                                                <span className="card-arrow">↗</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </main>
            </div>
        </>
    )
}

export default Home