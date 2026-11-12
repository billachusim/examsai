export const SUBJECTS: { slug: string; name: string }[] = [
  { slug: "english", name: "Use of English" },
  { slug: "mathematics", name: "Mathematics" },
  { slug: "physics", name: "Physics" },
  { slug: "chemistry", name: "Chemistry" },
  { slug: "biology", name: "Biology" },
  { slug: "government", name: "Government" },
  { slug: "economics", name: "Economics" },
  { slug: "literature", name: "Literature in English" },
  { slug: "commerce", name: "Commerce" },
  { slug: "crs", name: "CRS" },
  { slug: "irs", name: "IRS" },
  { slug: "geography", name: "Geography" },
  { slug: "accounting", name: "Accounts" },
  { slug: "agric", name: "Agric Science" },
];
export const subjectName = (slug: string) => SUBJECTS.find(s => s.slug === slug)?.name ?? slug;