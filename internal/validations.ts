import type { Candidate, Vacancy } from "./types";

export function isValidEmail(email: string): boolean {
  const trimmedEmail = email.trim();
  const atIndex = trimmedEmail.indexOf("@");
  const lastAtIndex = trimmedEmail.lastIndexOf("@");
  const lastDotIndex = trimmedEmail.lastIndexOf(".");

  if (atIndex <= 0) {
    return false;
  }

  if (atIndex !== lastAtIndex) {
    return false;
  }

  if (lastDotIndex <= atIndex + 1) {
    return false;
  }

  if (lastDotIndex >= trimmedEmail.length - 1) {
    return false;
  }

  return true;
}

export function validateCandidate(candidate: Candidate): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (candidate.yearsOfExperience < 0 || candidate.yearsOfExperience > 50) {
    errors.push("yearsOfExperience must be between 0 and 50.");
  }

  if (candidate.currentSalary <= 0) {
    errors.push("currentSalary must be greater than 0.");
  }

  if (candidate.expectedSalary <= 0) {
    errors.push("expectedSalary must be greater than 0.");
  }

  if (!Array.isArray(candidate.skills) || candidate.skills.length < 1) {
    errors.push("skills must contain at least 1 skill.");
  }

  if (!isValidEmail(candidate.email)) {
    errors.push("email must be a valid email format.");
  }

  if (candidate.phone.trim().length === 0) {
    errors.push("phone must not be empty.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateVacancy(vacancy: Vacancy): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(vacancy.requiredSkills) || vacancy.requiredSkills.length < 1) {
    errors.push("requiredSkills must contain at least 1 skill.");
  }

  if (vacancy.minYearsExperience < 0) {
    errors.push("minYearsExperience must be greater than or equal to 0.");
  }

  if (vacancy.maxYearsExperience < vacancy.minYearsExperience) {
    errors.push("maxYearsExperience must be greater than or equal to minYearsExperience.");
  }

  if (vacancy.salaryRangeMin <= 0) {
    errors.push("salaryRangeMin must be greater than 0.");
  }

  if (vacancy.salaryRangeMax <= 0) {
    errors.push("salaryRangeMax must be greater than 0.");
  }

  if (vacancy.salaryRangeMax < vacancy.salaryRangeMin) {
    errors.push("salaryRangeMax must be greater than or equal to salaryRangeMin.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
