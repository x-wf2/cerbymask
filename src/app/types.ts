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
    unsigned_transaction: string;
    pubKey: string;
    bytes: string;
}>

export type UnsignedTransactionT = Readonly<{
    fee: {value: string, token_identifier: { rri: string }};
    payload_to_sign: string;
    unsigned_transaction: string;
}>

export type ValidatorT = Readonly<{
    info: {
        owner_stake: {
            value: string,
            token_identifier: {
                rri: string
            }
        },
        uptime: {
            epoch_range: {
                from: number,
                to: number
            }
            from: number
            to: number
            proposals_completed: number
            proposals_missed: number
            uptime_percentage: string
        },
    },
    properties: {
        external_stake_accepted: boolean,
        name: string
        owner_account_identifier: {
            address: string
        },
        registered: boolean,
        url: string
        validator_fee_percentage: string
    },
    stake: {
        token_identifier: {
            rri: string
        }
        rri: string
        value: string
    },
    validator_identifier: {
        address: string
    }
}>

export type PromotedValidatorT = ValidatorT;

export type StakeT = Readonly<{
    from: string,
    validator: string,
    amount: string,
}>
