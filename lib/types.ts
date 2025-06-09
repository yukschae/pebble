import type { ComponentType } from "react"

export interface PassionSuggestion {
    title: string;
    description: string;
    tags: string[];
  }
  
export interface PassionSuggestionRow {
    suggestions: PassionSuggestion[];
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