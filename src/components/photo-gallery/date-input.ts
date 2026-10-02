const pad = (value: number) => String(value).padStart(2, '0');

/** `2024-07-30T18:45`: a date in the local time zone, as a datetime-local input expects it. */
export const toDateTimeInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
