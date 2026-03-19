function Contact() {
    return (
        <>
            <div className="hero-leaves">
                <img src="/resources/leaf.svg" className="leaf leaf1" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf2" alt="" />
                <img src="/resources/leaf.svg" className="leaf leaf3" alt="" />
            </div>

            <main className="contact-page">
                <div className="contact-header">
                    <h1 className="contact-h1">Say <span>hello.</span></h1>
                    <p className="contact-sub">Have a question, found a bug, or want to suggest a tool? I'd love to hear from you.</p>
                </div>

                <div className="contact-cards">
                    <a className="contact-card" href="mailto:nishantyadav0944@gmail.com">
                        <div className="contact-card-ico ico-mail">✉️</div>
                        <div className="contact-card-body">
                            <div className="contact-card-label">Email</div>
                            <div className="contact-card-value">nishantyadav0944@gmail.com</div>
                        </div>
                        <span className="contact-card-arrow">↗</span>
                    </a>
                    <a className="contact-card" href="https://github.com/nish-ydv" target="_blank">
                        <div className="contact-card-ico ico-github">🐙</div>
                        <div className="contact-card-body">
                            <div className="contact-card-label">GitHub</div>
                            <div className="contact-card-value">github.com/nish-ydv</div>
                        </div>
                        <span className="contact-card-arrow">↗</span>
                    </a>
                </div>

                <div className="feedback-box">
                    <div className="feedback-emoji">🍃</div>
                    <div className="feedback-title">Found a bug or have an idea?</div>
                    <div className="feedback-text">The best way to suggest features or report issues is through GitHub. Open an
                        issue and I'll get back to you there.</div>
                    <a className="feedback-btn" href="https://github.com/nish-ydv/PDF-Scanner/issues" target="_blank">
                        Open an issue on GitHub →
                    </a>
                </div>
            </main>
        </>
    )
}

export default Contact