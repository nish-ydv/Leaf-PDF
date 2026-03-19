import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav id="navbar">
            <Link to="/" className="logo">
                <div className="logo-mark">🍃</div>
                <span className="logo-text">Leaf<span>PDF</span></span>
            </Link>

            <div className="nav-links">
                <div className="nav-item">
                    <div className="nav-link active">
                        Tools <span className="nav-chevron">▼</span>
                    </div>
                    <div className="nav-dropdown">
                        <div className="dd-group">Organize</div>
                        <Link to="/merge" className="dd-row">
                            <div className="dd-ico">🔗</div>
                            <div>
                                <div className="dd-name">Merge PDF</div>
                                <div className="dd-desc">Combine Multiple PDF's</div>
                            </div>
                        </Link>
                        <Link to="/split" className="dd-row">
                            <div className="dd-ico">✂️</div>
                            <div>
                                <div className="dd-name">Split PDF</div>
                                <div className="dd-desc">Split PDF at any page</div>
                            </div>
                        </Link>
                        <div className="dd-divider"></div>
                        <div className="dd-group">Convert</div>
                        <Link to="/convert" className="dd-row">
                            <div className="dd-ico">🖼</div>
                            <div>
                                <div className="dd-name">Image To PDF</div>
                                <div className="dd-desc">JPG or PNG to PDF</div>
                            </div>
                        </Link>
                        <div className="dd-divider"></div>
                        <div className="dd-group">Optimize</div>
                        <Link to="/shrink" className="dd-row">
                            <div className="dd-ico">📦</div>
                            <div>
                                <div className="dd-name">Shrink PDF</div>
                                <div className="dd-desc">Shrink file size</div>
                            </div>
                        </Link>
                        <div className="dd-divider"></div>
                        <Link to="/#tools" className="dd-all">Browse all tools →</Link>
                    </div>
                </div>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
            </div>

            <div className="nav-end">
                <a href="https://github.com/nish-ydv" target="_blank" className="btn-ghost">GitHub</a>
                <Link to="/editor" className="btn-cta">Open PDF →</Link>
            </div>
        </nav>
    )
}

export default Navbar