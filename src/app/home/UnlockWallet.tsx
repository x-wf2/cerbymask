import React, { useEffect } from "react"
import { Network } from "../../classes/network"

import Footer from "./components/Footer"

export default function UnlockWallet(props: any) {
    return (
        <div style={{ overflowX: "auto" }}>
            <div>
                {props.error && <p className="warn-save-title no-margin">{props.error}</p>}
                <div className="show-wallet-choose-address-container show-network-choose-address-container">
                    <select onChange={props.onNetworkChange} className="show-wallet-choose-address small">
                        {props.networks && props.networks.map((network: Network) => {
                            return (
                                <option value={network.name}>
                                    {network.name}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <p className="info-password-title">Welcome Back!</p>
                <div className="info-content-wrapper">
                    <input className="input-password w-100" type="password" onChange={(e) => props.onPasswordChange(e)}></input>
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
            <Footer/>
        </div>
    )
}