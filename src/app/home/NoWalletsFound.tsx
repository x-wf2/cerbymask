import Footer from "./components/Footer"

export default function NoWalletsFound(props: any) {
    return (
        <div style={{ overflowX: "auto" }} className="w-100">
            <div>
                <p className="info-password-title info-landing-title">Welcome to CerbyMask</p>
                <p className="info-password-subtitle">A Radix Protocol Lightweight Wallet</p>
                <p className="App-link" onClick={() => props.generateWallet()}>Generate a new wallet</p>
                <p className="App-link" onClick={() => props.forgotPassword()}>Import via seed phrase</p>
            </div>
            <Footer />
        </div>
    )
}