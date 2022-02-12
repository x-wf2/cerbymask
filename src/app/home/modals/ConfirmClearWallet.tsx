import { useEffect, useState } from "react"

export function ConfirmClearWallet(props: any) {

    return (
        <div className="modal-form-container">
            <p className="normal-1 warn-save-title">Warning</p>
            <div className="warn-content-wrapper">
                <p className="warn-save-text">You are about to clear this wallet from this CerbyMask instance.</p>
                <p className="warn-save-text">Are you sure you want to proceed?</p>
            </div>
            <div className="info-content-actions">
                <button onClick={() => props.onCancel()}className="button-normal darker-background">
                    Cancel
                </button>
            </div>
            <div className="info-content-subactions">
                <p onClick={() => props.onConfirm()} className="App-link">No, I want to clear the wallet</p>
            </div>
        </div>
    )
}