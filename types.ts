
export enum CommandSkillName {
  Leadership = "Assertive, effective & safe leadership",
  DecisionMaking = "Effective decision making & planning",
  Communication = "Interpersonal communication",
  Resilience = "Personal resilience",
  Awareness = "Situational awareness",
  Teamwork = "Teamwork & interoperability"
}

export interface SubSkill {
  id: number;
  name: string;
  goodPractice: string[];
  poorPractice: string[];
}

export interface CommandSkill {
  name: CommandSkillName;
  description: string;
  color: string;
  subSkills: SubSkill[];
}

export type RatingValue = "4" | "3" | "2" | "1" | "0" | "NO";

export interface Rating {
  value: RatingValue;
  label: string;
  description: string;
}

export interface Observation {
  id: string;
  timestamp: string;
  time: string;
  activity: string;
  skillName: CommandSkillName;
  subSkillId: number;
  type: 'good' | 'poor';
  description: string;
}

export interface CandidateProfile {
  id?: string;
  firstName: string;
  lastName: string;
  serviceNumber: string;
  fireService: string;
  commandLevel: '1' | '2' | '3' | null;
  area?: string;
  station?: string;
  watch?: string;
  department?: string;
  team?: string;
  assessment_coordinator_id?: string | null;
  assessment_coordinator_name?: string | null;
}

export interface Assessment {
  id: string;
  eventType: string;
  raterName: string;
  raterRole?: 'temporary_rater' | 'rater' | 'admin';
  icName: string; // Kept for backward compatibility
  candidate_id?: string;
  candidateProfile?: CandidateProfile;
  incidentDescription: string;
  startTime: string;
  finishTime?: string;
  observations: Observation[];
  ratings: Record<string, RatingValue>; // key: "skillName-subSkillId"
  keyFeedback: Record<string, string>; // key: "skillName-subSkillId"
  status: 'ongoing' | 'completed';
  overallComments?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'temporary_rater' | 'rater' | 'admin';
  email?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'temporary_rater' | 'rater' | 'admin';
  created_at: string;
  email?: string;
  // Professional Details
  fire_service?: string;
  employee_id?: string;
  command_level?: '1' | '2' | '3';
  assessor_qual?: boolean;
  iqa_qual?: boolean;
  // New Progression Fields
  thincs_rater_qual?: boolean;
  additional_quals?: string[];
}