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
import { AccountAddressT, AccountT, RadixT, MnemomicT, WalletT as RadixWalletT } from '@radixdlt/application';
import ForgotPassword from './home/ForgotPassword';
import Key from '../classes/key';

interface IProps {
}

interface IState {
    wallet: Wallet;
    provider: Provider;
    radix: RadixT;
    error: string;

    loading: boolean;
    generating: boolean;
    resetting: boolean;

    onPasswordChange: Function;
    onMnemonicChange: Function;
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
            resetting: false,

            onPasswordChange: (event: any) => { this.setState((state) => ({ ...state, wallet: { ...state.wallet, password: event.target.value } })) },
            onMnemonicChange: (mnemonic: string) => { let key = Wallet.newKeyWithMnemonic(mnemonic); this.setState((state) => ({ ...state, wallet: { ...state.wallet, key: ('phrase' in key.mnemonic ? key : undefined) } })); return ('phrase' in key.mnemonic) },

            onCreateWallet: () => { saveWalletForLocalProvider(this.state.wallet, this.state.provider) },
            onCompleteWallet: () => { this.setState((state) => ({ ...state, generating: false, resetting: false, wallet: { ...state.wallet, password: "" } })); this.refreshWallet() },

            onUnlockWallet: async () => {
                let radixWallet: RadixWalletT
                let radixPublicAddresses: AccountT[] = []
                try {
                    radixWallet = await unlockWallet(this.state.wallet)
                }
                catch (e) {
                    this.setState((state) => ({ ...state, error: "Unable to unlock wallet" }))
                    return
                }
                this.setState((state) => ({ ...state, wallet: { ...state.wallet, unlocked: true } }))
                radixWallet.observeAccounts().forEach((item) => item.all.forEach((address) => radixPublicAddresses.push(address)))
                this.setState((state) => ({
                    ...state, wallet: {
                        ...state.wallet,
                        radixWallet: radixWallet,
                        radixPublicAddresses: radixPublicAddresses
                    }
                }))
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

    async showForgotPassword() {
        this.setState((state) => ({ ...state, resetting: true }))
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
                    {!this.state.loading && this.state.wallet.key === undefined && !this.state.generating && !this.state.resetting &&
                        <NoWalletsFound
                            generateWallet={() => this.showGenerateWallet()}
                            forgotPassword={() => this.showForgotPassword()}>
                        </NoWalletsFound>
                    }
                    {this.state.wallet.key !== undefined && !this.state.generating && !this.state.resetting && !this.state.wallet.unlocked &&
                        <UnlockWallet
                            wallet={this.state.wallet}
                            error={this.state.error}
                            forgotPassword={() => this.showForgotPassword()}
                            onPasswordChange={this.state.onPasswordChange}
                            onUnlockWallet={this.state.onUnlockWallet}>
                        </UnlockWallet>
                    }
                    {this.state.generating &&
                        <GenerateWallet
                            wallet={this.state.wallet}
                            onPasswordChange={this.state.onPasswordChange}
                            onCreateWallet={this.state.onCreateWallet}
                            onCompleteWallet={this.state.onCompleteWallet}>
                        </GenerateWallet>
                    }
                    {this.state.resetting &&
                        <ForgotPassword
                            wallet={this.state.wallet}
                            onMnemonicChange={this.state.onMnemonicChange}
                            onPasswordChange={this.state.onPasswordChange}
                            onCreateWallet={this.state.onCreateWallet}
                            onCompleteWallet={this.state.onCompleteWallet}>
                        </ForgotPassword>
                    }
                    {this.state.wallet.unlocked &&
                        <ShowWallet
                            wallet={this.state.wallet}>
                        </ShowWallet>
                    }
                </div>
            </div>
        );
    }
}

