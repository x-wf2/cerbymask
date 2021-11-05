import React, { useEffect, useState } from "react"
import BigNumber from "bignumber.js"
import { formatBigNumber, handleKeyDown, validateAddress, validateAmount } from "../../utils/formatters"
import { TransactionFieldsT } from "../../types"
import { startNewTransaction } from "../../utils/background"

export default function SendFunds(props: any) {

    let [fields, setFields] = useState({ amount: "", to: "" } as TransactionFieldsT)
    let [errors, setErrors] = useState({ amount: "", to: "" } as TransactionFieldsT)
    let [token, setToken] = useState(0)

    function onSendTokenChange(e: any) {
        let index = e.target.value
        setToken(index)
    }

    function handleInputChange(e: any) {
        const field = e.target.name;
        const value = e.target.value;

        setFields({ ...fields, [field]: value })
        setErrors({ ...errors, [field]: "" })
    }

    async function onStartNewTransaction() {
        let validTransaction = true

        let rri = ""
        if (token == 0)
            rri = (props.wallet.selectedAddress < props.wallet.radixBalances.length && props.wallet.radixBalances[props.wallet.selectedAddress].rri)
        else
            rri = (props.wallet.selectedAddress < props.wallet.radixTokens.length && props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].rri)

        let from = ""
        from = (props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length && props.wallet.radixPublicAddresses[props.wallet.selectedAddress].address.toString())

        fields = { ...fields, from: from, rri: rri, token: token }
        setFields(fields => ({ ...fields, from: from, rri: rri, token: token}))

        const validAmount = validateAmount(fields.amount, token, props, setErrors)
        if (!validAmount) {
            validTransaction = false
        }

        const validTo = validateAddress(fields.to, props.wallet.network)
        if (!validTo) {
            setErrors(errors => ({ ...errors, to: "Invalid address" }))
            validTransaction = false
        }

        if (!validTransaction)
            return;

        const tmpFields = { ...fields, amount: new BigNumber(fields.amount).shiftedBy(18).toString() }
        let transactionResponse = await startNewTransaction(tmpFields)

        if (transactionResponse) {
            props.onNeedsToConfirmTransaction(fields, transactionResponse)
        }
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Send Funds</h1>
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                <div className="modal-form-column-centered">
                    <div className="centered-flex w-100">
                        <p className="info-password-title info-send-funds-title small no-margin">Token:</p>
                        <div className="info-content-wrapper w-100">
                            <select value={token} onChange={onSendTokenChange} className="input-password input-select-funds small">
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
                    <div className="centered-flex margin-t-1 w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">Amount:</p>
                        <div className="info-content-wrapper w-100">
                            {errors && errors.amount != "" && <p className="warn-save-title small no-margin">{errors.amount}</p>}
                            <input
                                className="input-password input-amount-funds small"
                                type="number"
                                min="0"
                                step="1"
                                onChange={handleInputChange}
                                name="amount"
                                placeholder={`Max: ${token == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && formatBigNumber(new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd.toString()).shiftedBy(-18)) || 0) :
                                    (props.wallet.selectedAddress < props.wallet.radixTokens.length && formatBigNumber(new BigNumber(props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].amount).shiftedBy(-18)))}`}></input>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1 w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">To:</p>
                        <div className="info-content-wrapper w-100">
                            {errors && errors.to != "" && <p className="warn-save-title small no-margin">{errors.to}</p>}
                            <input
                                onChange={handleInputChange}
                                name="to"
                                className="input-password input-to-funds small"
                                placeholder="rdx1qspvjmpptml8nay0jm5t2n35vyjpdtuhwz6ha2cg7yawpeyswtzf8ks5u4nzu"
                                type="text"></input>
                        </div>
                    </div>
                    <div className="info-content-actions">
                        <button className="button-normal darker-background" onClick={onStartNewTransaction}>
                            Next
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}