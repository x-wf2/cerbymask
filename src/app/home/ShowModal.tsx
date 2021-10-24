import React, { useEffect, useState } from "react"
import "../css/ShowWallet.css"
import { formatAddress, formatBalance, formatBigNumber } from "../utils/formatters"
import { XRD_RRI } from "../utils/utils"
import { Copy } from "@styled-icons/fa-regular"
import { Close } from "@styled-icons/evaicons-solid"
import ReactDOM from "react-dom";
import QRCode from "react-qr-code";
import SendFunds from "./modals/SendFunds"
import ConfirmSendFunds from "./modals/ConfirmSendFunds"

export const TYPE_RECEIVE_FUNDS = 1
export const TYPE_SEND_FUNDS = 2
export const TYPE_SEND_FUNDS_CONFIRM = 3
export const TYPE_STAKE_FUNDS = 4

export default function ShowModal(props: any) {

    let [initialTransaction, setInitialTransaction] = useState({})
    let [confirmTransaction, setConfirmTransaction] = useState({})

    function onDisapproveTransaction() {
        props.showModal(TYPE_SEND_FUNDS)
    }

    function onNeedsToConfirmTransaction(initialTransaction: any, transactionToConfirm: any) {
        setInitialTransaction(initialTransaction)
        setConfirmTransaction(transactionToConfirm)
        props.showModal(TYPE_SEND_FUNDS_CONFIRM)
    }

    function onTransactionFinish(response: any) {
        props.closeModal()
        let count = 0;
        let refresh = () => {
            props.refreshWalletInfo()
            count++
            if(count < 10)
                setTimeout(refresh, 4000)
        }
        setTimeout(refresh, 2000)
    }

    return (
        <div id="modal" className={`
            modal-form 
            ${props.showingModal ? '' : 'hidden'}
            ${props.showingForm == TYPE_SEND_FUNDS ? 'send-funds-top' : ''}
            ${props.showingForm == TYPE_SEND_FUNDS_CONFIRM ? 'send-funds-confirm-top' : ''}`}>

            <Close className="modal-close" onClick={() => {props.closeModal()}} />

            {props.showingForm == TYPE_RECEIVE_FUNDS &&
                <div className="modal-form-container">
                    <h1 className="normal-1">Receive Funds</h1>
                    {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                        <div className="modal-form-column-centered">
                            <QRCode className="modal-form-icon" size={90} value={props.wallet.radixPublicAddresses[props.wallet.selectedAddress].address.toString()} />
                            <h2>{props.wallet.radixPublicAddresses[props.wallet.selectedAddress].address.toString()}</h2>
                        </div>
                    }
                </div>
            }

            {props.showingForm == TYPE_SEND_FUNDS &&
                <SendFunds
                    wallet={props.wallet}
                    onNeedsToConfirmTransaction={onNeedsToConfirmTransaction}/>
            }

            {props.showingForm == TYPE_SEND_FUNDS_CONFIRM &&
                <ConfirmSendFunds
                    wallet={props.wallet}
                    transaction={initialTransaction}
                    confirmTransaction={confirmTransaction}
                    onTransactionFinish={onTransactionFinish}
                    onDisapproveTransaction={onDisapproveTransaction}/>
            }

            {props.showingForm == TYPE_STAKE_FUNDS &&
                <div className="modal-form-container">
                    <h1 className="normal-1">Stake Funds</h1>
                    {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                        <div className="modal-form-column-centered">
                        </div>
                    }
                </div>
            }
        </div>
    )
}