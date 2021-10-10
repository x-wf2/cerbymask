import React, { useState } from "react"
import "../css/ShowWallet.css"
import { formatAddress, formatBalance } from "../utils/formatters"
import { Copy } from "@styled-icons/fa-regular"

export function WalletChart(props: any) {
    return (
        <div className="show-wallet-chart-container" style={{ width: (props.full ? "100%" : "") }}>
            {props.icon && props.icon}
            <p className="show-wallet-chart-title">
                {props.title && props.title}
            </p>
            <p className={`show-wallet-eq-balance position-fix ${props.full ? "medium green-text" : "small"}`}>
                {props.value} XRD
            </p>
            {props.full &&
                <p className={`show-wallet-eq-balance position-fix ${props.full ? "small" : ""}`} style={{ marginTop: "6px" }}>
                    {props.value2 && `$${props.value2}`}
                    {!props.value2 && `$0`}
                    &nbsp;USD
                </p>
            }
        </div>
    )
}

export default function ShowWallet(props: any) {

    let [selected, setSelected] = useState(props.wallet.selectedAddress)

    async function onAddressChange(event: any) {
        let selected = parseInt(event.target.value)
        await props.onAddressChange(selected)
        console.log("selected")
        console.log(selected)
        console.log("wallet")
        console.log(props.wallet)
        setSelected(selected)
    }

    return (
        <div className="full-height-container" style={{ width: "100%", overflowX: "auto", wordBreak: "break-all" }}>
            <div className="show-wallet-header">
                <div className="show-wallet-choose-address-container">
                    <select onChange={onAddressChange} className="show-wallet-choose-address">
                        {props.wallet.radixPublicAddresses?.map((address: any, index: any) => {
                            return (<option value={index} selected={index == selected}>{index + 1}. {formatAddress(address.address.toString())}</option>)
                        })}
                        <option value={props.wallet.radixPublicAddresses && props.wallet.radixPublicAddresses.length}>New Address...</option>
                    </select>
                    <Copy className="show-wallet-choose-address-copy" width="12px"/>
                </div>
                <p className="show-wallet-balance">
                    {(props.wallet.radixBalances.length == 0 || selected > (props.wallet.radixBalances.length-1)) && `0`}
                    {props.wallet.radixBalances.length > 0 && selected <= (props.wallet.radixBalances.length-1) && props.wallet.radixBalances[selected].xrd != undefined && formatBalance(props.wallet.radixBalances[selected].xrd?.value)}
                    &nbsp;XRD
                </p>
                <p className="show-wallet-eq-balance">
                    {(props.wallet.radixBalances.length == 0 || selected > (props.wallet.radixBalances.length-1)) && `$0`}
                    {props.wallet.radixBalances.length > 0 && selected <= (props.wallet.radixBalances.length-1) && props.wallet.radixBalances[selected] && `$${props.wallet.radixBalances[selected].balance}`}
                    &nbsp;USD
                </p>
            </div>
            <div className="show-wallet-main-actions">
                <div className="show-wallet-main-actions-buttons">
                    <button type="button" className="show-wallet-main-action-button">Receive</button>
                    <button type="button" className="show-wallet-main-action-button">Send</button>
                </div>
            </div>
            <div className="show-wallet-charts">
                <WalletChart title="Initial" value={"-"} />
                <WalletChart title="Rewards" value={"-"} />
                <WalletChart title="Unstaking" value={"-"} />

                {/* Staked */}
                {selected <= (props.wallet.radixBalances.length-1) && props.wallet.radixStakes.length > 0 &&
                    <WalletChart
                        title="Staked"
                        value={props.wallet.radixStakes[selected].staked}
                        value2={props.wallet.radixStakes[selected].balance}
                        full={true} />}
                {(selected > (props.wallet.radixBalances.length-1) || props.wallet.radixStakes.length == 0) &&
                    <WalletChart
                        title="Staked"
                        value={0} full={true} />}
            </div>
        </div>
    )
}