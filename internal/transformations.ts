import type {
  Candidate,
  CandidateStatus,
  EnglishLevel,
  SelectionProcess,
  SeniorityLevel,
  Vacancy,
} from "./types";

const ENGLISH_LEVEL_ORDER: EnglishLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Native",
];

const SENIORITY_ORDER: SeniorityLevel[] = [
  "Junior",
  "Semi-Senior",
  "Senior",
  "Lead",
  "Executive",
];

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampScore(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return value;
}

export function calculateCandidateScore(candidate: Candidate, vacancy: Vacancy): number {
  const candidateSkills = new Set(candidate.skills.map((skill) => skill.toLowerCase()));
  const requiredSkills = [...new Set(vacancy.requiredSkills.map((skill) => skill.toLowerCase()))];
  const preferredSkills = [
    ...new Set(vacancy.preferredSkills.map((skill) => skill.toLowerCase())),
  ];

  const matchedRequiredSkills = requiredSkills.filter((skill) => candidateSkills.has(skill)).length;
  const hasAllRequiredSkills =
    requiredSkills.length === 0 || matchedRequiredSkills === requiredSkills.length;

  let skillsScore = 0;
  if (hasAllRequiredSkills) {
    skillsScore += 40;
  } else if (
    requiredSkills.length > 0 &&
    matchedRequiredSkills / requiredSkills.length >= 0.5
  ) {
    skillsScore += 20;
  }

  const matchedPreferredSkills = preferredSkills.filter((skill) =>
    candidateSkills.has(skill),
  ).length;
  skillsScore += Math.min(20, matchedPreferredSkills * 10);

  let experienceScore = 0;
  if (
    candidate.yearsOfExperience >= vacancy.minYearsExperience &&
    candidate.yearsOfExperience <= vacancy.maxYearsExperience
  ) {
    experienceScore = 20;
  } else {
    const distanceToRange =
      candidate.yearsOfExperience < vacancy.minYearsExperience
        ? vacancy.minYearsExperience - candidate.yearsOfExperience
        : candidate.yearsOfExperience - vacancy.maxYearsExperience;

    if (distanceToRange >= 1 && distanceToRange <= 2) {
      experienceScore = 10;
    }
  }

  let seniorityScore = 0;
  const candidateSeniorityIndex = SENIORITY_ORDER.indexOf(candidate.seniority);
  const vacancySeniorityIndex = SENIORITY_ORDER.indexOf(vacancy.requiredSeniority);

  if (candidateSeniorityIndex === vacancySeniorityIndex) {
    seniorityScore = 15;
  } else if (
    candidateSeniorityIndex >= 0 &&
    vacancySeniorityIndex >= 0 &&
    Math.abs(candidateSeniorityIndex - vacancySeniorityIndex) === 1
  ) {
    seniorityScore = 7;
  }

  let englishScore = 0;
  const candidateEnglishIndex = ENGLISH_LEVEL_ORDER.indexOf(candidate.englishLevel);
  const vacancyEnglishIndex = ENGLISH_LEVEL_ORDER.indexOf(vacancy.requiredEnglishLevel);

  if (
    candidateEnglishIndex >= 0 &&
    vacancyEnglishIndex >= 0 &&
    candidateEnglishIndex >= vacancyEnglishIndex
  ) {
    englishScore = 15;
  }

  let salaryScore = 0;
  if (
    candidate.expectedSalary >= vacancy.salaryRangeMin &&
    candidate.expectedSalary <= vacancy.salaryRangeMax
  ) {
    salaryScore = 10;
  } else if (
    candidate.expectedSalary > vacancy.salaryRangeMax &&
    candidate.expectedSalary <= vacancy.salaryRangeMax * 1.2
  ) {
    salaryScore = 5;
  }

  return clampScore(
    skillsScore + experienceScore + seniorityScore + englishScore + salaryScore,
  );
}

export function rankCandidatesForVacancy(
  candidates: Candidate[],
  vacancy: Vacancy,
): Array<{ candidate: Candidate; score: number }> {
  return candidates
    .map((candidate) => ({
      candidate,
      score: calculateCandidateScore(candidate, vacancy),
    }))
    .sort((a, b) => b.score - a.score);
}

export function groupCandidatesBySeniority(
  candidates: Candidate[],
): Record<SeniorityLevel, Candidate[]> {
  const grouped: Record<SeniorityLevel, Candidate[]> = {
    Junior: [],
    "Semi-Senior": [],
    Senior: [],
    Lead: [],
    Executive: [],
  };

  for (const candidate of candidates) {
    grouped[candidate.seniority].push(candidate);
  }

  return grouped;
}

export function countCandidatesByStatus(
  candidates: Candidate[],
): Record<CandidateStatus, number> {
  const counts: Record<CandidateStatus, number> = {
    Active: 0,
    "In process": 0,
    Hired: 0,
    Inactive: 0,
  };

  for (const candidate of candidates) {
    counts[candidate.status] += 1;
  }

  return counts;
}

export function calculateAverageSalary(candidates: Candidate[]): number {
  if (candidates.length === 0) {
    return 0;
  }

  const totalSalary = candidates.reduce(
    (sum, candidate) => sum + candidate.expectedSalary,
    0,
  );

  return roundToTwoDecimals(totalSalary / candidates.length);
}

export function findTopSkills(
  candidates: Candidate[],
  topN: number,
): Array<{ skill: string; count: number }> {
  if (topN <= 0) {
    return [];
  }

  const skillCounts = new Map<string, { skill: string; count: number }>();

  for (const candidate of candidates) {
    const uniqueSkillsForCandidate = new Set(
      candidate.skills.map((skill) => skill.trim()).filter((skill) => skill.length > 0),
    );

    for (const skill of uniqueSkillsForCandidate) {
      const normalizedSkill = skill.toLowerCase();
      const existing = skillCounts.get(normalizedSkill);

      if (existing) {
        existing.count += 1;
        continue;
      }

      skillCounts.set(normalizedSkill, { skill, count: 1 });
    }
  }

  return [...skillCounts.values()]
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.skill.localeCompare(b.skill);
    })
    .slice(0, topN);
}

export function calculateVacancyFillRate(processes: SelectionProcess[]): number {
  if (processes.length === 0) {
    return 0;
  }

  const hiredCount = processes.filter((process) => process.stage === "Hired").length;
  const fillRate = (hiredCount / processes.length) * 100;

  return roundToTwoDecimals(fillRate);
}
