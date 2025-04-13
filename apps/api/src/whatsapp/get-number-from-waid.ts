// só funcina para números brasileiros
export function getNumberFromWaId(waId: string) {
    const ddi = waId.slice(0, 2)
    const ddd = waId.slice(2, 4)
    const base = waId.slice(4)

    return `${ddi}${ddd}9${base}`
}
