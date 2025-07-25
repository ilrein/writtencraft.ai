import { useQuery } from "@tanstack/react-query"
import { FileText, MapPin, Plus, Scroll, Users } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { api, type Character, type Location, type LoreEntry } from "@/lib/api"
import { DynamicCodexForm } from "./dynamic-codex-form"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent } from "./ui/dialog"

interface CodexEntry {
  name: string
  role: string
  description: string
}

type CodexAnyEntry = Character | Location | LoreEntry | CodexEntry

interface CodexModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  initialType?: string | null
  initialEntry?: string | null
}

export default function CodexModal({
  isOpen,
  onClose,
  projectId,
  initialType = null,
  initialEntry = null,
}: CodexModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(initialType)
  const [selectedEntry, setSelectedEntry] = useState<CodexAnyEntry | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Fetch characters from API
  const { data: characters = [] } = useQuery({
    queryKey: ["characters", projectId],
    queryFn: async () => {
      const result = await api.characters.list(projectId)
      return result
    },
    enabled: isOpen, // Only fetch when modal is open
  })

  // Fetch locations from API
  const { data: locations = [] } = useQuery({
    queryKey: ["locations", projectId],
    queryFn: () => api.locations.list(projectId),
    enabled: isOpen, // Only fetch when modal is open
  })

  // Fetch lore entries from API
  const { data: loreEntries = [] } = useQuery({
    queryKey: ["lore", projectId],
    queryFn: () => api.lore.list(projectId),
    enabled: isOpen, // Only fetch when modal is open
  })

  // Fetch plot threads from API
  const { data: plotThreads = [] } = useQuery({
    queryKey: ["plot", projectId],
    queryFn: () => api.plot.list(projectId),
    enabled: isOpen, // Only fetch when modal is open
  })

  const getTypeConfig = useCallback(
    (typeParam: string) => {
      switch (typeParam) {
        case "characters":
          return {
            title: "Characters",
            description: "Manage your story's characters",
            icon: Users,
            entries: characters.map((char) => ({
              ...char,
              role: char.role || "Character",
              description: char.description || "No description available",
            })),
          }
        case "locations":
          return {
            title: "Locations",
            description: "Track your story's places and settings",
            icon: MapPin,
            entries: locations.map((location) => ({
              ...location,
              role: location.type || "Location",
              description: location.description || "No description available",
            })),
          }
        case "lore":
          return {
            title: "Lore & World-building",
            description: "Document your world's history and rules",
            icon: Scroll,
            entries: loreEntries.map((lore) => ({
              ...lore,
              role: lore.type || "Lore",
              description: lore.description || "No description available",
            })),
          }
        case "plot":
          return {
            title: "Plot Threads",
            description: "Track your story's narrative threads and arcs",
            icon: FileText,
            entries: plotThreads.map((thread) => ({
              ...thread,
              name: thread.title,
              role: thread.type || "Plot Thread",
              description: thread.description || "No description available",
            })),
          }
        default:
          return {
            title: "Codex",
            description: "Manage your story elements",
            icon: FileText,
            entries: [],
          }
      }
    },
    [characters, locations, loreEntries, plotThreads]
  )

  const codexTypes = [
    { key: "characters", title: "Characters", icon: Users },
    { key: "locations", title: "Locations", icon: MapPin },
    { key: "lore", title: "Lore", icon: Scroll },
    { key: "plot", title: "Plot Threads", icon: FileText },
  ]

  // Find entry by name from the appropriate data array
  const findEntryByName = useCallback(
    (type: string, name: string): CodexAnyEntry | null => {
      switch (type) {
        case "characters":
          return characters.find((char) => char.name === name) || null
        case "locations":
          return locations.find((location) => location.name === name) || null
        case "lore":
          return loreEntries.find((lore) => lore.name === name) || null
        default:
          return null
      }
    },
    [characters, locations, loreEntries]
  )

  // Handle initial navigation when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null)
      setSelectedEntry(null)
      return
    }

    if (initialType && initialEntry) {
      setSelectedType(initialType)
      const foundEntry = findEntryByName(initialType, initialEntry)
      setSelectedEntry(foundEntry)
    } else if (initialType) {
      setSelectedType(initialType)
      setSelectedEntry(null)
    } else {
      setSelectedType(null)
      setSelectedEntry(null)
    }
  }, [isOpen, initialType, initialEntry, findEntryByName])

  const handleEntryClick = (entry: CodexAnyEntry) => {
    setSelectedEntry(entry)
  }

  const handleBackToType = () => {
    setSelectedEntry(null)
    setIsEditMode(false)
  }

  const handleBackToOverview = () => {
    setSelectedType(null)
    setSelectedEntry(null)
    setIsEditMode(false)
  }

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode)
  }

  const handleSaveComplete = () => {
    setIsEditMode(false)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-bold text-2xl">Project Codex</h2>
        <p className="text-muted-foreground">Manage all aspects of your story world</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {codexTypes.map((type) => {
          const config = getTypeConfig(type.key)
          const IconComponent = type.icon

          return (
            <Card
              className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
              key={type.key}
              onClick={() => setSelectedType(type.key)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6" />
                  {type.title}
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {config.entries.length} items
                  </span>
                  <Badge variant="outline">View All</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderTypeView = () => {
    if (!selectedType) {
      return null
    }

    const config = getTypeConfig(selectedType)
    const IconComponent = config.icon

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToOverview} size="sm" variant="ghost">
            ← Back to Codex
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-3 font-bold text-2xl">
              <IconComponent className="h-7 w-7" />
              {config.title}
            </h2>
            <p className="mt-1 text-muted-foreground">{config.description}</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {config.entries.map((entry) => (
            <Card
              className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
              key={entry.name}
              onClick={() => handleEntryClick(entry)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{entry.name}</CardTitle>
                    <CardDescription>{entry.role}</CardDescription>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm">{entry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {config.entries.length === 0 && (
          <div className="py-16 text-center">
            <IconComponent className="mx-auto mb-4 h-16 w-16 opacity-50" />
            <h3 className="mb-2 font-medium text-xl">No {config.title.toLowerCase()} yet</h3>
            <p className="mb-6 text-muted-foreground">
              Create your first item to start building your story world.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Helper function to check if entry is a Character object
  const isCharacter = (entry: CodexAnyEntry): entry is Character => {
    return "id" in entry && "role" in entry && entry.role !== undefined
  }

  // Helper function to check if entry is a Location object
  const isLocation = (entry: CodexAnyEntry): entry is Location => {
    return (
      "id" in entry &&
      "type" in entry &&
      typeof (entry as Location).type === "string" &&
      ["city", "country", "building", "room", "fantasy_realm", "planet", "dimension"].includes(
        (entry as Location).type as string
      )
    )
  }

  // Helper function to check if entry is a LoreEntry object
  const isLoreEntry = (entry: CodexAnyEntry): entry is LoreEntry => {
    return "id" in entry && !isCharacter(entry) && !isLocation(entry)
  }

  // Helper function to get display role
  const getDisplayRole = (entry: CodexAnyEntry): string => {
    if (isCharacter(entry)) {
      return entry.role || "Character"
    }
    if (isLocation(entry)) {
      return entry.type || "Location"
    }
    if (isLoreEntry(entry)) {
      return entry.type || "Lore"
    }
    return (entry as CodexEntry).role
  }

  // Helper function to get display description
  const getDisplayDescription = (entry: CodexAnyEntry): string => {
    if (isCharacter(entry) || isLocation(entry) || isLoreEntry(entry)) {
      return entry.description || "No description available"
    }
    return (entry as CodexEntry).description
  }

  // Helper to determine entry type and title for editing
  const getEntryEditInfo = (entry: Character | Location | LoreEntry) => {
    if (isCharacter(entry)) {
      return { entryType: "characters" as const, cardTitle: "Character Details" }
    }
    if (isLocation(entry)) {
      return { entryType: "locations" as const, cardTitle: "Location Details" }
    }
    return { entryType: "lore" as const, cardTitle: "Lore Details" }
  }

  // Render edit mode view
  const renderEditMode = (
    entry: Character | Location | LoreEntry,
    config: ReturnType<typeof getTypeConfig>
  ) => {
    const { entryType, cardTitle } = getEntryEditInfo(entry)
    const IconComponent = config.icon

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToType} size="sm" variant="ghost">
            ← Back to {config.title}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="font-bold text-2xl">Edit {entry.name}</h2>
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <Badge variant="secondary">{getDisplayRole(entry)}</Badge>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicCodexForm
                entry={entry}
                entryType={entryType}
                onCancel={() => setIsEditMode(false)}
                onSave={handleSaveComplete}
                projectId={projectId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render read-only mode view
  const renderReadOnlyMode = (entry: CodexAnyEntry, config: ReturnType<typeof getTypeConfig>) => {
    const IconComponent = config.icon
    const isCharacterEntry = isCharacter(entry)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToType} size="sm" variant="ghost">
            ← Back to {config.title}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="font-bold text-2xl">{entry.name}</h2>
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <Badge variant="secondary">{getDisplayRole(entry)}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {(isCharacterEntry || isLocation(entry) || isLoreEntry(entry)) && (
                <Button onClick={handleEditToggle} size="sm" variant="outline">
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline">
                Delete
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{getDisplayDescription(entry)}</p>
            </CardContent>
          </Card>

          {isCharacterEntry && (
            <>
              {entry.appearance && (
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed">{entry.appearance}</p>
                  </CardContent>
                </Card>
              )}

              {entry.personality && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed">{entry.personality}</p>
                  </CardContent>
                </Card>
              )}

              {entry.backstory && (
                <Card>
                  <CardHeader>
                    <CardTitle>Backstory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed">{entry.backstory}</p>
                  </CardContent>
                </Card>
              )}

              {entry.motivation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Motivation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed">{entry.motivation}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!isCharacterEntry && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  No additional notes yet. Click Edit to add more details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const renderEntryDetail = () => {
    if (!(selectedEntry && selectedType)) {
      return null
    }

    const config = getTypeConfig(selectedType)
    const canEdit =
      isCharacter(selectedEntry) || isLocation(selectedEntry) || isLoreEntry(selectedEntry)

    // Show edit mode if editing and entry can be edited
    if (isEditMode && canEdit) {
      return renderEditMode(selectedEntry as Character | Location | LoreEntry, config)
    }

    // Show read-only mode
    return renderReadOnlyMode(selectedEntry, config)
  }

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {(() => {
              if (selectedEntry) {
                return renderEntryDetail()
              }
              if (selectedType) {
                return renderTypeView()
              }
              return renderOverview()
            })()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
