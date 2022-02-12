import React from "react";
import { Menu } from "@styled-icons/evaicons-solid"
import Logo from '../../img/cerbymask-logo.png'
import { Close } from "@styled-icons/evaicons-solid"
import '../../css/Sidebar.css'
import { Wallet } from "../../../classes/wallet";
import { TYPE_CONFIRM_CLEAR_WALLET, TYPE_REVEAL_SEED_PHRASE } from "../ShowModal";

export interface IProps {
    onSidebarOpen: Function;
    sidebarOpened: boolean;
    wallet: Wallet;
    showModal: Function;
}

export interface IState {
}

export default class Navbar extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props)
    }

    openSidebar() {
        this.props.onSidebarOpen(true)
    }

    closeSidebar() {
        this.props.onSidebarOpen(false)
    }

    render() {
        return (
            <header className="App-header darker-background">
                <div className="d-flex">
                    <img src={Logo} className="logo-svg" />
                </div>
                <div className="d-flex">
                    <Menu width="24px" onClick={() => this.openSidebar()} cursor="pointer" color="rgba(255, 255, 255, 0.9)" />
                </div>
                <div className={`sidebar-container d-flex ${this.props.sidebarOpened ? 'opened' : ''}`}>
                    <Close className="sidebar-close" onClick={() => this.closeSidebar()} />
                    <div className="sidebar-options-container d-flex w-100">
                        <ul className="sidebar-options w-100">
                            {this.props.wallet.unlocked &&
                                <li onClick={() => { this.props.showModal(TYPE_REVEAL_SEED_PHRASE); this.closeSidebar() }}>Reveal Seed Phrase</li>
                            }
                            <li onClick={() => chrome.tabs.create({ url: "https://t.me/CerbyToken", active: true })}>Join Telegram</li>
                            {this.props.wallet.key != undefined &&
                                <li className="dark-red-text" onClick={() => { this.props.showModal(TYPE_CONFIRM_CLEAR_WALLET); this.closeSidebar() }}>Clear Wallet</li>
                            }
                        </ul>
                    </div>
                </div>
            </header>
        )
    }
}