import { useEffect, useState } from "react"
import "../../css/ChooseValidator.css"
import { ValidatorT } from "../../types"
import { getValidators } from "../../utils/background"
import { PuffLoader } from "react-spinners"

export function ChooseValidator(props: any) {
    
    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Choose Validator</h1>
            { props.promotedValidators.length == 0 &&
                <div className="loader-container d-flex justify-content-center">
                    <PuffLoader color="#003057"/>
                </div>
            }
            { props.promotedValidators.length > 0 &&
                <div className="modal-form-column-centered">
                    <div className="pill-nav h-100 w-100">
                        {props.promotedValidators && props.promotedValidators.map((validator: ValidatorT, index: number) => {
                            return (
                                <a className="small last" onClick={() => props.onChooseValidator(validator)} key={index} data-name={validator.address}>
                                    {validator.name} - {validator.validatorFee}% fee
                                </a>
                            )
                        })}
                        <a className="small last" data-name="4">Choose my own</a>
                    </div>
                </div>
            }
        </div>
    )
}