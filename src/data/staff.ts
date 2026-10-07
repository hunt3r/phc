import { slugify } from '@/lib/slug';

/** Type for staff members (data lives in src/content/staff/index.json, editable via Tina). */
export interface StaffMember {
  name: string;
  title: string;
  bio: string;
  /** Optional: path or Cloudinary URL for profile photo */
  image?: string;
  /** Optional short note shown on the profile aside (e.g. In Memoriam dates). */
  note?: string;
  /** Licenses, degrees, and certifications. One entry per item. */
  credentials?: string[];
}

export type StaffMemberWithSlug = StaffMember & { slug: string };

/**
 * Unique URL slug for each person, in list order. Derived from the name
 * (`Paul Harris` → `paul-harris`). A later duplicate gets a `-2`, `-3`, … suffix.
 */
export function withStaffSlugs<T extends { name: string }>(members: T[]): (T & { slug: string })[] {
  const used = new Set<string>();
  return members.map((member) => {
    const base = slugify(member.name) || 'staff';
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    used.add(slug);
    return { ...member, slug };
  });
}
