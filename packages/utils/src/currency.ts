export function formatCurrency(
    amount: number | string,
    style: 'currency' | 'decimal' = 'currency'
) {
    if (typeof amount === 'string') amount = amount.replace(',', '.')
    return new Intl.NumberFormat('pt-BR', {
        style,
        currency: 'BRL',
        minimumFractionDigits: 2,
        useGrouping: false,
    }).format(Number(amount))
}
