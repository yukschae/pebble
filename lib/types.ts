import type { ComponentType } from "react"

export interface PassionSuggestion {
  title: string
  informative_description: string
  colloquial_description: string
  tags: string[]
}
  
export interface PassionSuggestionRow {
    suggestions: PassionSuggestion[];
}

export interface SocialIssuePreference {
  title: string
  attachment: number
  others: string[]
}
 
export type Maybe<T> = T | null | undefined;
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface QuestData {
  id: number;
  title: string;
  completed: boolean;
  current: boolean;
  description: string;
  actions: string[];
  outcome: string;
  difficulty: number;
  order: number;
  planet?: string;
  funRating?: number;
  confidenceRating?: number;
  icon?: React.ComponentType<any>;
  color?: string;
}