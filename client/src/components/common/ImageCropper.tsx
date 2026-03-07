import React, { useState, useCallback } from 'react';
import Cropper, {type Area, type Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Check, X, Crop as CropIcon } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel, aspectRatio = 16 / 9 }) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => setCrop(crop);
    const onZoomChange = (zoom: number) => setZoom(zoom);

    const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('No 2d context');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleCrop = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
                onCropComplete(croppedBlob);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-3xl bg-black/90 border-white/10 backdrop-blur-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/10">
                    <DialogTitle className="flex items-center gap-2 text-white italic uppercase font-black">
                        <CropIcon className="text-cyan-500" />
                        Crop Template Image
                    </DialogTitle>
                </DialogHeader>

                <div className="relative h-[400px] w-full bg-black">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Zoom Level</span>
                            <span className="text-xs font-black text-white italic">{(zoom * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="py-4"
                        />
                    </div>

                    <DialogFooter className="flex gap-3">
                        <Button variant="outline" onClick={onCancel} className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black italic uppercase tracking-widest text-xs">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={handleCrop} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black italic uppercase tracking-widest text-xs">
                            <Check className="mr-2 h-4 w-4" />
                            Apply Crop
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropper;
