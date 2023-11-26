export type TimeUnits =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years";
export type ValidatedSection = "body" | "query" | "headers" | "params";
export type Role = "ADMIN" | "USER" | "DOCTOR";
export type RequirementType<T, K, Y> = T & Partial<K> & Required<Y>;