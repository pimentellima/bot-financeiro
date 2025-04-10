import { format, setHours, setMinutes } from 'date-fns'

export function convertToTime(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    const baseDate = new Date()
    const timeDate = setMinutes(setHours(baseDate, hours), mins)

    return format(timeDate, 'HH:mm')
}

export function convertDate(date: Date) {
    return date.toISOString().split('T')[0]
}

export function convertToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

export function extractDateFromText(text: string) {
    const regex = /(\d{4})-(\d{2})-(\d{2})/

    const resultado = text.match(regex)

    if (resultado) {
        return resultado[0]
    } else {
        return null
    }
}
