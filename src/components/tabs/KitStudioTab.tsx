
"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { useAppState, SoundLibraryItem, SoundType } from '@/context/AppStateContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, ListFilter, Play, Trash2, Loader2, Music4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';


const soundCategories: SoundType[] = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Hi-Hat Closed', 'Perc', 'Rim', '808 & Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'Sin Categoría'];

const KitStudioTab = () => {
  const { appState, setAppState } = useAppState();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string[]>([]);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlaySound = (url: string) => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    setActiveAudio(audio);
    audio.play().catch(e => console.error("Error playing audio:", e));
  };
  
  const handleTypeChange = (id: string, newType: SoundType) => {
    setAppState(prevState => ({
        ...prevState,
        soundLibrary: prevState.soundLibrary.map(item => 
            item.id === id ? { ...item, soundType: newType } : item
        )
    }));
  };

  const handleKeyChange = (id: string, newKey: string) => {
     setAppState(prevState => ({
        ...prevState,
        soundLibrary: prevState.soundLibrary.map(item => 
            item.id === id ? { ...item, key: newKey || null } : item
        )
    }));
  };

  const handleDeleteSound = (id: string) => {
    setAppState(prevState => ({
        ...prevState,
        soundLibrary: prevState.soundLibrary.filter(item => item.id !== id)
    }));
  };

  const handleFileUpload = useCallback(async (file: File, originalName: string) => {
    // This is a simulation. In the next step, we'll replace this with a real API call.
    return new Promise<SoundLibraryItem>(resolve => {
        setTimeout(() => {
            const randomCategoryIndex = Math.floor(Math.random() * (soundCategories.length - 1));
            const newItem: SoundLibraryItem = {
                id: uuidv4(),
                originalName,
                storageUrl: URL.createObjectURL(file), // Temporary local URL for preview
                soundType: soundCategories[randomCategoryIndex],
                key: ['C', 'G', 'Am', null][Math.floor(Math.random() * 4)],
            };
            resolve(newItem);
        }, 300 + Math.random() * 500); // Faster simulation
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      setIsProcessing(true);
      setProcessingStatus([`Iniciando proceso para ${acceptedFiles.length} archivo(s)...`]);

      const audioFilesToProcess: { file: File, name: string }[] = [];

      for (const file of acceptedFiles) {
          setProcessingStatus(prev => [...prev, `Leyendo ${file.name}...`]);
          if (file.name.toLowerCase().endsWith('.zip')) {
              try {
                const zip = await JSZip.loadAsync(file);
                let foundInZip = 0;
                const zipPromises = [];

                for (const relativePath in zip.files) {
                    const zipEntry = zip.files[relativePath];

                    // Skip directories and Mac-specific metadata folders
                    if (zipEntry.dir || relativePath.startsWith('__MACOSX/')) {
                        continue;
                    }
                    
                    const normalizedName = zipEntry.name.trim().toLowerCase();
                    if (normalizedName.endsWith('.wav') || normalizedName.endsWith('.mp3')) {
                        foundInZip++;
                        const promise = async () => {
                            const fileData = await zipEntry.async('blob');
                            const audioFile = new File([fileData], zipEntry.name.split('/').pop() || zipEntry.name, { type: fileData.type });
                            audioFilesToProcess.push({ file: audioFile, name: audioFile.name });
                        };
                        zipPromises.push(promise());
                    }
                }
                await Promise.all(zipPromises);
                setProcessingStatus(prev => [...prev, `Se encontraron ${foundInZip} sonidos en ${file.name}.`]);
              } catch (e) {
                console.error("Error al descomprimir el ZIP:", e);
                setProcessingStatus(prev => [...prev, `Error al leer ${file.name}`]);
                toast({
                  variant: "destructive",
                  title: "Error de ZIP",
                  description: `No se pudo procesar el archivo ${file.name}.`,
                });
              }
          } else if (file.type.startsWith('audio/')) {
              audioFilesToProcess.push({ file: file, name: file.name });
          }
      }
      
      if (audioFilesToProcess.length === 0) {
        toast({
          variant: "destructive",
          title: "No se encontraron archivos",
          description: "No se encontraron archivos de audio (.wav o .mp3) válidos en la selección.",
        });
        setIsProcessing(false);
        setProcessingStatus([]);
        return;
      }

      setProcessingStatus(prev => [...prev, `Procesando ${audioFilesToProcess.length} sonidos...`]);

      const newLibraryItems = await Promise.all(
          audioFilesToProcess.map(f => handleFileUpload(f.file, f.name))
      );

      setAppState(prevState => ({
          ...prevState,
          soundLibrary: [...prevState.soundLibrary, ...newLibraryItems]
      }));
      
      toast({
        title: "¡Éxito!",
        description: `Se añadieron ${newLibraryItems.length} nuevos sonidos a tu librería.`,
      });

      setIsProcessing(false);
      setProcessingStatus([]);

  }, [handleFileUpload, setAppState, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
          'audio/wav': ['.wav'],
          'audio/mpeg': ['.mp3'],
          'application/zip': ['.zip'],
      }
  });

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">Kit Studio</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gestiona tu librería de sonidos y ensambla tus próximos drum kits con la ayuda de IA.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="glassmorphism-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Librería Central</CardTitle>
            <CardDescription>Sube, busca y categoriza todos tus sonidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div {...getRootProps()} className={cn("border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors", isDragActive && "border-primary bg-primary/10")}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="mt-4 text-sm text-primary">Procesando archivos...</p>
                    <ScrollArea className="h-24 w-full text-left text-xs bg-background/50 p-2 rounded-md">
                      {processingStatus.map((status, i) => <p key={i}>{status}</p>)}
                    </ScrollArea>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Arrastra un .zip o archivos de audio aquí</p>
                    <Button variant="outline">O selecciona archivos</Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar en la librería..." className="pl-10" />
              </div>
              <Select>
                  <SelectTrigger className="w-[180px]">
                      <ListFilter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                      {soundCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-96 rounded-md border">
              <div className='p-4 space-y-2'>
                {appState.soundLibrary.length === 0 && !isProcessing ? (
                  <p className="text-muted-foreground text-center py-16">
                    Tu librería está vacía. ¡Sube algunos sonidos para empezar!
                  </p>
                ) : (
                  appState.soundLibrary.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handlePlaySound(item.storageUrl)}><Play className="h-4 w-4"/></Button>
                      <p className="flex-grow text-sm truncate" title={item.originalName}>{item.originalName}</p>
                      <Select value={item.soundType} onValueChange={(v) => handleTypeChange(item.id, v as SoundType)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs shrink-0"><SelectValue/></SelectTrigger>
                          <SelectContent>{soundCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                      </Select>
                       <Input 
                          placeholder="Key" 
                          value={item.key || ''}
                          onChange={(e) => handleKeyChange(item.id, e.target.value)}
                          className="w-[70px] h-8 text-xs shrink-0" 
                       />
                       <Button size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => handleDeleteSound(item.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="glassmorphism-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Ensamblador de Kits</CardTitle>
            <CardDescription>Crea un nuevo kit arrastrando sonidos desde la librería.</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px] flex items-center justify-center">
            <div className='text-center text-muted-foreground'>
              <Music4 className="mx-auto h-16 w-16" />
              <p className="mt-4">
                El ensamblador de kits estará aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KitStudioTab;

    