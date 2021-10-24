import React, { useEffect, useState } from "react"
import BigNumber from "bignumber.js"
import { formatBigNumber, validateAddress } from "../../utils/formatters"
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

    function handleKeyDown(e: any) {
        const field = e.target.name;
        const futureAmount = `${fields.amount}${e.key}`

        if (field === "amount") {
            const currBalance = new BigNumber((token == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && props.wallet.radixBalances[props.wallet.selectedAddress].xrd.toString()) :
                (props.wallet.selectedAddress < props.wallet.radixTokens.length && props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].amount)))

            try {
                const parsedValue = parseFloat(futureAmount)
                if (currBalance.shiftedBy(-18).isLessThan(parsedValue) || parsedValue < 0 || futureAmount.indexOf("-") > -1) {
                    e.preventDefault()
                    return;
                }
            }
            catch (error) {
                e.preventDefault()
                return;
            }
        }
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

        const validAmount = validateAmount(fields.amount)
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

    function validateAmount(amount: string) {
        const currBalance = new BigNumber((token == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && props.wallet.radixBalances[props.wallet.selectedAddress].xrd.toString()) :
            (props.wallet.selectedAddress < props.wallet.radixTokens.length && props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].amount)))

        let parsedAmount = -1
        try {
            parsedAmount = parseFloat(amount)
        }
        catch (e) { return false }
        if (amount === "") {
            setErrors({ ...errors, amount: "Please insert an amount." })
            return false
        }
        else if (currBalance.shiftedBy(-18).isLessThan(parsedAmount)) {
            setErrors({ ...errors, amount: "Amount is higher than balance." })
            return false
        }
        else if (parsedAmount <= 0) {
            setErrors({ ...errors, amount: "Amount is invalid." })
            return false
        }
        return true
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Send Funds</h1>
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
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
                            {errors && errors.amount != "" && <p className="warn-save-title small no-margin">{errors.amount}</p>}
                            <input
                                className="input-password input-amount-funds w-100 small"
                                type="number"
                                min="0"
                                step="1"
                                onChange={handleInputChange}
                                onKeyPress={handleKeyDown}
                                name="amount"
                                placeholder={`Max: ${token == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && formatBigNumber(new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd.toString()).shiftedBy(-18)) || 0) :
                                    (props.wallet.selectedAddress < props.wallet.radixTokens.length && formatBigNumber(new BigNumber(props.wallet.radixTokens[props.wallet.selectedAddress].tokens[token - 1].amount).shiftedBy(-18)))}`}></input>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">To:</p>
                        <div className="info-content-wrapper">
                            {errors && errors.to != "" && <p className="warn-save-title small no-margin">{errors.to}</p>}
                            <input
                                onChange={handleInputChange}
                                name="to"
                                className="input-password input-to-funds w-100 small"
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