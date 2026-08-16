import "./yabloko.css"

export default function Yabloko() {
    return (
        <div className="yabloko">
            <a className="content" href="https://yabloko.ru/">
                <div className="track">
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>Голосуйте за Яблоко</p>
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>За мир и свободу!</p>
                </div>
                <div className="track" aria-hidden="true">
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>Голосуйте за яблоко</p>
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>За жизнь без страха!</p>
                </div>
                <div className="track" aria-hidden="true">
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>Голосуйте за Яблоко</p>
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>За мир и свободу!</p>
                </div>
                <div className="track" aria-hidden="true">
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>Голосуйте за яблоко</p>
                    <img className="logo" src={"/yabloko.svg"} />
                    <p>За жизнь без страха!</p>
                </div>
            </a>
            <p className="disclaimer">
                * Размещено по собственной инициативе владельца сайта. Владелец сайта не является членом партии "Яблоко" и не представляет партию.</p>
        </div>
    )
}
