import React, { useState } from "react"
import { AmountT, RadixT } from "@radixdlt/application"
import { Wallet } from "../../classes/wallet"

import "../css/ShowWallet.css"
import { formatAddress, formatBalance } from "../utils/formatters"

export default function ShowWallet(props: any) {

    let [ selected, setSelected ] = useState(0)

    function onAddressChange(event: any) {
        setSelected(parseInt(event.target.value))
    }

    return (
        <div className="full-height-container" style={{ width: "100%", overflowX: "auto", wordBreak: "break-all" }}>
            <div className="show-wallet-header">
                <select onChange={onAddressChange} className="show-wallet-choose-address">
                    {props.wallet.radixPublicAddresses?.map((address: any, index: any) => {
                        return (<option value={index} selected={index == selected}>{formatAddress(address.address.toString())}</option>)
                    })}
                    <option value="">New Address...</option>
                </select>
                <p className="show-wallet-balance">
                    { !props.wallet.radixBalances && 0 }
                    { props.wallet.radixBalances && props.wallet.radixBalances[selected].xrd && formatBalance(props.wallet.radixBalances[selected].xrd?.value) }
                    { props.wallet.radixBalances && !props.wallet.radixBalances[selected].xrd && 0 }
                    &nbsp;XRD
                </p>
                <p className="show-wallet-eq-balance">
                    { !props.wallet.radixBalances && 0 }
                    ${ props.wallet.radixBalances && props.wallet.radixBalances[selected] && props.wallet.radixBalances[selected].balance }
                    &nbsp;USD
                </p>
            </div>
            <div className="show-wallet-main-actions">
                <div className="show-wallet-main-actions-buttons">
                    <button type="button" className="show-wallet-main-action-button">Buy</button>
                    <button type="button" className="show-wallet-main-action-button">Send</button>
                </div>
            </div>
        </div>
    )
}