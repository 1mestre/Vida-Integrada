
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileImage } from 'lucide-react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose, onUpload }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d3748] border-[#8B5CF6]/50 text-[#f7fafc] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Guía para Captura de Página Completa</DialogTitle>
          <DialogDescription className="text-[#edf2f7]/80">
            Sigue estos pasos para tomar una captura de pantalla de toda la página del contrato.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="chrome" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a202c]">
            <TabsTrigger value="chrome">Google Chrome</TabsTrigger>
            <TabsTrigger value="firefox">Firefox / Edge</TabsTrigger>
          </TabsList>
          <TabsContent value="chrome" className="mt-4 text-sm space-y-3">
            <p>1. Abre las Herramientas de Desarrollador presionando <kbd className="bg-[#1a202c] rounded px-1.5 py-0.5 border border-white/20">Ctrl+Shift+I</kbd> (Windows) o <kbd className="bg-[#1a202c] rounded px-1.5 py-0.5 border border-white/20">Cmd+Option+I</kbd> (Mac).</p>
            <p>2. Abre el menú de comandos presionando <kbd className="bg-[#1a202c] rounded px-1.5 py-0.5 border border-white/20">Ctrl+Shift+P</kbd> (Windows) o <kbd className="bg-[#1a202c] rounded px-1.5 py-0.5 border border-white/20">Cmd+Shift+P</kbd> (Mac).</p>
            <p>3. Escribe "screenshot" en la barra de comandos.</p>
            <p>4. Selecciona la opción <span className="font-semibold text-[#8B5CF6]">"Capture full size screenshot"</span> y presiona Enter.</p>
            <p>5. El navegador descargará la imagen. Vuelve aquí y súbela con el botón de abajo.</p>
          </TabsContent>
          <TabsContent value="firefox" className="mt-4 text-sm space-y-3">
             <p>1. Haz clic derecho en cualquier parte vacía de la página del contrato.</p>
             <p>2. En el menú contextual, selecciona la opción <span className="font-semibold text-[#8B5CF6]">"Hacer una captura de pantalla"</span>.</p>
             <p>3. En la parte superior derecha, selecciona la opción <span className="font-semibold text-[#8B5CF6]">"Guardar página completa"</span>.</p>
             <p>4. Haz clic en el botón "Descargar".</p>
             <p>5. El navegador descargará la imagen. Vuelve aquí y súbela con el botón de abajo.</p>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="text-white">Cancelar</Button>
          </DialogClose>
          <Button onClick={onUpload} className="bg-[#8B5CF6] hover:bg-[#7c3aed]">
            <FileImage className="mr-2 h-4 w-4"/>
            ¡Listo! Subir mi captura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionModal;
