export default function dateFormatter(date: string | null | undefined) : string {
    if (!date) {
        return 'Tanggal tidak tersedia';
    }
    const dateConversion = new Date(date);
    const formatTanggal = new Intl.DateTimeFormat("id-ID", {
        day: 'numeric',
        month : 'long',
        year : 'numeric'
    });

    return formatTanggal.format(dateConversion);
}