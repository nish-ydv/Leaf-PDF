function About() {
    return (
        <>
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>

            <main className="about-page">
                <div className="about-hero">
                    <span className="about-leaf">🍃</span>
                    <h1 className="about-h1">PDF tools, <span>built simply.</span></h1>
                    <p className="about-lead">LeafPDF is a free, browser-based PDF toolkit built by a developer who wanted fast,
                        private PDF tools without the bloat. No sign-ups. No uploads. Just tools that work.</p>
                </div>

                <div className="about-stats">
                    <div className="about-stat">
                        <div className="about-stat-num">5</div>
                        <div className="about-stat-label">Current tools</div>
                    </div>
                    <div className="about-stat">
                        <div className="about-stat-num">0</div>
                        <div className="about-stat-label">Files uploaded ever</div>
                    </div>
                    <div className="about-stat">
                        <div className="about-stat-num">100%</div>
                        <div className="about-stat-label">Free forever</div>
                    </div>
                </div>

                <div className="how-it-works-card">
                    <div className="hiw-label">How it works</div>
                    <div className="hiw-steps">
                        <div className="hiw-step">
                            <div className="hiw-num">1</div>
                            <div className="hiw-text">
                                <strong>You pick a tool and drop your file.</strong>
                                Nothing gets uploaded — the file stays in your browser's memory the entire time.
                            </div>
                        </div>
                        <div className="hiw-step">
                            <div className="hiw-num">2</div>
                            <div className="hiw-text">
                                <strong>Your browser does the work.</strong>
                                pdf-lib and pdf.js process everything locally using JavaScript — the same way your browser
                                renders a webpage.
                            </div>
                        </div>
                        <div className="hiw-step">
                            <div className="hiw-num">3</div>
                            <div className="hiw-text">
                                <strong>Your file downloads instantly.</strong>
                                No server involved, no waiting, no data ever leaves your device.
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="section-heading">What we stand for</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-ico">🔒</div>
                        <div className="value-title">Privacy first</div>
                        <div className="value-desc">Every tool runs in your browser. Your files never touch a server.</div>
                    </div>
                    <div className="value-card">
                        <div className="value-ico">⚡</div>
                        <div className="value-title">Fast by default</div>
                        <div className="value-desc">No uploads means no waiting. Processing is instant.</div>
                    </div>
                    <div className="value-card">
                        <div className="value-ico">🆓</div>
                        <div className="value-title">Free forever</div>
                        <div className="value-desc">No paywalls, no limits, no premium tiers. All tools, always free.</div>
                    </div>
                    <div className="value-card">
                        <div className="value-ico">🌱</div>
                        <div className="value-title">Always growing</div>
                        <div className="value-desc">New tools added regularly. Built in public, open source on GitHub.</div>
                    </div>
                </div>

                <h2 className="section-heading">Built with</h2>
                <div className="tech-chips">
                    <div className="tech-chip">⚛️ React</div>
                    <div className="tech-chip">📄 pdf-lib</div>
                    <div className="tech-chip">👁 pdf.js</div>
                    <div className="tech-chip">🎨 HTML & CSS</div>
                    <div className="tech-chip">🐙 GitHub Pages</div>
                </div>
            </main>
        </>
    )
}

export default About