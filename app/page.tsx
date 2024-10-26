import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Play, Scissors, Download } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-6">
            VideoForge
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional video editing made simple. Upload, edit, and export your videos with powerful tools and effects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Upload className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Upload</h3>
            <p className="text-muted-foreground">
              Drag and drop or select your video files to get started
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Play className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Preview</h3>
            <p className="text-muted-foreground">
              Watch your changes in real-time with our advanced preview system
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Scissors className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Edit</h3>
            <p className="text-muted-foreground">
              Trim, cut, add effects, and enhance your videos with precision
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Download className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Export</h3>
            <p className="text-muted-foreground">
              Download your edited videos in multiple formats and qualities
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/editor">Start Editing</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}