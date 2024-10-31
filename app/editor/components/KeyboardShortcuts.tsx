"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["Space", "K"], description: "Play/Pause" },
  { keys: ["J"], description: "Rewind 10 seconds" },
  { keys: ["L"], description: "Forward 10 seconds" },
  { keys: ["M"], description: "Mute/Unmute" },
  { keys: ["F"], description: "Toggle fullscreen" },
  { keys: ["Ctrl", "Z"], description: "Undo last operation" },
  { keys: ["Ctrl", "S"], description: "Process video" },
];

export function KeyboardShortcuts() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {shortcuts.map(({ keys, description }) => (
            <div key={description} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{description}</span>
              <div className="flex gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 