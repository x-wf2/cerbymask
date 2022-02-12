import { AccountT } from "@radixdlt/application"
import BigNumber from "bignumber.js"
import { useEffect, useState } from "react"
import { Wallet } from "../../../classes/wallet"
import "../../css/ChooseValidator.css"
import { SignedTransactionT, StakeT, UnsignedTransactionT, ValidatorT } from "../../types"
import { finalizeTransaction, getValidators, startNewStake } from "../../utils/background"
import { formatAddress, formatBigNumber, handleKeyDown, validateAmount } from "../../utils/formatters"
import { TYPE_SEND_FUNDS_CONFIRM, TYPE_STAKE_FUNDS_CONFIRM } from "../ShowModal"

export interface IProps {
    selectedValidator: ValidatorT,
    wallet: Wallet,
    stakeToConfirm: {fields: StakeT, reply: UnsignedTransactionT},
    onCancelStake: Function,
    onStakeFinish: Function
}

let counter: any
export function ConfirmStakeFunds(props: IProps) {
    let [error, setError] = useState("")
    let [count, setCount] = useState(8);
    let [finished, setFinished] = useState(false);

    let decrement = () => {
        if(finished) return clearTimer()
        if(count < 1) return onCancelStake()
        setCount(count => count-1)
        count--
    }

    useEffect(() => {
        if(!counter) {
            counter = setInterval(() => decrement(), 1000)
        }
    })

    function clearTimer() {
        window.clearInterval(counter)
        counter = undefined
        finished = true
        setFinished(true)
    }

    function onCancelStake() {
        clearTimer()
        props.onCancelStake(TYPE_STAKE_FUNDS_CONFIRM)
    }

    async function onSubmitStake() {
        clearTimer()
        const blob = props.stakeToConfirm.reply.payload_to_sign

        let currentAccount = props.wallet.radixPublicAddresses[props.wallet.selectedAddress] as AccountT
        const signed = currentAccount.sign({ hashOfBlobToSign: blob } as any, undefined)

        signed.forEach(async (item) => {
            let der = item.toDER();
            let pubKey = currentAccount.publicKey.__hex

            const transactionPayload = { unsigned_transaction: props.stakeToConfirm.reply.unsigned_transaction, pubKey: pubKey, bytes: der } as SignedTransactionT
            const transactionResponse = await finalizeTransaction(transactionPayload)
            if (transactionResponse)
                props.onStakeFinish(transactionResponse)
            else
                setError("Unable to finalize transaction")
        })
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Stake Funds</h1>
            {error && <p className="warn-save-title no-margin small">{error}</p>}
            {props.wallet && props.selectedValidator.properties.name != "" && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                <div className="modal-form-column-centered">
                    <div className="centered-flex w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">Name:</p>
                        <div className="info-content-wrapper w-100">
                            <input
                                disabled={true}
                                defaultValue={props.selectedValidator.properties.name}
                                className="input-password w-100 small"
                                type="string"></input>
                        </div>
                    </div>
                    <div className="centered-flex w-100 margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">Validator:</p>
                        <div className="info-content-wrapper w-100">
                            <input
                                disabled={true}
                                defaultValue={formatAddress(props.selectedValidator.validator_identifier.address)}
                                className="input-password w-100 small"
                                type="string"></input>
                        </div>
                    </div>
                    <div className="centered-flex-row w-100 margin-t-1 gap-m-1">
                        <div className="w-50">
                            <p className="info-password-title small info-send-funds-title no-margin">Validator Fee:</p>
                            <div className="info-content-wrapper">
                                <input
                                    disabled={true}
                                    defaultValue={`${props.selectedValidator.properties.validator_fee_percentage}%`}
                                    className="input-password small w-100"
                                    type="string"></input>
                            </div>
                        </div>
                        <div className="w-50">
                            <p className="info-password-title small info-send-funds-title no-margin">Uptime:</p>
                            <div className="info-content-wrapper">
                                <input
                                    disabled={true}
                                    defaultValue={`${props.selectedValidator.info.uptime.uptime_percentage}%`}
                                    className="input-password small w-100"
                                    type="string"></input>
                            </div>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1 w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">Amount:</p>
                        <div className="info-content-wrapper w-100">
                            <input
                                disabled
                                defaultValue={`${props.stakeToConfirm.fields.amount} XRD`}
                                className="input-password input-amount-funds small no-padding-x"
                                type="text"
                                name="amount"></input>
                        </div>
                    </div>
                    <div className="centered-flex-row justify-content-evenly gap-m-1 margin-t-1 w-100">
                        <div>
                            <p className="info-password-title small info-send-funds-title no-margin">Fee:</p>
                            <div className="info-content-wrapper">
                                <p className="info-password-title green-text small no-margin">{`${formatBigNumber(new BigNumber(props.stakeToConfirm.reply.fee.value).shiftedBy(-18))} XRD`}</p>
                            </div>
                        </div>
                        <div>
                            <p className="info-password-title small info-send-funds-title no-margin">Total:</p>
                            <div className="info-content-wrapper">
                                <p className="info-password-title green-text small no-margin">{`${new BigNumber(props.stakeToConfirm.fields.amount).shiftedBy(18).plus(props.stakeToConfirm.reply.fee.value).shiftedBy(-18)} XRD`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-content-actions d-flex justify-content-center gap-m-1 margin-t-09">
                        <button className="button-normal darker-background"  onClick={() => onCancelStake()}>
                            Cancel ({count})
                        </button>
                        <button className="button-normal darker-background" onClick={() => onSubmitStake()}>
                            Stake
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}