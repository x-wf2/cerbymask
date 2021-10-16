import React, { useState } from "react"
import { BigNumber } from "bignumber.js"
import { formatBigNumber } from "../../utils/formatters"

export default function SendFunds(props: any) {

    let [selected, setSelected] = useState(0)

    function onSendTokenChange(e: any) {
        let index = e.target.value
        setSelected(index)
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Send Funds</h1>
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                <div className="modal-form-column-centered">
                    {props.error && <p className="warn-save-title no-margin">{props.error}</p>}
                    <div className="centered-flex">
                        <p className="info-password-title info-send-funds-title small no-margin">Token:</p>
                        <div className="info-content-wrapper">
                            <select value={selected} onChange={onSendTokenChange} className="input-password input-select-funds w-100 small">
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
                        {selected > 0 && props.wallet.selectedAddress < props.wallet.radixTokens.length && props.wallet.radixTokens[props.wallet.selectedAddress].tokens[selected - 1].tokenInfo.symbol == "dgc" &&
                            <p className="show-wallet-eq-balance position-fix small" style={{ marginTop: "6px" }}>
                                {props.wallet.radixTokens[props.wallet.selectedAddress].tokens[selected - 1].tokenInfo.description}
                            </p>
                        }
                    </div>
                    <div className="centered-flex margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">Amount:</p>
                        <div className="info-content-wrapper">
                            <input className="input-password input-amount-funds w-100 small" type="number" min="0" step="1"
                                max={selected == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd?.value.toString()).shiftedBy(-18).toNumber() || 0) :
                                    (props.wallet.selectedAddress < props.wallet.radixTokens.length && new BigNumber(props.wallet.radixTokens[props.wallet.selectedAddress].tokens[selected - 1].amount).shiftedBy(-18).toNumber() || 0)}
                                placeholder={`Max: ${selected == 0 ? (props.wallet.selectedAddress < props.wallet.radixBalances.length && formatBigNumber(new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd?.value.toString()).shiftedBy(-18)) || 0) :
                                    (props.wallet.selectedAddress < props.wallet.radixTokens.length && formatBigNumber(new BigNumber(props.wallet.radixTokens[props.wallet.selectedAddress].tokens[selected - 1].amount).shiftedBy(-18)))}`}></input>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">To:</p>
                        <div className="info-content-wrapper">
                            <input className="input-password input-to-funds w-100 small" placeholder="rdx1qspvjmpptml8nay0jm5t2n35vyjpdtuhwz6ha2cg7yawpeyswtzf8ks5u4nzu" type="text"></input>
                        </div>
                    </div>
                    <div className="info-content-actions">
                        <button className="button-normal">
                            Next
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}