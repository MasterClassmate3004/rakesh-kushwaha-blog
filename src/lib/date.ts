function pad2(value: number) {
    return String(value).padStart(2, "0")
}

export function formatDateDDMMYYYY(value: string | Date, useUTC = true) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    const day = useUTC ? date.getUTCDate() : date.getDate()
    const month = useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1
    const year = useUTC ? date.getUTCFullYear() : date.getFullYear()

    return `${pad2(day)}-${pad2(month)}-${year}`
}

export function formatDateTimeDDMMYYYY(value: string | Date, useUTC = false) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    const hours = useUTC ? date.getUTCHours() : date.getHours()
    const minutes = useUTC ? date.getUTCMinutes() : date.getMinutes()

    return `${formatDateDDMMYYYY(date, useUTC)} ${pad2(hours)}:${pad2(minutes)}`
}

