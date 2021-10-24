import React from "react";
import { Menu } from "@styled-icons/evaicons-solid"
import { ReactComponent as Logo } from '../../img/cerbymask-logo-128.svg'
import { Close } from "@styled-icons/evaicons-solid"
import '../../css/Sidebar.css'
import { Wallet } from "../../../classes/wallet";

export interface IProps {
    onSidebarOpen: Function;
    sidebarOpened: boolean;
    wallet: Wallet;
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
                    <Logo className="logo-svg"/>
                </div>
                <div className="d-flex">
                    <Menu width="24px" onClick={() => this.openSidebar()} cursor="pointer" color="rgba(255, 255, 255, 0.9)"/>
                </div>
                <div className={`sidebar-container d-flex ${this.props.sidebarOpened ? 'opened' : ''}`}>
                    <Close className="sidebar-close" onClick={() => this.closeSidebar()} />
                </div>
            </header>
        )
    }
}