/** Type for staff members (data lives in src/content/staff/index.json, editable via Tina). */
export interface StaffMember {
  name: string;
  title: string;
  bio: string;
  /** Optional: path or Cloudinary URL for profile photo */
  image?: string;
  /** Optional short note shown under the title (e.g. In Memoriam dates, credentials). */
  note?: string;
}
