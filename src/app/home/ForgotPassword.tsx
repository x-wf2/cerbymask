import { nextTick } from "process"
import React, { useState } from "react"

export default function ForgotPassword(props: any) {
    let [ seedSaved, setSeedSaved ] = useState(false)
    let [ passwordSaved, setPasswordSaved ] = useState(false)

    function next() {
        const mnemonicWords = document.getElementsByClassName('mnemonic-input-word');
        let phrase = ""
        for(let i = 0; i < mnemonicWords.length; i++) {
            let word = (mnemonicWords[i] as HTMLInputElement).value
            phrase += word + (i == mnemonicWords.length-1 ? "" : " ")
        }
        let changed = props.onMnemonicChange(phrase)
        setSeedSaved(changed)
    }

    return (
        <div style={{ overflowX: "auto" }}>
            {!seedSaved &&
                <div>
                    <p className="warn-save-title">Restoring</p>
                    <div className="warn-content-wrapper">
                        <p className="warn-save-text">Please insert the seed phrase you wish to load:</p>
                        <div className="mnemonic-input-container">
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                            <input className="mnemonic-input-word" type="text"></input>
                        </div>
                    </div>
                    <div className="warn-content-actions">
                        <p className="App-link" onClick={() => next()}>Next</p>
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
                        <p className="App-link" onClick={() => { setPasswordSaved(true); props.onCreateWallet(); }}>Continue</p>
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