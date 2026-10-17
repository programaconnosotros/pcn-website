// Same rule as EventStatusBadge: without an explicit end, an event lasts until the end of its day.
export const hasEventEnded = (event: { date: Date; endDate: Date | null }, now = new Date()) => {
  const end = event.endDate ? new Date(event.endDate) : new Date(event.date);
  if (!event.endDate) end.setHours(23, 59, 59, 999);
  return now > end;
};
