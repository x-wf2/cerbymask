export type RequestT = Readonly<{
    title: string,
    data: object
}>

export type TransactionFieldsT = Readonly<{
    from: string;
    to: string;
    amount: string;
    rri: string;
    token: number; //index of token in users token list
}>

export type SignedTransactionT = Readonly<{
    blob: string;
    publicKeyOfSigner: string;
    signatureDER: string;
}>

export type ValidatorT = Readonly<{
    address: string;
    infoURL: string;
    isExternalStakeAccepted: boolean;
    name: string;
    ownerAddress: string;
    ownerDelegation: string;
    proposalsCompleted: string;
    proposalsMissed: string;
    registered: boolean;
    totalDelegatedStake: string;
    uptimePercentage: string;
    validatorFee: string;
}>

export type PromotedValidatorT = Readonly<{
    address: string;
}>
