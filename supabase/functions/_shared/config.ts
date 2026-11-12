// Single source of truth for limits and prices. The web and mobile apps read
// these through the `me` function, so change them here only.

export const FREE_TUTOR_PER_DAY = 3;
export const FREE_PRACTICE_PER_DAY = 20;
export const PRACTICE_MAX_QUESTIONS = 20;
export const MOCK_QUESTIONS_PER_SUBJECT = 10;
export const MOCK_SECONDS_PER_QUESTION = 45;

export type PlanId = "day" | "monthly" | "quarter";

export const PLANS: Record<PlanId, { name: string; priceNgn: number; days: number }> = {
  day: { name: "Day Pass", priceNgn: 500, days: 1 },
  monthly: { name: "Monthly", priceNgn: 2000, days: 30 },
  quarter: { name: "3 Months", priceNgn: 5000, days: 90 },
};

// Store product IDs used by the mobile app (Play Billing and App Store).
export const STORE_PRODUCTS: Record<string, PlanId> = {
  examsai_day_pass: "day",
  examsai_premium_monthly: "monthly",
};

export const SUBJECT_NAMES: Record<string, string> = {
  english: "Use of English",
  mathematics: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  government: "Government",
  economics: "Economics",
  literature: "Literature in English",
  commerce: "Commerce",
  crs: "Christian Religious Studies",
  irs: "Islamic Religious Studies",
  geography: "Geography",
  accounting: "Principles of Accounts",
  agric: "Agricultural Science",
};

export const EXAMS = ["JAMB", "WAEC", "NECO"] as const;
export type Exam = (typeof EXAMS)[number];
