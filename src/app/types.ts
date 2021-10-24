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