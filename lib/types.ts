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