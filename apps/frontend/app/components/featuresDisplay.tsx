import "./featuresDisplay.css"

export default function FeaturesDisplay() {
    return (
        <div className="featdisplay">
            <div className="item">
                <video src="/videos/anvil.mp4" autoPlay loop
                    className="preview" />
                <div className="content">
                    <h1>My projects</h1>
                    <p>i also like to host something</p>
                    <div className="buttons">
                        <a href="https://github.com/">
                            <div className="meta">
                                <p>EXAMPLE PROJECT</p> {/* todo: create endpoint in backend to manage work contact url and projects blocks */}
                                <p className="description">EXAMPLE PROJECT DESCRIPTION</p>
                            </div>
                        </a>
                    </div>
                    <p>you want me to work with you? <a href="https://urltocontact.nodomain/TODO"><u>please, contact me!</u></a></p>
                </div>
            </div>
        </div>
    )
}
