import { addHours, format, parse, setHours, setMinutes, isWithinInterval, addDays } from "date-fns";

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ScheduleTime {
  time: string; // formato HH:mm
  label: string; // ex: "08:00"
  period: TimePeriod;
}

export interface ScheduledAdministration {
  dateTime: Date;
  time: string;
  label: string;
  period: TimePeriod;
}

export type ScheduleType = 'horario_fixo' | 'intervalo_regular' | 'dose_unica' | 'sos' | 'acm';

export interface SchedulingOptions {
  frequency: string; // ex: "6/6h", "8/8h", "12/12h", "1x/dia", "2x/dia"
  scheduleType: ScheduleType;
  startTime?: string; // horário inicial opcional (HH:mm)
  validityStart?: Date; // início da vigência
  validityEnd?: Date; // fim da vigência
}

interface ParsedFrequency {
  interval: number;
  unit: 'hours' | 'times';
  timesPerDay: number;
}

// Standard hospital scheduling times based on frequency
const STANDARD_SCHEDULES: Record<string, string[]> = {
  '1': ['08:00'], // 1x/dia
  '2': ['08:00', '20:00'], // 2x/dia (12/12h)
  '3': ['06:00', '14:00', '22:00'], // 3x/dia (8/8h)
  '4': ['06:00', '12:00', '18:00', '00:00'], // 4x/dia (6/6h)
  '6': ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'], // 6x/dia (4/4h)
  '8': ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], // 8x/dia (3/3h)
  '12': ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'], // 12x/dia (2/2h)
};

// Determine period of day based on hour
function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function useScheduling() {
  
  // Parse frequency string to structured format
  const parseFrequency = (frequency: string): ParsedFrequency => {
    const normalized = frequency.toLowerCase().trim();
    
    // Pattern: "X/Xh" (e.g., "6/6h", "8/8h", "12/12h")
    const intervalMatch = normalized.match(/(\d+)\/(\d+)h/);
    if (intervalMatch) {
      const interval = parseInt(intervalMatch[2], 10);
      const timesPerDay = Math.floor(24 / interval);
      return { interval, unit: 'hours', timesPerDay };
    }
    
    // Pattern: "Xx/dia" (e.g., "1x/dia", "2x/dia", "3x/dia")
    const timesMatch = normalized.match(/(\d+)x\/?dia/);
    if (timesMatch) {
      const times = parseInt(timesMatch[1], 10);
      const interval = Math.floor(24 / times);
      return { interval, unit: 'times', timesPerDay: times };
    }
    
    // Pattern: "a cada Xh" (e.g., "a cada 6h")
    const everyMatch = normalized.match(/a cada (\d+)h/);
    if (everyMatch) {
      const interval = parseInt(everyMatch[1], 10);
      const timesPerDay = Math.floor(24 / interval);
      return { interval, unit: 'hours', timesPerDay };
    }
    
    // Pattern: simple hour interval (e.g., "6h", "8h", "12h")
    const simpleMatch = normalized.match(/^(\d+)h$/);
    if (simpleMatch) {
      const interval = parseInt(simpleMatch[1], 10);
      const timesPerDay = Math.floor(24 / interval);
      return { interval, unit: 'hours', timesPerDay };
    }
    
    // Default: once daily
    return { interval: 24, unit: 'hours', timesPerDay: 1 };
  };

  // Calculate schedule times based on frequency
  const calculateScheduleTimes = (options: SchedulingOptions): ScheduleTime[] => {
    const { frequency, scheduleType, startTime } = options;
    
    // SOS and ACM don't have fixed schedules
    if (scheduleType === 'sos' || scheduleType === 'acm') {
      return [];
    }
    
    // Single dose at specific time
    if (scheduleType === 'dose_unica') {
      const time = startTime || '08:00';
      const hour = parseInt(time.split(':')[0], 10);
      return [{
        time,
        label: time,
        period: getTimePeriod(hour),
      }];
    }
    
    const parsed = parseFrequency(frequency);
    const timesPerDay = parsed.timesPerDay;
    
    // Use standard schedules if available
    const standardTimes = STANDARD_SCHEDULES[timesPerDay.toString()];
    
    if (standardTimes && !startTime) {
      return standardTimes.map(time => {
        const hour = parseInt(time.split(':')[0], 10);
        return {
          time,
          label: time,
          period: getTimePeriod(hour),
        };
      });
    }
    
    // Calculate custom schedule based on start time and interval
    const times: ScheduleTime[] = [];
    const baseTime = startTime ? parse(startTime, 'HH:mm', new Date()) : setMinutes(setHours(new Date(), 6), 0);
    
    for (let i = 0; i < timesPerDay; i++) {
      const scheduledTime = addHours(baseTime, i * parsed.interval);
      const hour = scheduledTime.getHours();
      const time = format(scheduledTime, 'HH:mm');
      
      times.push({
        time,
        label: time,
        period: getTimePeriod(hour),
      });
    }
    
    // Sort by time
    times.sort((a, b) => a.time.localeCompare(b.time));
    
    return times;
  };

  // Get the next scheduled time from now
  const getNextScheduleTime = (times: ScheduleTime[]): ScheduleTime | null => {
    if (times.length === 0) return null;
    
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    // Find next time today
    const nextToday = times.find(t => t.time > currentTime);
    if (nextToday) return nextToday;
    
    // If no more times today, return first time (for tomorrow)
    return times[0];
  };

  // Generate full schedule for a validity period
  const generateScheduleForPeriod = (options: SchedulingOptions): ScheduledAdministration[] => {
    const { validityStart, validityEnd } = options;
    
    if (!validityStart || !validityEnd) {
      return [];
    }
    
    const times = calculateScheduleTimes(options);
    if (times.length === 0) return [];
    
    const schedule: ScheduledAdministration[] = [];
    let currentDate = new Date(validityStart);
    
    while (currentDate <= validityEnd) {
      for (const scheduleTime of times) {
        const [hours, minutes] = scheduleTime.time.split(':').map(Number);
        const dateTime = setMinutes(setHours(new Date(currentDate), hours), minutes);
        
        if (isWithinInterval(dateTime, { start: validityStart, end: validityEnd })) {
          schedule.push({
            dateTime,
            time: scheduleTime.time,
            label: scheduleTime.label,
            period: scheduleTime.period,
          });
        }
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return schedule.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  };

  // Format frequency for display
  const formatFrequencyDisplay = (frequency: string, scheduleType: ScheduleType): string => {
    if (scheduleType === 'sos') return 'Se necessário (SOS)';
    if (scheduleType === 'acm') return 'A critério médico (ACM)';
    if (scheduleType === 'dose_unica') return 'Dose única';
    
    const parsed = parseFrequency(frequency);
    
    if (parsed.unit === 'hours') {
      return `A cada ${parsed.interval}h (${parsed.timesPerDay}x/dia)`;
    }
    
    return `${parsed.timesPerDay}x ao dia`;
  };

  // Get schedule times as formatted string
  const getScheduleTimesDisplay = (options: SchedulingOptions): string => {
    const times = calculateScheduleTimes(options);
    if (times.length === 0) {
      if (options.scheduleType === 'sos') return 'Quando necessário';
      if (options.scheduleType === 'acm') return 'Conforme orientação médica';
      return '-';
    }
    return times.map(t => t.label).join(' - ');
  };

  return {
    parseFrequency,
    calculateScheduleTimes,
    getNextScheduleTime,
    generateScheduleForPeriod,
    formatFrequencyDisplay,
    getScheduleTimesDisplay,
  };
}
