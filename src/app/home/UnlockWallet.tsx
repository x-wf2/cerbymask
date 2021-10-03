import React from "react"

export default function UnlockWallet(props: any) {

    return (
        <div style={{ overflowX: "auto" }}>
            <div>
                {props.error && <p className="warn-save-title">{props.error}</p> }
                <p className="info-password-title">Unlock Wallet</p>
                <div className="info-content-wrapper">
                    <input className="input-password" type="password" onChange={(e) => props.onPasswordChange(e)}></input>
                </div>
                <div className="info-content-actions">
                    <button className="button-normal" onClick={() => { props.onUnlockWallet() }}>
                        Continue
                    </button>
                </div>
                <div className="info-content-subactions">
                    <p className="App-link" onClick={() => {}}>Forgot password</p>
                </div>
            </div>
        </div>
    )
}