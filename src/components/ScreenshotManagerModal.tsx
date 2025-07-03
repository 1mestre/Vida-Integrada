"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, FileImage, Trash2, UploadCloud, Loader2, FileDown, Brush } from 'lucide-react';
import jsPDF from 'jspdf';
import InstructionModal from './InstructionModal';

interface ScreenshotManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

interface ImageFile {
  id: string;
  src: string;
  name: string;
}

const Dropzone = ({ onFilesAdded, onVisibleCapture, onGuidedCapture }: { onFilesAdded: (files: File[]) => void, onVisibleCapture: () => void, onGuidedCapture: () => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFilesAdded(files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesAdded(Array.from(e.target.files));
        }
    };

    return (
        <div 
            className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-[#8B5CF6]/50 rounded-lg bg-[#2d3748]/50 p-8 text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <UploadCloud className="w-16 h-16 text-[#8B5CF6]/80 mb-4" />
            <h2 className="text-2xl font-bold text-gradient mb-2">Arrastra tus capturas aquí</h2>
            <p className="text-[#edf2f7]/70 mb-6">o usa una de las opciones de abajo.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onGuidedCapture} className="bg-[#8B5CF6] hover:bg-[#7c3aed]">
                    <Camera className="mr-2" />
                    Capturar Página Completa (Guiado)
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                    <FileImage className="mr-2" />
                    O subir archivos
                </Button>
                 <Button onClick={onVisibleCapture} variant="secondary">
                    <Camera className="mr-2" />
                    Capturar Área Visible
                </Button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                multiple
                onChange={handleFileInputChange}
            />
        </div>
    );
};


const ScreenshotManagerModal: React.FC<ScreenshotManagerModalProps> = ({ isOpen, onClose, fileName }) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
    const { toast } = useToast();
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const addFiles = useCallback((files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            toast({ variant: 'destructive', title: 'Archivos no válidos', description: 'Por favor, sube solo archivos de imagen.' });
            return;
        }

        const newImages: ImageFile[] = imageFiles.map(file => ({
            id: crypto.randomUUID(),
            src: URL.createObjectURL(file),
            name: file.name
        }));

        setImages(prev => [...prev, ...newImages]);
    }, [toast]);

    const handleVisibleCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = stream.getVideoTracks()[0];
            const imageCapture = new (window as any).ImageCapture(videoTrack);
            const bitmap = await imageCapture.grabFrame();
            videoTrack.stop();

            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d');
            context?.drawImage(bitmap, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/png');
            setImages(prev => [...prev, { id: crypto.randomUUID(), src: dataUrl, name: `captura-${Date.now()}.png` }]);

        } catch (error) {
            console.error("Error capturando pantalla:", error);
            toast({ variant: 'destructive', title: 'Captura cancelada', description: 'No se pudo capturar el área visible.' });
        }
    };
    
    const handleGeneratePdf = async () => {
        if (images.length === 0) return;
        setIsGenerating(true);

        try {
            // Use the first image to determine orientation
            const firstImage = await loadImage(images[0].src);
            const orientation = firstImage.width > firstImage.height ? 'l' : 'p';
            
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'px',
                format: [firstImage.width, firstImage.height],
                compress: true,
            });

            for (let i = 0; i < images.length; i++) {
                const img = await loadImage(images[i].src);
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                if (i > 0) {
                    pdf.addPage([img.width, img.height], img.width > img.height ? 'l' : 'p');
                }
                
                pdf.addImage(img, 'PNG', 0, 0, img.width, img.height, undefined, 'FAST');
            }
            
            pdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error al generar PDF", description: "Hubo un problema al crear el archivo." });
        } finally {
            setIsGenerating(false);
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
    
    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newImages = [...images];
        const [draggedItem] = newImages.splice(dragItem.current, 1);
        newImages.splice(dragOverItem.current, 0, draggedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setImages(newImages);
    };

    const handleDeleteImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const handleClearAll = () => {
        images.forEach(image => URL.revokeObjectURL(image.src));
        setImages([]);
    };
    
    const openUploadDialog = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                addFiles(Array.from(target.files));
            }
        };
        input.click();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-[#1a202c] border-[#8B5CF6]/50 text-[#f7fafc] max-w-7xl h-[90vh] flex flex-col p-4 sm:p-6">
                    <DialogHeader className="flex-shrink-0 text-left">
                         <DialogTitle className="text-3xl font-bold text-gradient">
                            Gestor de Capturas
                        </DialogTitle>
                        <DialogDescription className="text-[#edf2f7]/70">Añade, reordena y convierte tus imágenes en un PDF.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-grow min-h-0 py-4">
                        {images.length === 0 ? (
                            <Dropzone 
                                onFilesAdded={addFiles} 
                                onVisibleCapture={handleVisibleCapture} 
                                onGuidedCapture={() => setIsInstructionModalOpen(true)} 
                            />
                        ) : (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 h-full overflow-y-auto pr-2">
                                <AnimatePresence>
                                {images.map((image, index) => (
                                    <motion.div
                                        key={image.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        draggable
                                        onDragStart={() => (dragItem.current = index)}
                                        onDragEnter={() => (dragOverItem.current = index)}
                                        onDragEnd={handleDragSort}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="relative group aspect-w-10 aspect-h-16 bg-[#2d3748] rounded-lg overflow-hidden shadow-lg cursor-grab active:cursor-grabbing"
                                    >
                                        <img src={image.src} alt={image.name} className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteImage(image.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                    
                    {images.length > 0 && (
                        <div className="flex-shrink-0 pt-4 border-t border-white/10">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm font-medium">{images.length} imágenes</p>
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <Button variant="outline" onClick={() => setIsInstructionModalOpen(true)} className="text-white">Añadir Captura Completa</Button>
                                    <Button variant="outline" onClick={handleVisibleCapture} className="text-white">Añadir Área Visible</Button>
                                    <Button variant="ghost" onClick={handleClearAll} className="text-red-400 hover:bg-red-400/10 hover:text-red-400">
                                        <Brush className="mr-2"/>
                                        Limpiar todo
                                    </Button>
                                    <Button
                                        onClick={handleGeneratePdf}
                                        disabled={isGenerating}
                                        className="bg-[#10B981] hover:bg-[#059669] min-w-[150px]"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <FileDown className="mr-2" />
                                        )}
                                        {isGenerating ? 'Generando...' : 'Generar PDF'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <InstructionModal 
                isOpen={isInstructionModalOpen}
                onClose={() => setIsInstructionModalOpen(false)}
                onUpload={() => {
                    setIsInstructionModalOpen(false);
                    openUploadDialog();
                }}
            />
        </>
    );
};

export default ScreenshotManagerModal;
