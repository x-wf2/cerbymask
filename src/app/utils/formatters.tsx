
export function formatAddress(address: string) {
    return `${address.substring(0, 3)}..${address.substring(address.length-16)}`
}
