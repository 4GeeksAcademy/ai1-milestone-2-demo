import type {
  AvailabilityStatus,
  Candidate,
  Order,
  SeniorityLevel,
} from "./types";

export function filterCandidatesBySkills(
  candidates: Candidate[],
  requiredSkills: string[],
): Candidate[] {
  const normalizedRequiredSkills = requiredSkills.map((skill) => skill.toLowerCase());

  return candidates.filter((candidate) => {
    const candidateSkills = new Set(candidate.skills.map((skill) => skill.toLowerCase()));

    return normalizedRequiredSkills.every((requiredSkill) =>
      candidateSkills.has(requiredSkill),
    );
  });
}

export function filterCandidatesBySeniority(
  candidates: Candidate[],
  seniority: SeniorityLevel,
): Candidate[] {
  return candidates.filter((candidate) => candidate.seniority === seniority);
}

export function filterCandidatesByAvailability(
  candidates: Candidate[],
  availability: AvailabilityStatus[],
): Candidate[] {
  const allowedAvailability = new Set(availability);
  return candidates.filter((candidate) => allowedAvailability.has(candidate.availability));
}

export function sortCandidatesBySalary(
  candidates: Candidate[],
  order: Order,
): Candidate[] {
  const direction = order === "asc" ? 1 : -1;

  return [...candidates].sort(
    (a, b) => direction * (a.expectedSalary - b.expectedSalary),
  );
}

export function sortCandidatesByExperience(
  candidates: Candidate[],
  order: Order,
): Candidate[] {
  const direction = order === "asc" ? 1 : -1;

  return [...candidates].sort(
    (a, b) => direction * (a.yearsOfExperience - b.yearsOfExperience),
  );
}
