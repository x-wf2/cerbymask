import BigNumber from "bignumber.js"
import { useEffect, useState } from "react"
import { Wallet } from "../../../classes/wallet"
import "../../css/ChooseValidator.css"
import { StakeT, ValidatorT } from "../../types"
import { getValidators, startNewStake } from "../../utils/background"
import { formatAddress, formatBigNumber, handleKeyDown, validateAmount } from "../../utils/formatters"


export interface IProps {
    onNeedsToConfirmStake: Function,
    onCancelStake: Function,
    selectedValidator: ValidatorT,
    wallet: Wallet,
}

export function StakeFunds(props: IProps) {
    let [fields, setFields] = useState({} as StakeT)
    let [errors, setErrors] = useState({} as StakeT)

    function handleInputChange(e: any) {
        const field = e.target.name;
        const value = e.target.value;

        setFields({ ...fields, [field]: value })
        setErrors({ ...errors, [field]: "" })
    }

    async function submitNewStake() {
        let validTransaction = true
        const validAmount = validateAmount(fields.amount, 0, props, setErrors, 90)

        if (!validAmount) {
            validTransaction = false
        }

        if(validTransaction) {
            let from = (props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length && props.wallet.radixPublicAddresses[props.wallet.selectedAddress].address.toString())
    
            let tmpFields = { ...fields,
                from: from,
                rri: props.wallet.network?.xrd_rri,
                to: props.selectedValidator.validator_identifier.address,
                amount: new BigNumber(fields.amount).shiftedBy(18).toString(),
            } as StakeT

            let transactionResponse = await startNewStake(tmpFields)
            tmpFields = { ...tmpFields, amount: fields.amount }

            if(transactionResponse) {
                props.onNeedsToConfirmStake(tmpFields, transactionResponse)
            }
        }
    }

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Stake Funds</h1>
            {props.wallet && props.selectedValidator.properties.name != "" && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                <div className="modal-form-column-centered">
                    <div className="centered-flex w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">Name:</p>
                        <div className="info-content-wrapper w-100">
                            <input
                                disabled={true}
                                defaultValue={props.selectedValidator.properties.name}
                                className="input-password w-100 small"
                                type="string"
                                name="amount"></input>
                        </div>
                    </div>
                    <div className="centered-flex w-100 margin-t-1">
                        <p className="info-password-title small info-send-funds-title no-margin">Validator:</p>
                        <div className="info-content-wrapper w-100">
                            {errors && errors.validator != "" && <p className="warn-save-title small no-margin">{errors.validator}</p>}
                            <input
                                disabled={true}
                                defaultValue={formatAddress(props.selectedValidator.validator_identifier.address)}
                                className="input-password w-100 small"
                                type="string"
                                name="amount"></input>
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
                                    type="string"
                                    name="amount"></input>
                            </div>
                        </div>
                        <div className="w-50">
                            <p className="info-password-title small info-send-funds-title no-margin">Uptime:</p>
                            <div className="info-content-wrapper">
                                <input
                                    disabled={true}
                                    defaultValue={`${props.selectedValidator.info.uptime.uptime_percentage}%`}
                                    className="input-password small w-100"
                                    type="string"
                                    name="amount"></input>
                            </div>
                        </div>
                    </div>
                    <div className="centered-flex margin-t-1 w-100">
                        <p className="info-password-title small info-send-funds-title no-margin">Amount:</p>
                        <div className="info-content-wrapper w-100">
                            {errors && errors.amount != "" && <p className="warn-save-title small no-margin">{errors.amount}</p>}
                            <input
                                className="input-password input-amount-funds small"
                                type="number"
                                min="90"
                                step="1"
                                onChange={handleInputChange}
                                // onKeyPress={(e) => handleKeyDown(e, fields.amount, token, props)}
                                name="amount"
                                placeholder={`Max: ${props.wallet.selectedAddress < props.wallet.radixBalances.length && formatBigNumber(new BigNumber(props.wallet.radixBalances[props.wallet.selectedAddress].xrd.toString()).shiftedBy(-18)) || 0}`}></input>
                        </div>
                    </div>
                    <div className="info-content-actions d-flex justify-content-center gap-m-1">
                        <button className="button-normal darker-background" onClick={() => props.onCancelStake()}>
                            Back
                        </button>
                        <button className="button-normal darker-background" onClick={() => submitNewStake()}>
                            Next
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}