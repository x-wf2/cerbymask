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

    function onPaste(e: any) {
        let raw = e.clipboardData.getData("text/plain")
        let phrase = raw.replace(/\n/g," ").split(" ")

        if(phrase.length >= 2) {
            e.preventDefault()
            let filling = false
            let phraseIndex = 0;
            let fields = document.getElementsByClassName("mnemonic-input-word");
            for(let i = 0; i < fields.length; i++) {
                let field = fields[i] as HTMLInputElement

                if(field === e.target)
                    filling = true
                if(filling && phrase[phraseIndex]) {
                    field.value = phrase[phraseIndex]
                    phraseIndex++
                    if(i < fields.length-1) {
                        (fields[i+1] as HTMLInputElement).select()
                    }
                }
            }
        }
    }

    return (
        <div style={{ overflowX: "auto" }}>
            {!seedSaved &&
                <div>
                    <p className="warn-save-title">Restoring</p>
                    <div className="warn-content-wrapper">
                        <p className="warn-save-text">Please insert the seed phrase you wish to load:</p>
                        <div className="mnemonic-input-container">
                            <input id="input-1" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-2" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-3" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-4" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-5" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-6" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-7" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-8" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-9" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-10" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-11" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
                            <input id="input-12" onPaste={(e) => {onPaste(e)}} className="mnemonic-input-word" type="text"></input>
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