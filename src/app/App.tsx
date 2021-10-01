import React, { Component, ReactNode } from 'react';
import { LocalProvider, Provider } from '../providers/local';
import { Wallet } from '../classes/wallet';
import NoWalletsFound from './home/NoWalletsFound';
import GenerateWallet from './home/GenerateWallet';
import UnlockWallet from './home/UnlockWallet';
import ShowWallet from './home/ShowWallet';
import { generateWalletWithKeyAndMnemonic, saveWalletForLocalProvider } from './utils/utils';

import './css/App.css';
import cerbie from './img/cerbie.png';

interface IProps {
}

interface IState {
    wallet: Wallet;
    provider: Provider;

    loading: boolean;
    generating: boolean;

    onPasswordChange: Function;
    onCreateWallet: Function;
    onUnlockWallet: Function;
}

export default class App extends Component<IProps, IState> {

    constructor(props: any) {
        super(props)

        this.state = {
            wallet: new Wallet(),
            provider: new LocalProvider(),

            loading: true,
            generating: false,

            onPasswordChange: (event: any) => {this.setState((state) => ({ ...state, wallet: {...state.wallet, password: event.target.value} }))},
            onCreateWallet: () => {saveWalletForLocalProvider(this.state.wallet, this.state.provider)},
            onUnlockWallet: () => {this.setState((state) => ({ ...state, wallet: {...state.wallet, unlocked: true} }));console.log("Unlocking...")}
        }
    }

    async componentDidMount() {
        this.setState((state) => ({ ...state, loading: true }))

        let wallet = await this.state.provider.getWallet();
        this.setState((state) => ({ ...state, wallet: wallet, loading: false }))
    }

    async showGenerateWallet() {
        this.setState((state) => ({ ...state, generating: true }))

        let wallet = await generateWalletWithKeyAndMnemonic();
        this.setState((state) => ({ ...state, wallet: wallet }))
    }

    render(): ReactNode {
        return (
            <div className="App">
                <header className="App-header">
                    <img className="App-cerbie-logo" src={cerbie}></img>
                    <p className="App-title">
                        CerbiMask
                    </p>
                </header>
                <div className="App-body">
                    {this.state.loading &&
                        <p>Loading</p>
                    }
                    {!this.state.loading && this.state.wallet.key === undefined && !this.state.generating &&
                        <NoWalletsFound
                            generateWallet={() => this.showGenerateWallet()}>
                        </NoWalletsFound>
                    }
                    {this.state.generating &&
                        <GenerateWallet
                            wallet={this.state.wallet}
                            onPasswordChange={this.state.onPasswordChange}
                            onCreateWallet={this.state.onCreateWallet}>
                        </GenerateWallet>
                    }
                    {this.state.wallet.key !== undefined && !this.state.generating && this.state.wallet.unlocked === false &&
                        <UnlockWallet
                            wallet={this.state.wallet}
                            onPasswordChange={this.state.onPasswordChange}
                            onUnlockWallet={this.state.onUnlockWallet}>
                        </UnlockWallet>
                    }
                    {this.state.wallet.key !== undefined && this.state.wallet.unlocked === true &&
                        <ShowWallet
                            wallet={this.state.wallet}>
                        </ShowWallet>
                    }
                </div>
            </div>
        );
    }
}

