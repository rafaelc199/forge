import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';

import { Button } from '@/components/ui/button';

import { Slider } from '@/components/ui/slider';



interface ResizeModalProps {

  onClose: () => void;

  onApply: (width: number, height: number) => void;

  initialWidth: number;

  initialHeight: number;

  maxWidth?: number;

  maxHeight?: number;

}



export function ResizeModal({

  onClose,

  onApply,

  initialWidth = 640,

  initialHeight = 480,

  maxWidth = 1920,

  maxHeight = 1080

}: ResizeModalProps) {

  const [width, setWidth] = useState(initialWidth);

  const [height, setHeight] = useState(initialHeight);



  return (

    <Modal onClose={onClose}>

      <div className="space-y-4 p-6">

        <div>

          <h2 className="text-xl font-bold mb-2">Resize Video</h2>

          <p className="text-sm text-muted-foreground mb-4">

            Adjust the width and height of your video.

          </p>

        </div>



        <div className="space-y-6">

          <div>

            <label className="block text-sm font-medium mb-2">

              Width: {width}px

            </label>

            <Slider

              defaultValue={[width]}

              onValueChange={(value) => setWidth(value[0])}

              min={100}

              max={maxWidth}

              step={1}

            />

          </div>



          <div>

            <label className="block text-sm font-medium mb-2">

              Height: {height}px

            </label>

            <Slider

              defaultValue={[height]}

              onValueChange={(value) => setHeight(value[0])}

              min={100}

              max={maxHeight}

              step={1}

            />

          </div>

        </div>



        <div className="flex justify-end space-x-2 mt-6">

          <Button variant="outline" onClick={onClose}>

            Cancel

          </Button>

          <Button onClick={() => onApply(width, height)}>

            Apply

          </Button>

        </div>

      </div>

    </Modal>

  );

} 
