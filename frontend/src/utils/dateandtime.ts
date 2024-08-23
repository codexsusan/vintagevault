export const combineDateAndTime = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate;
};
