import React from "react"
import { useState } from "react"
import { Wallet } from "../../classes/wallet"

export default function GenerateWallet(props: any) {
    const [seedSaved, setSeedSaved] = useState(false)
    const [passwordSaved, setPasswordSaved] = useState(false)

    return (
        <div style={{ overflowX: "auto" }}>
            {!props.wallet.key &&
                <p>Generating Key...</p>
            }
            {props.wallet.key && !seedSaved &&
                <div>
                    <p className="warn-save-title">Warning</p>
                    <div className="warn-content-wrapper">
                        <p className="warn-save-text">Please make sure you save the following seed:</p>
                        <p className="warn-mnemonic">{props.wallet.key.mnemonic.phrase}</p>
                        <p className="warn-save-text"> You will not be able to access it otherwise, and we will not be able to help you.</p>
                    </div>
                    <div className="warn-content-actions">
                        <p className="App-link" onClick={() => setSeedSaved(true)}>I have saved the seed</p>
                        <p className="App-link" onClick={() => props.onCompleteWallet()}>Cancel</p>
                    </div>
                </div>
            }
            {props.wallet.key && seedSaved && !passwordSaved &&
                <div>
                    <p className="info-password-title">Password</p>
                    <div className="info-content-wrapper">
                        <p className="info-save-text">Choose a password:</p>
                        <input className="input-password" type="password" onChange={(e) => props.onPasswordChange(e)}></input>
                    </div>
                    <div className="info-content-actions">
                        <p className="App-link" onClick={() => { setPasswordSaved(true); props.onCreateWallet() }}>Continue</p>
                        <p className="App-link" onClick={() => props.onCompleteWallet()}>Cancel</p>
                    </div>
                </div>
            }
            {props.wallet.key && seedSaved && passwordSaved &&
                <div>
                    <p>Your wallet has been saved.</p>
                    <div className="info-content-subactions">
                        <p className="App-link" onClick={() => props.onCompleteWallet()}>OK</p>
                    </div>
                </div>
            }
        </div>
    )
}