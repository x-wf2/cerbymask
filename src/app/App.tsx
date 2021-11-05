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
import { AccountT, WalletT as RadixWalletT } from '@radixdlt/application';
import ForgotPassword from './home/ForgotPassword';
import NetworkFactory, { NETWORKS } from '../factories/network';
import { Network } from '../classes/network';
import Navbar from './home/components/Navbar';
import { PromotedValidatorT, ValidatorT } from './types';
import { getPromotedValidators, getValidators } from './utils/background';

interface ICerbieProps {
}

interface ICerbieState {
    wallet: Wallet;
    provider: Provider;
    error: string;

    loading: boolean;
    generating: boolean;
    resetting: boolean;
    showingSidebar: boolean;
    showingModal: boolean;
    showingForm: number;
    promotedValidators: PromotedValidatorT[];

    onPasswordChange: Function;
    onMnemonicChange: Function;
    onAddressChange: Function;
    onCreateWallet: Function;
    onCompleteWallet: Function;
    onUnlockWallet: Function;
    onNetworkChange: Function;
    onSidebarOpen: Function;
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
            showingSidebar: false,
            showingForm: 0,
            promotedValidators: [],

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
                await this.networkFactory.setSelectedNetwork(network)
                await setBackgroundNetwork(network)
                this.refreshValidators()
            },
            onSidebarOpen: (opened: boolean) => {
                this.setState(state => ({...state, showingSidebar: opened}))
            }
        }
    }

    async componentDidMount() {
        const network = (await this.networkFactory.getNetwork("MAINNET"))[0]
        await setBackgroundNetwork(network)
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
        this.state.wallet.network = this.networkFactory.selectedNetwork

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

    async refreshValidators() {
        let radixValidators = (await getValidators(200)).validators as ValidatorT[]
        let promotedValidators = (radixValidators)
        this.setState((state) => ({ ...state, promotedValidators: promotedValidators }))
    }

    onAppBodyClick() {
        if(this.state.showingSidebar)
            this.setState(state => ({...state, showingSidebar: false}))
    }

    render(): ReactNode {
        return (
            <div className="App">
                <Navbar
                    wallet={this.state.wallet}
                    sidebarOpened={this.state.showingSidebar}
                    onSidebarOpen={(opened: any) => this.state.onSidebarOpen(opened)}/>
                <ShowModal
                    wallet={this.state.wallet}
                    showingModal={this.state.showingModal}
                    showingForm={this.state.showingForm}
                    promotedValidators={this.state.promotedValidators}
                    closeModal={() => this.closeModal()}
                    showModal={(type: number) => this.showModal(type)}
                    refreshWalletInfo={() => this.refreshWalletInfo()}/>
                <div
                    onClick={() => this.onAppBodyClick()} 
                    className={`App-body ${(this.state.showingModal || this.state.showingSidebar) ? 'blur' : ''}`}>
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
                            refreshValidators={() => this.refreshValidators()}
                            showModal={(type: number) => this.showModal(type)}
                            closeModal={() => this.closeModal()}>
                        </ShowWallet>
                    }
                </div>
            </div>
        );
    }
}

