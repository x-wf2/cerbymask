import React from "react"
import { RadixT } from "@radixdlt/application"
import { Wallet } from "../../classes/wallet"

import "../css/ShowWallet.css"
import { formatAddress } from "../utils/formatters"

export default function ShowWallet(props: any) {

    return (
        <div className="full-height-container" style={{ width: "100%", overflowX: "auto", wordBreak: "break-all" }}>
            <div className="show-wallet-header">
                <select className="show-wallet-choose-address">
                    {props.wallet.radixPublicAddresses?.map((address: any, index: any) => {
                        return (<option selected={index == 0}>{formatAddress(address.address.toString())}</option>)
                    })}
                    <option value="">New Address...</option>
                </select>
                <p className="show-wallet-balance">8,2350 XRD</p>
                <p className="show-wallet-eq-balance">$5,34 USD</p>
            </div>
            <div className="show-wallet-main-actions">
                <div className="show-wallet-main-actions-buttons">
                    <button type="button" className="show-wallet-main-action-button">Buy</button>
                    <button type="button" className="show-wallet-main-action-button">Send</button>
                </div>
            </div>
            {/* <p>Current Wallet Addresses:</p> */}
            {/* { props.wallet.radixPublicAddresses?.map((address: any) => {
                return (<p>{address.address.toString()}</p>)
            })} */}
        </div>
    )
}