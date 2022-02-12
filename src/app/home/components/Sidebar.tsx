import React from "react";
import { Menu } from "@styled-icons/evaicons-solid"
import Logo from '../../img/cerbymask-logo.png'
import { Close } from "@styled-icons/evaicons-solid"
import '../../css/Sidebar.css'
import { Wallet } from "../../../classes/wallet";
import { TYPE_CONFIRM_CLEAR_WALLET, TYPE_REVEAL_SEED_PHRASE } from "../ShowModal";
import defs from "../../../../package.json"

export interface IProps {
    onSidebarOpen: Function;
    sidebarOpened: boolean;
    wallet: Wallet;
    showModal: Function;
}

export interface IState {
}

export default class Sidebar extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props)
    }

    closeSidebar() {
        this.props.onSidebarOpen(false)
    }

    render() {
        return (
            <div className={`sidebar-container h-100 d-flex ${this.props.sidebarOpened ? 'opened' : 'closed'}`}>
                <Close className="sidebar-close" onClick={() => this.closeSidebar()} />
                <div className="sidebar-options-container d-flex w-100">
                    <ul className="sidebar-options w-100">
                        {this.props.wallet.unlocked &&
                            <li onClick={() => { this.props.showModal(TYPE_REVEAL_SEED_PHRASE); this.closeSidebar() }}>Reveal Seed Phrase</li>
                        }
                        <li onClick={() => chrome.tabs.create({ url: "https://t.me/CerbyToken", active: true })}>Join Telegram</li>
                        {window.location.hash != '#window' &&
                            <li onClick={() => chrome.tabs.create({ 'url': 'index.html' }, () => { })}>Open in Browser</li>
                        }
                        {this.props.wallet.key != undefined &&
                            <li className="dark-red-text" onClick={() => { this.props.showModal(TYPE_CONFIRM_CLEAR_WALLET); this.closeSidebar() }}>Clear Wallet</li>
                        }
                        {
                            <li style={{ fontSize: "13px", cursor: "none" }} className="no-margin mild-blue-text">CerbyMask {defs.version}</li>
                        }
                    </ul>
                </div>
            </div>
        )
    }
}