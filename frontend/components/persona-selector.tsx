"use client"

import { useState } from "react"
import { Plus, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Persona } from "@/app/page"

interface PersonaSelectorProps {
  personas: Persona[]
  selectedPersona: Persona
  onPersonaChange: (persona: Persona) => void
  onAddPersona: (persona: Persona) => void
}

export function PersonaSelector({ personas, selectedPersona, onPersonaChange, onAddPersona }: PersonaSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPersonaName, setNewPersonaName] = useState("")
  const [newPersonaDescription, setNewPersonaDescription] = useState("")
  const [newPersonaPrompt, setNewPersonaPrompt] = useState("")

  const handleAddPersona = () => {
    if (!newPersonaName.trim() || !newPersonaDescription.trim()) return

    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name: newPersonaName.trim(),
      description: newPersonaDescription.trim(),
      systemPrompt: newPersonaPrompt.trim() || `You are ${newPersonaName}. ${newPersonaDescription}`,
      isCustom: true,
    }

    onAddPersona(newPersona)
    setNewPersonaName("")
    setNewPersonaDescription("")
    setNewPersonaPrompt("")
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Personas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Custom Persona</DialogTitle>
              <DialogDescription>Add a new persona to chat with. Give them a name and description.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  placeholder="e.g., Albert Einstein"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPersonaDescription}
                  onChange={(e) => setNewPersonaDescription(e.target.value)}
                  placeholder="e.g., Brilliant physicist and thinker"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prompt">System Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  value={newPersonaPrompt}
                  onChange={(e) => setNewPersonaPrompt(e.target.value)}
                  placeholder="Custom instructions for how this persona should behave..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPersona} disabled={!newPersonaName.trim() || !newPersonaDescription.trim()}>
                Create Persona
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {personas.map((persona) => (
          <Card
            key={persona.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedPersona.id === persona.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50"
            }`}
            onClick={() => onPersonaChange(persona)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {persona.name}
                </CardTitle>
                {persona.isCustom && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Custom
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs">{persona.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
