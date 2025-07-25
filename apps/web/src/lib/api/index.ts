/**
 * Centralized API client exports
 *
 * This file exports all API clients in a structured way.
 * Import specific clients or the entire API object as needed.
 */

export type {
  AiProvider,
  AiProviderDetails,
  CreateAiProviderData,
  OpenRouterExchangeData,
  UpdateAiProviderData,
} from "./ai-providers"
// AI Providers API
export { aiProvidersApi } from "./ai-providers"
export type { ApiClient, ApiRequestOptions } from "./base"
export { apiCall } from "./base"
export type {
  Character,
  CreateCharacterData,
  UpdateCharacterData,
} from "./characters"
// Characters API
export { charactersApi, createCharacterApi } from "./characters"
export type {
  CreateLocationData,
  Location,
  UpdateLocationData,
} from "./locations"
// Locations API
export { createLocationApi, locationsApi } from "./locations"
export type {
  CreateLoreData,
  LoreEntry,
  UpdateLoreData,
} from "./lore"
// Lore API
export { createLoreApi, loreApi } from "./lore"
export type {
  CreatePlotData,
  PlotThread,
  UpdatePlotData,
} from "./plot"
// Plot API
export { createPlotApi, plotApi } from "./plot"
export type {
  CreateNovelData,
  CreateProjectData,
  Novel,
  Project,
  UpdateNovelData,
  UpdateProjectData,
  Work,
} from "./projects"
// Project API (formerly Novel API)
export { novelApi, projectApi } from "./projects"

import { aiProvidersApi } from "./ai-providers"
import { charactersApi } from "./characters"
import { locationsApi } from "./locations"
import { loreApi } from "./lore"
import { plotApi } from "./plot"
import { novelApi, projectApi } from "./projects"

// Future API clients will be exported here:
// export { chapterApi } from "./chapters"
// export { organizationApi } from "./organizations"

/**
 * Combined API object for convenient access
 */
export const api = {
  projects: projectApi,
  novels: novelApi, // Legacy support
  aiProviders: aiProvidersApi,
  characters: charactersApi,
  locations: locationsApi,
  lore: loreApi,
  plot: plotApi,
  // chapters: chapterApi,
  // organizations: organizationApi,
}
