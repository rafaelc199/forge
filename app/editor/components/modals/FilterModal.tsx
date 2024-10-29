import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

interface FilterModalProps {
  onClose: () => void;
  onApply: (filter: string) => void;
}

const FILTERS = [
  { id: 'grayscale', name: 'Grayscale', description: 'Convert video to black and white' },
  { id: 'sepia', name: 'Sepia', description: 'Add a warm brownish tone' },
  { id: 'brightness', name: 'Brighten', description: 'Increase video brightness' },
  { id: 'contrast', name: 'Contrast', description: 'Enhance video contrast' },
  { id: 'blur', name: 'Blur', description: 'Add a soft blur effect' }
];

export function FilterModal({ onClose, onApply }: FilterModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Apply Filter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a filter to enhance your video.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onApply(filter.id)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <h3 className="font-medium">{filter.name}</h3>
              <p className="text-sm text-muted-foreground">{filter.description}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
} 