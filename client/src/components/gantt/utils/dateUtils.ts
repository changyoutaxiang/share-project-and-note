import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
export const formatDate = (date: Date, formatStr: string = 'MMM dd') => {
  return format(date, formatStr);
};
export const getDaysBetween = (startDate: Date, endDate: Date) => {
  return differenceInDays(endDate, startDate);
};
export const getWeekDays = (startDate: Date, endDate: Date) => {
  return eachDayOfInterval({
    start: startOfWeek(startDate),
    end: endOfWeek(endDate)
  });
};
export const addDaysToDate = (date: Date, days: number) => {
  return addDays(date, days);
};
export const getTaskWidth = (startDate: Date, endDate: Date, dayWidth: number) => {
  const days = getDaysBetween(startDate, endDate);
  return Math.max(days * dayWidth, dayWidth);
};
export const getTaskPosition = (taskStart: Date, chartStart: Date, dayWidth: number) => {
  const days = getDaysBetween(chartStart, taskStart);
  return days * dayWidth;
};