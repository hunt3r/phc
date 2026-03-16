/** Type for staff members (data lives in src/content/staff/index.json, editable via Tina). */
export interface StaffMember {
  name: string;
  title: string;
  bio: string;
  /** Optional: path or Cloudinary URL for profile photo */
  image?: string;
  /** Optional: e.g. "September 16, 1957 – October 4, 2024" for In Memoriam */
  inMemoriam?: string;
}
