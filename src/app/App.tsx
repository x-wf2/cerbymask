import React, { Component, ReactNode } from 'react';
import { LocalProvider, Provider } from '../providers/local';
import { Wallet } from '../classes/wallet';
import NoWalletsFound from './home/NoWalletsFound';
import GenerateWallet from './home/GenerateWallet';
import UnlockWallet from './home/UnlockWallet';
import ShowWallet from './home/ShowWallet';
import { generateWalletWithKeyAndMnemonic, saveWalletForLocalProvider, unlockWallet } from './utils/utils';

import './css/App.css';
import cerbie from './img/cerbie.png';
import { AccountAddressT, AccountT, RadixT } from '@radixdlt/application';

interface IProps {
}

interface IState {
    wallet: Wallet;
    provider: Provider;
    radix: RadixT;
    error: string;

    loading: boolean;
    generating: boolean;

    onPasswordChange: Function;
    onCreateWallet: Function;
    onCompleteWallet: Function;
    onUnlockWallet: Function;
}

export default class App extends Component<IProps, IState> {

    constructor(props: any) {
        super(props)

        this.state = {
            wallet: new Wallet(),
            provider: new LocalProvider(),
            radix: {} as RadixT,
            error: "",

            loading: true,
            generating: false,

            onPasswordChange: (event: any) => { this.setState((state) => ({ ...state, wallet: { ...state.wallet, password: event.target.value } })) },
            onCreateWallet: () => { saveWalletForLocalProvider(this.state.wallet, this.state.provider) },
            onCompleteWallet: () => { this.setState((state) => ({ ...state, generating: false, wallet: { ...state.wallet, password: "" } })); this.refreshWallet() },
            onUnlockWallet: async () => {
                let radixWallet = await unlockWallet(this.state.wallet)
                let radixPublicAddresses: AccountT[] = []

                if (radixWallet) {
                    this.setState((state) => ({ ...state, wallet: { ...state.wallet, unlocked: true } }))
                    
                    radixWallet.observeAccounts().forEach((item) => item.all.forEach((address) => radixPublicAddresses.push(address)))
                    
                    this.setState((state) => ({ ...state, wallet: { 
                        ...state.wallet,
                        radixWallet: radixWallet,
                        radixPublicAddresses: radixPublicAddresses
                    } }))

                    let connect = await this.state.provider.connectWallet(this.state.wallet)
                    return
                }
                this.setState((state) => ({ ...state, error: "Unable to unlock wallet." }))
            }
        }
    }

    async componentDidMount() {
        this.refreshWallet()
    }

    async showGenerateWallet() {
        this.setState((state) => ({ ...state, generating: true }))

        let wallet = await generateWalletWithKeyAndMnemonic();
        this.setState((state) => ({ ...state, wallet: wallet }))
    }

    async refreshWallet() {
        this.setState((state) => ({ ...state, loading: true }))
        let wallet = await this.state.provider.getWallet();
        this.setState((state) => ({ ...state, wallet: wallet, loading: false }))
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
                            onCreateWallet={this.state.onCreateWallet}
                            onCompleteWallet={this.state.onCompleteWallet}>
                        </GenerateWallet>
                    }
                    {this.state.wallet.key !== undefined && !this.state.generating && this.state.wallet.unlocked === false &&
                        <UnlockWallet
                            wallet={this.state.wallet}
                            error={this.state.error}
                            onPasswordChange={this.state.onPasswordChange}
                            onUnlockWallet={this.state.onUnlockWallet}>
                        </UnlockWallet>
                    }
                    {this.state.wallet.key !== undefined && this.state.wallet.unlocked === true &&
                        <div>
                            <ShowWallet
                                wallet={this.state.wallet}>
                            </ShowWallet>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

