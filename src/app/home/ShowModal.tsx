import React, { useState } from "react"
import "../css/ShowWallet.css"
import { formatAddress, formatBalance } from "../utils/formatters"
import { Copy } from "@styled-icons/fa-regular"
import { Close } from "@styled-icons/evaicons-solid"
import ReactDOM from "react-dom";
import QRCode from "react-qr-code";

export const TYPE_RECEIVE_FUNDS = 1
export const TYPE_SEND_FUNDS = 2
export const TYPE_STAKE_FUNDS = 3

export default function ShowModal(props: any) {

    return (
        <div id="modal" className={`modal-form ${props.showingModal ? '' : 'hidden'} ${props.showingForm == TYPE_SEND_FUNDS ? 'send-funds-top' : ''}`}>
            <Close className="modal-close" onClick={() => props.closeModal()} />

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
                <div className="modal-form-container">
                    <h1 className="normal-1">Send Funds</h1>
                    {props.wallet && props.wallet.selectedAddress < props.wallet.radixPublicAddresses.length &&
                        <div className="modal-form-column-centered">
                            {props.error && <p className="warn-save-title no-margin">{props.error}</p>}
                            <div className="centered-flex">
                                <p className="info-password-title small no-margin">Token:</p>
                                <div className="info-content-wrapper">
                                    <input className="input-password w-100 small" type="text"></input>
                                </div>
                            </div>
                            <div className="centered-flex margin-t-1">
                                <p className="info-password-title small no-margin">Amount:</p>
                                <div className="info-content-wrapper">
                                    <input className="input-password w-100 small" type="text"></input>
                                </div>
                            </div>
                            <div className="centered-flex margin-t-1">
                                <p className="info-password-title small no-margin">To:</p>
                                <div className="info-content-wrapper">
                                    <input className="input-password w-100 small" type="text"></input>
                                </div>
                            </div>
                            <div className="info-content-actions">
                                <button className="button-normal">
                                    Next
                                </button>
                            </div>
                        </div>
                    }
                </div>
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