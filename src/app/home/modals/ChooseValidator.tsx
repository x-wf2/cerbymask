import { useEffect, useState } from "react"
import "../../css/ChooseValidator.css"
import { ValidatorT } from "../../types"
import { getValidators } from "../../utils/background"

export function ChooseValidator(props: any) {
    
    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Choose Validator</h1>
            {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                <div className="modal-form-column-centered">
                    <div className="pill-nav w-100">
                        {props.promotedValidators && props.promotedValidators.map((validator: ValidatorT, index: number) => {
                            return (
                                <a className="small last" key={index} data-name={validator.address}>{validator.name}</a>
                            )
                        })}
                        <a className="small last" data-name="4">Choose my own</a>
                    </div>
                </div>
            }
        </div>
    )
}