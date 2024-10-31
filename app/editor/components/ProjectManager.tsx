"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VideoOperation } from '@/types/video';
import { Save, FolderOpen, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  operations: VideoOperation[];
  lastModified: Date;
}

interface ProjectManagerProps {
  operations: VideoOperation[];
  onLoadOperations: (operations: VideoOperation[]) => void;
}

export function ProjectManager({ operations, onLoadOperations }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSaveProject = () => {
    if (!projectName) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      operations: operations,
      lastModified: new Date()
    };

    // Save to localStorage
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('videoforge_projects', JSON.stringify(updatedProjects));
    
    setShowSaveDialog(false);
    setProjectName('');
  };

  const handleLoadProject = (project: Project) => {
    onLoadOperations(project.operations);
  };

  const handleShareProject = async (project: Project) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(project.operations));
      alert('Project operations copied to clipboard!');
    } catch (error) {
      console.error('Failed to share project:', error);
      alert('Failed to share project');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Button onClick={handleSaveProject} disabled={!projectName}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Load Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved projects</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.lastModified.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareProject(project)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleLoadProject(project)}
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 