import React, { useEffect, useState } from "react"
import BigNumber from "bignumber.js"
import { formatAddress, formatBigNumber, validateAddress } from "../../utils/formatters"
import { SignedTransactionT, TransactionFieldsT } from "../../types"
import { finalizeTransaction, startNewTransaction } from "../../utils/background"
import { AccountT, SignatureT } from "@radixdlt/application"

let INITIAL_COUNT = 8
let counter: any

export default function ConfirmSendFunds(props: any) {

    let [error, setError] = useState("")
    let [count, setCount] = useState(INITIAL_COUNT);
    let [finished, setFinished] = useState(false);

    let decrement = () => {
        if(finished) return clearTimer()
        if(count < 1) return onCancelTransaction()
        setCount(count => count-1)
        count--
    }

    function clearTimer() {
        window.clearInterval(counter)
        counter = undefined
        setFinished(true)
    }

    useEffect(() => {
        if(!counter) {
            count = INITIAL_COUNT
            setCount(INITIAL_COUNT)
            counter = setInterval(() => decrement(), 1000)
        }
    })

    function onCancelTransaction() {
        clearTimer()
        props.onDisapproveTransaction()
    }

    async function onSendTransaction() {
        clearTimer()
        const blob = props.confirmTransaction.transaction.blob
        const hashOfBlobToSign = props.confirmTransaction.transaction.hashOfBlobToSign

        let currentAccount = props.wallet.radixPublicAddresses[props.wallet.selectedAddress] as AccountT
        const signed = await currentAccount.sign(props.confirmTransaction.transaction, undefined)

        signed.forEach(async (item) => {
            let der = item.toDER();
            let pubKey = currentAccount.publicKey.__hex

            const transactionPayload = { blob: blob, publicKeyOfSigner: pubKey, signatureDER: der } as SignedTransactionT
            const transactionResponse = await finalizeTransaction(transactionPayload)
            if (transactionResponse)
                props.onTransactionFinish(transactionResponse)
            else
                setError("Unable to finalize transaction")
        })
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Confirm Send Funds</h1>
            {error && <p className="warn-save-title no-margin small">{error}</p>}
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                <div className="modal-form-column-centered">
                    <div className="centered-flex w-100">
                        <p className="info-password-title info-send-funds-title small no-margin">Token:</p>
                        <div className="info-content-wrapper w-100">
                            <select disabled className="input-password input-select-funds small">
                                {props.transaction.token == 0 &&
                                    <option>
                                        xrd
                                    </option>
                                }
                                {props.transaction.token > 0 &&
                                    <option>
                                        {props.wallet.radixTokens[props.wallet.selectedAddress].tokens[props.transaction.token - 1].tokenInfo.symbol}
                                    </option>
                                }

                            </select>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1 w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">Amount:</p>
                        <div className="info-content-wrapper w-100">
                            <input
                                disabled={true}
                                defaultValue={formatBigNumber(new BigNumber(props.transaction.amount))}
                                className="input-password input-amount-funds small"
                                type="number"
                                name="amount"></input>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1 w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">To:</p>
                        <div className="info-content-wrapper w-100">
                            <input
                                disabled={true}
                                defaultValue={formatAddress(props.transaction.to)}
                                name="to"
                                className="input-password input-to-funds small"
                                type="text"></input>
                        </div>
                    </div>
                    <div className="centered-flex-row justify-content-evenly gap-m-1 margin-t-1 w-100">
                        <div>
                            <p className="info-password-title small info-send-funds-title no-margin">Fee:</p>
                            <div className="info-content-wrapper">
                                <p className="info-password-title green-text small info-send-funds-title no-margin">{`${props.confirmTransaction.fee != "" ? formatBigNumber(new BigNumber(props.confirmTransaction.fee).shiftedBy(-18)) : ""} XRD`}</p>
                            </div>
                        </div>
                        <div>
                            <p className="info-password-title small info-send-funds-title no-margin">Total:</p>
                            <div className="info-content-wrapper">
                                <p className="info-password-title green-text small info-send-funds-title no-margin">{`${props.confirmTransaction.fee != "" ? formatBigNumber(new BigNumber(props.confirmTransaction.fee).shiftedBy(-18).plus(new BigNumber(props.transaction.amount))) : ""} XRD`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-content-actions d-flex justify-content-evenly gap-m-1">
                        <button className="button-normal darker-background" onClick={onCancelTransaction}>
                            Cancel ({count})
                        </button>
                        <button className="button-normal darker-background" onClick={onSendTransaction}>
                            Send
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}