import React, { Component, ReactNode } from 'react';
import { LocalProvider, Provider } from '../providers/local';
import { Wallet, WalletBalanceT } from '../classes/wallet';
import NoWalletsFound from './home/NoWalletsFound';
import GenerateWallet from './home/GenerateWallet';
import UnlockWallet from './home/UnlockWallet';
import ShowWallet from './home/ShowWallet';
import ShowModal from './home/ShowModal';
import {
    generateWalletWithKeyAndMnemonic,
    getXRDUSDBalances,
    saveWalletForProvider,
    unlockWallet,
    getStakedPositions,
    getTokenBalances,
    monitorAddressesForProvider,
    setBackgroundNetwork
} from './utils/utils';

import './css/App.css';
import Fox from './img/fox-head.svg';
import { AccountT, WalletT as RadixWalletT } from '@radixdlt/application';
import ForgotPassword from './home/ForgotPassword';
import NetworkFactory, { NETWORKS } from '../factories/network';
import { Network } from '../classes/network';

interface ICerbieProps {
}

interface ICerbieState {
    wallet: Wallet;
    provider: Provider;
    error: string;

    loading: boolean;
    generating: boolean;
    resetting: boolean;
    showingModal: boolean;
    showingForm: number;

    onPasswordChange: Function;
    onMnemonicChange: Function;
    onAddressChange: Function;
    onCreateWallet: Function;
    onCompleteWallet: Function;
    onUnlockWallet: Function;
    onNetworkChange: Function;
}

export default class App extends Component<ICerbieProps, ICerbieState> {

    networkFactory = new NetworkFactory(([NETWORKS.MAINNET, NETWORKS.STOKENET]), NETWORKS.MAINNET);

    constructor(props: any) {
        super(props)

        const network = this.networkFactory.selectedNetwork
        setBackgroundNetwork(network as Network)
        this.state = {
            wallet: new Wallet(),
            provider: new LocalProvider(this.networkFactory),
            error: "",

            loading: true,
            generating: false,
            resetting: false,
            showingModal: false,
            showingForm: 0,

            onPasswordChange: (event: any) => { this.setState((state) => ({ ...state, wallet: { ...state.wallet, password: event.target.value } })) },
            onMnemonicChange: (mnemonic: string) => { let key = Wallet.newKeyWithMnemonic(mnemonic); this.setState((state) => ({ ...state, wallet: { ...state.wallet, key: ('phrase' in key.mnemonic ? key : undefined) } })); return ('phrase' in key.mnemonic) },
            onAddressChange: (index: number) => {
                return new Promise(async (resolve) => {
                    await this.state.provider.saveViewingAddress(index)
                    const isNewHigh = ((index + 1) > this.state.wallet.addresses)
                    this.setState((state) => ({
                        ...state, wallet: {
                            ...state.wallet,
                            addresses: (isNewHigh ? (index + 1) : state.wallet.addresses),
                            selectedAddress: (index)
                        }
                    }))

                    if (isNewHigh) {
                        let addresses = this.refreshWalletAddresses()
                        await monitorAddressesForProvider(addresses, this.state.provider)
                    }
                    resolve(true)
                    this.refreshWalletInfo()
                })
            },

            onCreateWallet: async () => {
                let radixWallet = await saveWalletForProvider(this.state.wallet, this.state.provider);
                this.setState((state) => ({ wallet: { ...state.wallet, radixWallet: radixWallet } }))
                this.state.provider.restoreViewingAddress()
                let addresses = this.refreshWalletAddresses()
                monitorAddressesForProvider(addresses, this.state.provider)
            },
            onCompleteWallet: () => { this.setState((state) => ({ ...state, generating: false, resetting: false, wallet: { ...state.wallet, password: "" } })); this.refreshWallet() },
            onUnlockWallet: async () => {
                let radixWallet: RadixWalletT
                try {
                    radixWallet = await unlockWallet(this.state.wallet, this.state.provider)
                }
                catch (e) {
                    this.setState((state) => ({ ...state, error: "Unable to unlock wallet" }))
                    return
                }
                this.setState((state) => ({ ...state, wallet: { ...state.wallet, radixWallet: radixWallet, unlocked: true } }))
                this.refreshWalletAddresses()
                await this.refreshWalletInfo()
            },
            onNetworkChange: async (e: any) => {
                const name = e.target.value
                const network = (await this.networkFactory.getNetwork(name))[0]
                this.networkFactory.setSelectedNetwork(network)
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
        this.setState((state) => ({ ...state, wallet: { ...wallet }, loading: false }))
    }

    async refreshWalletInfo() {
        let addresses = this.state.wallet.radixPublicAddresses

        let balances = await getXRDUSDBalances(addresses)
        let tokens = await getTokenBalances(addresses)
        let stakes = await getStakedPositions(addresses)

        this.state.wallet.radixBalances = balances
        this.state.wallet.radixStakes = stakes
        this.state.wallet.radixTokens = tokens

        console.log(this.state.wallet)
        this.setState((state) => ({
            ...state,
            wallet: {
                ...state.wallet,
                radixBalances: balances,
                radixStakes: stakes,
                radixTokens: tokens
            }
        }))
    }

    async showModal(type: number) {
        this.setState((state) => ({ ...state, showingModal: true, showingForm: type }))
    }

    async closeModal() {
        this.setState((state) => ({ ...state, showingModal: false }))
    }

    refreshWalletAddresses() {
        let radixPublicAddresses: AccountT[] = []
        let restored = this.state.wallet.radixWallet?.restoreLocalHDAccountsToIndex(this.state.wallet.addresses)
        restored?.forEach((item) => item.all.forEach((address) => radixPublicAddresses.push(address)))
        this.setState((state) => ({ ...state, wallet: { ...state.wallet, radixPublicAddresses: radixPublicAddresses } }))
        return radixPublicAddresses
    }

    render(): ReactNode {
        return (
            <div className="App">
                <header className="App-header darker-background">
                    <svg className="logo-svg" version="1.1" viewBox="0 0 554.4 649.6" xmlns="http://www.w3.org/2000/svg">
                        <path d="m273.53 531.63-1.2395-1-9.3067-28.8-4.6424-12-9.818-24-17.748-35.2-8.6508-14.4-15.06-22.4-13.001-16.784-19.226-19.216-13.574-10.574-11.2-7.2366-9.0585-4.8934-13.342-5.418-12.169-3.7597 20.169-13.528 9.6-7.622 9.7313-10.168 5.9613-8.9982 4.6761-11.49 1.8536-10.644-.44579-8.4502-.44578-8.4502-4.2296-17.567-5.4146-16.362-3.4264-8.6192-3.4264-8.6192-11.531-23.496-7.5372-13.304-4.8378-8-12.086-19.2-21.358-31.75.61216-.61215 17.504 13.176 11.2 8.674 24 20.062 23.2 20.715 16.8 15.328 26.449 26.408 9.6565 10.4 16.766 20 7.9794 11.2 2.9747 4.5356 2.9746 4.5356v1.1609l-8.4-7.896-12.975-9.8364-20.234-13.684-10.792-5.4178-12.287-4.9044-2.8566-.53589-2.8566-.53591v.93244l4.1268 9.2456 4.7217 12.8 1.1757 6.7048 1.1757 6.7048-.006 12.99-2.3936 14.758-4.6527 11.712-8.0522 13.994-6.7765 8.3356-8.7112 9.0411.89866 1.4541 14.094 8.5536 12.8 9.9316 12.087 11.02 15.664 17.105 8.6992 10.895 11.805 16.8 11.046 17.6 9.4292 16.8 6.1129 11.2 2.6527 5.2h13.131l10.79-19.6 14.435-24 7.9316-12 9.7475-13.6 14.579-17.6 15.89-16.128 13.6-10.775 18.4-12.278.42665-.1792-10.184-10.541-9.981-14.573-6.3921-13.64-2.0371-8.1431-2.0371-8.1431-.062-18.4 2.1096-8 2.1096-8 7.2467-17.467-.73833-.73832-7.6613 1.8785-11.368 4.6767-11.832 6.6356-8.8 5.7196-20.8 15.067-9.2 8.9784v-1.4415l11.966-17.817 21.136-25.491 40.099-39.849 18.279-16.151 22.521-19.81 25.818-20.99 9.3822-7.2772 10.8-7.6632v.76582l-27.647 41.375-8.2699 13.6-9.9886 17.6-6.2336 12-7.3055 16-4.6248 12-2.6501 8-2.6501 8-1.3152 4.4709-1.3152 4.4709-1.1951 7.9291-1.1951 7.9291-.005 5.9345-.005 5.9345 1.8287 10.531 5.3676 11.792 3.5177 4.9042 3.5177 4.9042 13.368 12.954 23.735 15.578-.40504.40505-.40504.40504-18.925 6.3179-14.174 7.2282-10.16 6.1725-12.466 9.3149-16.602 16.025-13.127 16-11.902 16-9.0454 14.4-11.38 20-15.733 32-3.6731 8.8-3.6731 8.8-5.4866 14.4-6.3764 19.2-3.4474 11.6h-2.8481l-1.2396-1zm-39.27-181.47-3.0032-.70782-7.7678-3.9362-13.046-12.273-9.6518-12.809.37408-.37406.37407-.37407 9.3241 2.0225 13.355 6.9654 9.2924 6.3104 4.9404 5.9936 1.3228 4.0254 1.3228 4.0253.36908 1 .36906 1-4.5712-.1608zm75.805-1.7315.52931-2.6.73607-2.8922.73608-2.8922 7.5964-7.1049 10.259-6.012 10.541-4.8537 8.6625-3.0491.27134.27135.27136.27134-12.746 16.847-8.8057 8.0479-7.4467 4.162-8.097 2.4046h-3.0367z" stroke-width=".8" />
                    </svg>
                    <p className="App-title gray-text">
                        CerbyMask
                    </p>
                </header>
                <ShowModal
                    wallet={this.state.wallet}
                    showingModal={this.state.showingModal}
                    showingForm={this.state.showingForm}
                    closeModal={() => this.closeModal()} />
                <div className={`App-body ${this.state.showingModal ? 'blur' : ''}`}>
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
                            networks={this.networkFactory.networks}
                            error={this.state.error}
                            forgotPassword={() => this.showForgotPassword()}
                            onPasswordChange={this.state.onPasswordChange}
                            onUnlockWallet={this.state.onUnlockWallet}
                            onNetworkChange={this.state.onNetworkChange}>
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
                            wallet={this.state.wallet}
                            onAddressChange={this.state.onAddressChange}
                            showModal={(type: number) => this.showModal(type)}
                            closeModal={() => this.closeModal()}>
                        </ShowWallet>
                    }
                </div>
            </div>
        );
    }
}

