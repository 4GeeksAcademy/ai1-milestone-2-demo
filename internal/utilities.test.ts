import {
  filterCandidatesByAvailability,
  filterCandidatesBySeniority,
  filterCandidatesBySkills,
  sortCandidatesByExperience,
  sortCandidatesBySalary,
} from "./collections";
import {
  binarySearchCandidateBySalary,
  findCandidateByEmail,
  findCandidateById,
} from "./search";
import {
  calculateAverageSalary,
  calculateCandidateScore,
  calculateVacancyFillRate,
  countCandidatesByStatus,
  findTopSkills,
  groupCandidatesBySeniority,
  rankCandidatesForVacancy,
} from "./transformations";
import { isValidEmail, validateCandidate, validateVacancy } from "./validations";
import type { Candidate, SelectionProcess, Vacancy } from "./types";

const sampleCandidates: Candidate[] = [
  {
    id: "C-2024-0451",
    fullName: "Maria Gonzalez",
    email: "maria.gonzalez@email.com",
    phone: "+56912345678",
    yearsOfExperience: 5,
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    englishLevel: "B2",
    seniority: "Semi-Senior",
    currentSalary: 3500,
    expectedSalary: 4200,
    availability: "1 month",
    location: "Valencia, Spain",
    remoteOnly: false,
    status: "Active",
  },
  {
    id: "C-2024-0452",
    fullName: "Juan Perez",
    email: "juan.perez@email.com",
    phone: "+56987654321",
    yearsOfExperience: 3,
    skills: ["JavaScript", "React", "CSS", "HTML"],
    englishLevel: "B1",
    seniority: "Junior",
    currentSalary: 2200,
    expectedSalary: 2800,
    availability: "Immediate",
    location: "Miami, Florida, United States",
    remoteOnly: true,
    status: "Active",
  },
  {
    id: "C-2024-0453",
    fullName: "Carolina Silva",
    email: "carolina.silva@email.com",
    phone: "+56911223344",
    yearsOfExperience: 8,
    skills: ["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    englishLevel: "C1",
    seniority: "Senior",
    currentSalary: 5500,
    expectedSalary: 6500,
    availability: "2 weeks",
    location: "Valencia, Spain",
    remoteOnly: false,
    status: "In process",
  },
];

const sampleVacancy: Vacancy = {
  id: "V-2024-0892",
  title: "Senior Full-Stack Developer",
  companyName: "TechCorp Solutions",
  requiredSkills: ["TypeScript", "React", "Node.js"],
  preferredSkills: ["PostgreSQL", "Docker"],
  minYearsExperience: 4,
  maxYearsExperience: 8,
  requiredEnglishLevel: "B2",
  requiredSeniority: "Senior",
  salaryRangeMin: 5000,
  salaryRangeMax: 7000,
  isRemote: true,
  location: "Remote",
  status: "Open",
};

describe("collections utilities", () => {
  test("filters by required skills case-insensitively", () => {
    const result = filterCandidatesBySkills(sampleCandidates, ["typescript", "node.js"]);
    expect(result.map((c) => c.id)).toEqual(["C-2024-0451", "C-2024-0453"]);
  });

  test("filters by seniority", () => {
    const result = filterCandidatesBySeniority(sampleCandidates, "Junior");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("C-2024-0452");
  });

  test("filters by any matching availability", () => {
    const result = filterCandidatesByAvailability(sampleCandidates, ["Immediate", "2 weeks"]);
    expect(result.map((c) => c.id)).toEqual(["C-2024-0452", "C-2024-0453"]);
  });

  test("sorts by salary without mutating original", () => {
    const original = [...sampleCandidates];
    const sorted = sortCandidatesBySalary(sampleCandidates, "asc");
    expect(sorted.map((c) => c.expectedSalary)).toEqual([2800, 4200, 6500]);
    expect(sampleCandidates).toEqual(original);
  });

  test("sorts by experience descending", () => {
    const sorted = sortCandidatesByExperience(sampleCandidates, "desc");
    expect(sorted.map((c) => c.yearsOfExperience)).toEqual([8, 5, 3]);
  });
});

describe("search utilities", () => {
  test("finds candidate by id", () => {
    const found = findCandidateById(sampleCandidates, "C-2024-0452");
    expect(found?.fullName).toBe("Juan Perez");
  });

  test("finds candidate by email case-insensitively", () => {
    const found = findCandidateByEmail(sampleCandidates, "MARIA.GONZALEZ@EMAIL.COM");
    expect(found?.id).toBe("C-2024-0451");
  });

  test("binary search returns index for salary in sorted array", () => {
    const sorted = sortCandidatesBySalary(sampleCandidates, "asc");
    const index = binarySearchCandidateBySalary(sorted, 4200);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(sorted[index].id).toBe("C-2024-0451");
  });

  test("binary search returns -1 when salary does not exist", () => {
    const sorted = sortCandidatesBySalary(sampleCandidates, "asc");
    expect(binarySearchCandidateBySalary(sorted, 9999)).toBe(-1);
  });
});

describe("transformations utilities", () => {
  test("calculates candidate score following weighted rules", () => {
    expect(calculateCandidateScore(sampleCandidates[2], sampleVacancy)).toBe(100);
    expect(calculateCandidateScore(sampleCandidates[0], sampleVacancy)).toBe(92);
    expect(calculateCandidateScore(sampleCandidates[1], sampleVacancy)).toBe(10);
  });

  test("ranks candidates by score descending", () => {
    const ranked = rankCandidatesForVacancy(sampleCandidates, sampleVacancy);
    expect(ranked.map((item) => item.candidate.id)).toEqual([
      "C-2024-0453",
      "C-2024-0451",
      "C-2024-0452",
    ]);
  });

  test("groups candidates by seniority with all keys present", () => {
    const grouped = groupCandidatesBySeniority(sampleCandidates);
    expect(grouped.Junior).toHaveLength(1);
    expect(grouped["Semi-Senior"]).toHaveLength(1);
    expect(grouped.Senior).toHaveLength(1);
    expect(grouped.Lead).toHaveLength(0);
    expect(grouped.Executive).toHaveLength(0);
  });

  test("counts candidates by status", () => {
    const counts = countCandidatesByStatus(sampleCandidates);
    expect(counts).toEqual({
      Active: 2,
      "In process": 1,
      Hired: 0,
      Inactive: 0,
    });
  });

  test("calculates average expected salary rounded to 2 decimals", () => {
    expect(calculateAverageSalary(sampleCandidates)).toBe(4500);
    expect(calculateAverageSalary([])).toBe(0);
  });

  test("finds top skills by frequency", () => {
    const topSkills = findTopSkills(sampleCandidates, 3);
    expect(topSkills).toHaveLength(3);
    expect(topSkills.map((s) => s.count)).toEqual([2, 2, 2]);
    expect(topSkills[0].skill).toBe("Node.js");
  });

  test("calculates vacancy fill rate rounded to 2 decimals", () => {
    const processes: SelectionProcess[] = [
      {
        id: "SP-1",
        candidateId: "C-2024-0451",
        vacancyId: "V-2024-0892",
        stage: "Hired",
        score: 95,
        notes: "Great fit",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
      },
      {
        id: "SP-2",
        candidateId: "C-2024-0452",
        vacancyId: "V-2024-0892",
        stage: "Rejected",
        score: 55,
        notes: "Not enough experience",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-03"),
      },
      {
        id: "SP-3",
        candidateId: "C-2024-0453",
        vacancyId: "V-2024-0892",
        stage: "Hired",
        score: 98,
        notes: "Excellent fit",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-04"),
      },
    ];

    expect(calculateVacancyFillRate(processes)).toBe(66.67);
    expect(calculateVacancyFillRate([])).toBe(0);
  });
});

describe("validation utilities", () => {
  test("validates basic email format", () => {
    expect(isValidEmail("person@example.com")).toBe(true);
    expect(isValidEmail("bademail.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });

  test("validates candidate business rules", () => {
    const invalidCandidate: Candidate = {
      ...sampleCandidates[0],
      yearsOfExperience: -1,
      currentSalary: 0,
      expectedSalary: -10,
      skills: [],
      email: "invalid",
      phone: "   ",
    };

    const result = validateCandidate(invalidCandidate);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(6);
  });

  test("validates vacancy business rules", () => {
    const invalidVacancy: Vacancy = {
      ...sampleVacancy,
      requiredSkills: [],
      minYearsExperience: -1,
      maxYearsExperience: -2,
      salaryRangeMin: 0,
      salaryRangeMax: -1,
    };

    const result = validateVacancy(invalidVacancy);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(5);
  });
});
