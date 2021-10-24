import { AmountT } from '@radixdlt/application'
import BigNumber from 'bignumber.js'
import { Network } from '../../classes/network'

BigNumber.set({
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
    EXPONENTIAL_AT: [-30, 30]
})

export function validateAddress(address: string, network: Network) {
    if(network.name === "MAINNET" && address.startsWith("rdx"))
        return true
    else if(network.name === "STOKENET" && address.startsWith("tdx"))
        return true
    else
        return false
}

export function formatAddress(address: string) {
    return `${address.substring(0, 3)}..${address.substring(address.length - 20)}`
}

export const formatBalance = (amount: AmountT, showFull = false): string => {
    if(amount) {
        const bigNumber = new BigNumber(amount.toString())
        const shiftedAmount = bigNumber.shiftedBy(-18)
        return formatBigNumber(shiftedAmount, showFull)
    }
    return ""
}

export const numberFormatUSA = {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: ''
}

// internal format used so BigNumber can read in its own output
const internalFormat = {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 0,
    secondaryGroupSize: 0,
    fractionGroupSeparator: '',
    fractionGroupSize: 0,
    suffix: ''
}

export const formatBigNumber = (x: BigNumber, showFull = false, format: BigNumber.Format = numberFormatUSA) => {
    /*
    1000000000000 => 1,000,000,000,000
    1000000000000.59 => 1,000,000,000,000.6
    0.987654321 => 0.98765432
    1000.12341234 => 1,000.1234
    1000.50001 => 1,000.5
    999999.09999999999 => 999,999.1
    0.999999995 => 1
    0.00000000499999999 => 0
    0.000000005 => 0.00000001
  */
    const maxPlaces = 8
    const integerPart = x.integerValue(BigNumber.ROUND_FLOOR)
    const decimalPart = x.minus(integerPart)
    const dpLength = decimalPart.toFixed().length - 2
    const ipLength = integerPart.toFixed().length
    var internallyFormatted = '0'
    var decimalPlaces

    if (x.isZero()) {
        return '0'
    }

    if (showFull || decimalPart.isZero()) {
    } else if (integerPart.isZero()) {
        if (dpLength > maxPlaces) {
            decimalPlaces = maxPlaces
        }
    } else {
        if (ipLength >= maxPlaces) {
            decimalPlaces = 1
        } else {
            const totalPlaces = dpLength + ipLength
            if (totalPlaces > maxPlaces) {
                decimalPlaces = maxPlaces - ipLength
            }
        }
    }
    if (decimalPlaces === undefined) {
        internallyFormatted = x.toFormat(internalFormat)
    } else {
        internallyFormatted = x.toFormat(decimalPlaces, internalFormat)
    }

    const z = new BigNumber(internallyFormatted)
    return z.toFormat(format)
}

