// utils/formatBytes.ts

const IEC_UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB"] as const;

export type SizeUnit = (typeof IEC_UNITS)[number];

interface FormatBytesOptions {
  decimals?: number;   // how many decimal places to keep
  units?: SizeUnit[];  // override units if you want
  base?: 1000 | 1024;  // use 1000 for SI, 1024 for binary (default)
}

export function formatBytes(
  bytes: number | null | undefined,
  options: FormatBytesOptions = {}
): string {
  const {
    decimals = 1,
    units = IEC_UNITS,
    base = 1024,
  } = options;

  if (bytes == null || isNaN(bytes)) return "0 B";
  if (bytes === 0) return "0 B";

  const absBytes = Math.abs(bytes);
  const dm = decimals < 0 ? 0 : decimals;

  const exponent = Math.min(
    Math.floor(Math.log(absBytes) / Math.log(base)),
    units.length - 1
  );

  const value = absBytes / Math.pow(base, exponent);
  const rounded = Number(value.toFixed(dm));

  const sign = bytes < 0 ? "-" : "";

  return `${sign}${rounded} ${units[exponent]}`;
}
