import type { Text } from "../../localization/LocalizedText";

export type DeviceType =
  | "phone"
  | "laptop"
  | "tablet"
  | "browser"
  | "monitor"
  | "multi";

export interface Profile {
  name: Text;
  title: Text;
  email: string;
  linkedinHandle: string;
  socials: {
    LinkedIn: string;
    Dribbble: string;
    Website: string;
  };
  phone: string;
}

export interface ProjectVisual {
  image?: string;
  secondaryImage?: string;
  imageAlt?: Text;
  device?: DeviceType;
}

export interface Project {
  id: string;
  name: string;
  category: Text;
  sector: Text;
  device: DeviceType;
  image?: string;
  secondaryImage?: string;
  imageAlt?: Text;
  caseContent?: Partial<Record<number, Text>>;
  caseMedia?: Partial<Record<number, ProjectVisual>>;
}

export interface Experience {
  company: string;
  role: Text;
  dates: Text;
  bullets: Text[];
}

export interface Metric {
  value: string;
  company: string;
  label: Text;
  detail: Text;
}

export interface Capability {
  title: Text;
  skills: Text[];
}

export interface Service {
  title: Text;
  description: Text;
}

export interface Certification {
  title: Text;
  issuer: Text;
  date: Text;
}

export interface PortfolioContent {
  profile: Profile;
  summary: Text;
  projects: Project[];
  experiences: Experience[];
  metrics: Metric[];
  capabilities: Capability[];
  services: Service[];
  certifications: Certification[];
}
