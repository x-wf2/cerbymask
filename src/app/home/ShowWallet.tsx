import React from "react"
import { RadixT } from "@radixdlt/application"
import { Wallet } from "../../classes/wallet"

export default function ShowWallet(props: any) {

    return (
        <div style={{ overflowX: "auto", wordBreak: "break-all" }}>
            <p>Current Wallet Addresses:</p>
            { props.wallet.radixPublicAddresses?.map((address: any) => {
                return (<p>{address.address.toString()}</p>)
            })}
        </div>
    )
}