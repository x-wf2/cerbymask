import React from "react";
import { Menu } from "@styled-icons/evaicons-solid"
import { ReactComponent as Logo } from '../img/cerbymask-logo-128.svg'
import { Close } from "@styled-icons/evaicons-solid"
import '../css/Sidebar.css'

export interface IProps {
    onSidebarOpen: Function;
}

export interface IState {
    sidebarOpened: boolean;
}

export default class Navbar extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props)
        this.state = {
            sidebarOpened: false
        }
    }

    openSidebar() {
        this.setState(state => ({...state, sidebarOpened: true}))
        this.props.onSidebarOpen(true)
    }

    closeSidebar() {
        this.setState(state => ({...state, sidebarOpened: false}))
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
                <div className={`sidebar-container d-flex ${this.state.sidebarOpened ? 'opened' : ''}`}>
                    <Close className="sidebar-close" onClick={() => this.closeSidebar()} />
                </div>
            </header>
        )
    }
}