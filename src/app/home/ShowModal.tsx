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
import { ChooseValidator } from "./modals/ChooseValidator"
import { StakeT, ValidatorT } from "../types"
import { ChooseStakeInputs } from "./modals/ChooseStakeInputs"
import { ConfirmStakeInputs } from "./modals/ConfirmStakeInputs"
import { RevealSeedPhrase } from "./modals/RevealSeedPhrase"
import { ConfirmClearWallet } from "./modals/ConfirmClearWallet"

export const TYPE_RECEIVE_FUNDS = 1

export const TYPE_SEND_FUNDS            = 2
export const TYPE_SEND_FUNDS_CONFIRM    = 3

export const TYPE_STAKE_FUNDS           = 4
export const TYPE_STAKE_FUNDS_CONFIRM   = 5
export const TYPE_STAKE_FUNDS_CONFIRM_2 = 6

export const TYPE_REVEAL_SEED_PHRASE    = 7
export const TYPE_CONFIRM_CLEAR_WALLET  = 8

export default function ShowModal(props: any) {

    let [initialTransaction, setInitialTransaction] = useState({})
    let [confirmTransaction, setConfirmTransaction] = useState({})
    
    let [selectedValidator, setSelectedValidator] = useState({ name: "", address: "" } as ValidatorT)
    let [confirmStake, setConfirmStake] = useState({fields: {} as StakeT, reply: {}})

    function onDisapproveTransaction() {
        props.showModal(TYPE_SEND_FUNDS)
    }

    function onCancelStake(backTo=TYPE_STAKE_FUNDS) {
        props.showModal(backTo)
    }

    function onNeedsToConfirmTransaction(initialTransaction: any, transactionToConfirm: any) {
        setInitialTransaction(initialTransaction)
        setConfirmTransaction(transactionToConfirm)
        props.showModal(TYPE_SEND_FUNDS_CONFIRM)
    }

    function onNeedsToConfirmStake(stakeFields: StakeT, stakeReply: any) {
        setConfirmStake({fields: stakeFields, reply: stakeReply})
        props.showModal(TYPE_STAKE_FUNDS_CONFIRM_2)
    }

    function onTransactionFinish(response: any) {
        props.closeModal()
        let count = 0;
        let refresh = () => {
            props.refreshWalletInfo()
            count++
            if (count < 10)
                setTimeout(refresh, 4000)
        }
        setTimeout(refresh, 2000)
    }

    function onStakeFinish(response: any) {
        onTransactionFinish(response)
    }

    function onChooseValidator(validator: ValidatorT) {
        setSelectedValidator(validator)
        console.log(validator)
        props.showModal(TYPE_STAKE_FUNDS_CONFIRM)
    }

    return (
        <div id="modal" className={`
            modal-form 
            ${props.showingModal ? '' : 'hidden'}
            ${props.showingForm == TYPE_SEND_FUNDS ? 'send-funds-top' : ''}
            ${props.showingForm == TYPE_SEND_FUNDS_CONFIRM ? 'send-funds-confirm-top' : ''}

            ${props.showingForm == TYPE_STAKE_FUNDS && props.promotedValidators.length > 3 ? 'choose-validator-top' : ''}
            ${props.showingForm == TYPE_STAKE_FUNDS_CONFIRM ? 'choose-validator-confirm-top' : ''}
            ${props.showingForm == TYPE_STAKE_FUNDS_CONFIRM_2 ? 'choose-validator-confirm-2-top' : ''}
            ${props.showingForm == TYPE_CONFIRM_CLEAR_WALLET ? 'confirm-clear-wallet-top' : ''}`}>

            {props.showingForm !== TYPE_SEND_FUNDS_CONFIRM &&
                <Close className="modal-close" onClick={() => { props.closeModal() }} />
            }
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
                    onNeedsToConfirmTransaction={onNeedsToConfirmTransaction} />
            }

            {props.showingForm == TYPE_SEND_FUNDS_CONFIRM &&
                <ConfirmSendFunds
                    wallet={props.wallet}
                    transaction={initialTransaction}
                    confirmTransaction={confirmTransaction}
                    onTransactionFinish={onTransactionFinish}
                    onDisapproveTransaction={onDisapproveTransaction} />
            }

            {props.showingForm == TYPE_STAKE_FUNDS &&
                <ChooseValidator
                    promotedValidators={props.promotedValidators}
                    onChooseValidator={onChooseValidator}
                    wallet={props.wallet} />
            }

            {props.showingForm == TYPE_STAKE_FUNDS_CONFIRM &&
                <ChooseStakeInputs
                    onCancelStake={onCancelStake}
                    onNeedsToConfirmStake={onNeedsToConfirmStake}
                    selectedValidator={selectedValidator}
                    wallet={props.wallet} />
            }

            {props.showingForm == TYPE_STAKE_FUNDS_CONFIRM_2 &&
                <ConfirmStakeInputs
                    stakeToConfirm={confirmStake}
                    selectedValidator={selectedValidator}
                    wallet={props.wallet}
                    onCancelStake={onCancelStake}
                    onStakeFinish={onStakeFinish}/>
            }

            {props.showingForm == TYPE_REVEAL_SEED_PHRASE &&
                <RevealSeedPhrase
                    wallet={props.wallet}>
                </RevealSeedPhrase>
            }
            {props.showingForm == TYPE_CONFIRM_CLEAR_WALLET &&
                <ConfirmClearWallet
                    wallet={props.wallet}
                    onCancel={() => props.closeModal()}
                    onConfirm={() => props.onClearWallet()}>
                </ConfirmClearWallet>
            }
        </div>
    )
}