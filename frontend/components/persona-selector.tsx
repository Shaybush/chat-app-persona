"use client";

import { useState } from "react";
import { Plus, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { Persona, CreatePersonaRequest } from "@/types";

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  onAddPersona: (persona: CreatePersonaRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function PersonaSelector({
  personas,
  selectedPersona,
  onPersonaChange,
  onAddPersona,
  isLoading = false,
  error = null,
}: PersonaSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaDescription, setNewPersonaDescription] = useState("");
  const [newPersonaPrompt, setNewPersonaPrompt] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const handleAddPersona = async () => {
    if (!newPersonaName.trim() || !newPersonaDescription.trim()) return;

    const personaData: CreatePersonaRequest = {
      name: newPersonaName.trim(),
      description: newPersonaDescription.trim(),
      systemPrompt:
        newPersonaPrompt.trim() ||
        `You are ${newPersonaName}. ${newPersonaDescription}`,
    };

    try {
      setIsCreating(true);
      setCreateError(null);

      await onAddPersona(personaData);

      // Reset form and close dialog
      setNewPersonaName("");
      setNewPersonaDescription("");
      setNewPersonaPrompt("");
      setIsDialogOpen(false);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create persona"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when dialog opens/closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewPersonaName("");
      setNewPersonaDescription("");
      setNewPersonaPrompt("");
      setCreateError(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Personas</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Custom Persona</DialogTitle>
              <DialogDescription>
                Add a new persona to chat with. Give them a name and
                description.
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <Alert variant="destructive">
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  placeholder="e.g., Albert Einstein"
                  disabled={isCreating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPersonaDescription}
                  onChange={(e) => setNewPersonaDescription(e.target.value)}
                  placeholder="e.g., Brilliant physicist and thinker"
                  disabled={isCreating}
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
                  disabled={isCreating}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddPersona}
                disabled={
                  !newPersonaName.trim() ||
                  !newPersonaDescription.trim() ||
                  isCreating
                }
              >
                {isCreating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isCreating ? "Creating..." : "Create Persona"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {isLoading ? (
          // Loading skeletons
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          personas.map((persona) => (
            <Card
              key={persona.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPersona.id === persona.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-accent/50"
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
                <CardDescription className="text-xs">
                  {persona.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
