import pino from "pino";
import dayjs from "dayjs";

const log = pino({
  base: { pid: false }, // Remove process ID from logs
  timestamp: () => `,"time":"${dayjs().format("YYYY-MM-DD HH:mm:ss A")}"`,
  transport: {
    target: "pino-pretty", // Use pino-pretty for better formatting
    options: {
      colorize: true, // Enable colors
      ignore: "pid,hostname", // Ignore unnecessary fields
    },
  },
});

export default log;