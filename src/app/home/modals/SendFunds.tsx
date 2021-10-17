import React, { useState } from "react"
import { BigNumber } from "bignumber.js"
import { formatBigNumber } from "../../utils/formatters"

export type FieldErrorsT = Readonly<{
    amount: string;
    to: string;
    message: string;
}>

export default function SendFunds(props: any) {

    let [confirming, setConfirming] = useState(false)
    let [errors, setErrors] = useState({amount: "", to:"", message: ""} as FieldErrorsT)
    
    // Fields
    let [token, setToken] = useState(0)
    let [fields, setFields] = useState({amount: "", to:"", message: ""} as FieldErrorsT)

    function onSendTokenChange(e: any) {
        let index = e.target.value
        setToken(index)
        // setErrors({...errors, message: "Invalid Message 2"})
    }

    function handleInputChange(e: any) {
        const field = e.target.name;
        const value = e.target.value;

        if(field === "amount")
            if(value)
        setFields({ ...fields, [field]: value })
    }

    function onStartNewTransaction() {
        console.log(fields)
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Send Funds</h1>
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length && !confirming &&
                <div className="modal-form-column-centered">
                    <div className="centered-flex">
                        <p className="info-password-title info-send-funds-title small no-margin">Token:</p>
                        <div className="info-content-wrapper">
                            <select value={token} onChange={onSendTokenChange} className="input-password input-select-funds w-100 small">
                                <option value={0}>
                                    xrd
                                </option>
                                {props.wallet.radixTokens.length && props.wallet.radixTokens[props.wallet.selectedAddress].tokens.map((tokenInfo: any, index: any) => {
                                    return (
                                        <option value={index + 1}>
                                            {tokenInfo.tokenInfo.symbol}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                        {token > 0 && props.wallet.selectedAddress < props.wallet.radixTokens.length && props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].tokenInfo.symbol == "dgc" &&
                            <p className="show-wallet-eq-balance position-fix small" style={{ marginTop: "6px" }}>
                                {props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].tokenInfo.description}
                            </p>
                        }
                    </div>
                    <div className="centered-flex margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">Amount:</p>
                        <div className="info-content-wrapper">
                            { errors && errors.amount != "" && <p className="warn-save-title small no-margin">{errors.amount}</p> }
                            <input
                                className="input-password input-amount-funds w-100 small"
                                type="number"
                                min="0"
                                step="1"
                                onChange={handleInputChange}
                                name="amount"
                                max={token == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd?.value.toString()).shiftedBy(-18).toNumber() || 0) :
                                    (props.wallet.selectedAddress < props.wallet.radixTokens.length && new BigNumber(props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].amount).shiftedBy(-18).toNumber() || 0)}
                                placeholder={`Max: ${token == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && formatBigNumber(new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd?.value.toString()).shiftedBy(-18)) || 0) :
                                    (props.wallet.selectedAddress < props.wallet.radixTokens.length && formatBigNumber(new BigNumber(props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].amount).shiftedBy(-18)))}`}></input>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">To:</p>
                        <div className="info-content-wrapper">
                            { errors && errors.to != "" && <p className="warn-save-title small no-margin">{errors.to}</p> }
                            <input
                                onChange={handleInputChange}
                                name="to"
                                className="input-password input-to-funds w-100 small"
                                placeholder="rdx1qspvjmpptml8nay0jm5t2n35vyjpdtuhwz6ha2cg7yawpeyswtzf8ks5u4nzu"
                                type="text"></input>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">Message:</p>
                        <div className="info-content-wrapper">
                            { errors && errors.message != "" && <p className="warn-save-title small no-margin">{errors.message}</p> }
                            <input
                                onChange={handleInputChange}
                                name="message"
                                className="input-password input-to-funds w-100 small"
                                placeholder="(optional)"
                                type="text">
                            </input>
                        </div>
                    </div>
                    <div className="info-content-actions">
                        <button className="button-normal" onClick={onStartNewTransaction}>
                            Next
                        </button>
                    </div>
                </div>
            }
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length && confirming &&
                <div className="modal-form-column-centered">
                    {props.error && <p className="warn-save-title no-margin">{props.error}</p>}
                </div>
            }
        </div>
    )
}