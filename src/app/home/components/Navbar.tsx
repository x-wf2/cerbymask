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
            </header>
        )
    }
}