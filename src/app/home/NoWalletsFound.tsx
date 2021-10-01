export default function NoWalletsFound (props: any) {
    return (
        <div>
            <p>No wallets found.</p>
            <p className="App-link" onClick={() => props.generateWallet()}>Generate a new wallet</p>
            <p className="App-link" onClick={() => {}}>Import via seed phrase</p>
        </div>
    )
}