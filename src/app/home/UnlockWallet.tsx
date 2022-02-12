import { Network } from "../../classes/network"


export default function UnlockWallet(props: any) {
    return (
        <div>
            {props.error && <p className="warn-save-title warn-save-title-main no-margin">{props.error}</p>}
            <div className="show-wallet-choose-address-container">
                <select onChange={props.onNetworkChange} className="show-wallet-choose-network small">
                    {props.networks && props.networks.map((network: Network) => {
                        return (
                            <option value={network.name}>
                                {network.name.toUpperCase()}
                            </option>
                        )
                    })}
                </select>
            </div>
            <p className="info-password-title">Welcome Back!</p>
            <div>
                <div className="info-content-wrapper">
                    <input className="input-password" type="password" onChange={(e) => props.onPasswordChange(e)}></input>
                </div>
            </div>
            <div className="info-content-actions">
                <button className="button-normal darker-background" onClick={() => props.onUnlockWallet()}>
                    Continue
                </button>
            </div>
            <div className="info-content-subactions">
                <p className="App-link" onClick={() => props.forgotPassword()}>Forgot password</p>
            </div>
        </div>
    )
}