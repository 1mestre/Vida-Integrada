
"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { useAppState, SoundLibraryItem, SoundType, DrumKitProject } from '@/context/AppStateContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, ListFilter, Play, Trash2, Loader2, Music4, PlusCircle, Sparkles, Image as ImageIcon, Download, Edit, ZoomIn, Quote, ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { generateKitNames } from '@/ai/flows/generate-kit-names-flow';
import { categorizeSound } from '@/ai/flows/categorizeSoundFlow';
import { renameSound } from '@/ai/flows/renameSoundFlow';
import { generateCoverArt } from '@/ai/flows/generateCoverArtFlow';
import { uploadSound } from '@/ai/flows/uploadSoundFlow';
import { uploadCoverArt } from '@/ai/flows/uploadCoverArtFlow';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from '../ui/separator';


const soundCategories: SoundType[] = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Perc', 'Rim', '808', 'Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'EXTRAS'];

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const KitStudioTab = () => {
  const { appState, setAppState } = useAppState();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string[]>([]);
  const activeAudio = useRef<HTMLAudioElement | null>(null);
  
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SoundType | 'all'>('all');
  
  const [currentKitName, setCurrentKitName] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [lastEnhancedPrompt, setLastEnhancedPrompt] = useState<string | null>(null);


  useEffect(() => {
    if (!activeProjectId && appState.drumKitProjects.length > 0) {
        setActiveProjectId(appState.drumKitProjects[0].id);
    }
  }, [appState.drumKitProjects, activeProjectId]);
  
  const activeProject = useMemo(() => {
      return appState.drumKitProjects.find(p => p.id === activeProjectId);
  }, [appState.drumKitProjects, activeProjectId]);
  
  useEffect(() => {
    if (activeProject) {
        setCurrentKitName(activeProject.name);
        setImagePrompt(activeProject.imagePrompt || '');
    } else {
        setCurrentKitName('');
        setImagePrompt('');
        setLastEnhancedPrompt(null);
    }
  }, [activeProject]);
  
  const handleUpdateKitName = (newName: string) => {
    if (!activeProjectId) return;
    setAppState(prevState => ({
      ...prevState,
      drumKitProjects: prevState.drumKitProjects.map(p => 
        p.id === activeProjectId ? { ...p, name: newName.trim() } : p
      )
    }));
  };
  
  const onKitNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    if (!activeProjectId || !newName || newName === activeProject?.name) return;
    handleUpdateKitName(newName);
    toast({ title: "Nombre del kit actualizado" });
  };
  
  const onSuggestedNameClick = (name: string) => {
    setCurrentKitName(name); // update local state for input
    handleUpdateKitName(name); // update global state immediately
    toast({ title: "Nombre del kit actualizado", description: `Has seleccionado "${name}".` });
  };


  const handlePlaySound = useCallback((url: string) => {
    if (!url || !url.startsWith('http')) {
      toast({
        variant: "destructive",
        title: "URL de Sonido Inválida",
        description: "Este sonido no tiene una fuente válida. Intenta subirlo de nuevo.",
      });
      return;
    }

    if (activeAudio.current) {
        if (activeAudio.current.src === url && !activeAudio.current.paused) {
            activeAudio.current.pause();
            return;
        }
        activeAudio.current.pause();
    }
    
    const audio = new Audio(url);
    activeAudio.current = audio;
    audio.play().catch(e => {
      if (e.name === 'AbortError') {
        // This is a normal interruption, no need to show an error.
        return;
      }
      console.error("Error playing audio:", e);
      toast({
        variant: "destructive",
        title: "Error de Reproducción",
        description: "No se pudo cargar el audio. La URL puede ser inválida o el archivo está corrupto."
      })
    });
  }, [toast]);
  
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
    const soundToDelete = appState.soundLibrary.find(item => item.id === id);
    if (!soundToDelete) return;

    setAppState(prevState => {
      const updatedProjects = prevState.drumKitProjects.map(proj => {
        const soundIndex = proj.soundIds.indexOf(id);
        if (soundIndex > -1) {
          const newSoundIds = [...proj.soundIds];
          newSoundIds.splice(soundIndex, 1);
          const newSoundNamesInKit = { ...proj.soundNamesInKit };
          delete newSoundNamesInKit[id];
          return { ...proj, soundIds: newSoundIds, soundNamesInKit: newSoundNamesInKit };
        }
        return proj;
      });

      return {
        ...prevState,
        soundLibrary: prevState.soundLibrary.filter(item => item.id !== id),
        drumKitProjects: updatedProjects,
      }
    });

    toast({
      title: "Sonido Eliminado",
      description: `"${soundToDelete.originalName}" ha sido borrado de tu librería.`,
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsProcessing(true);
    setProcessingStatus([`Iniciando proceso para ${acceptedFiles.length} archivo(s)...`]);
    const audioFilesToProcess: { file: File, name: string }[] = [];

    // Helper to process ZIP files
    const processZip = async (zipFile: File) => {
      try {
        setProcessingStatus(prev => [...prev, `Leyendo ${zipFile.name}...`]);
        const zip = await JSZip.loadAsync(zipFile);
        const zipPromises: Promise<void>[] = [];
        let foundInZip = 0;
        zip.forEach((relativePath, zipEntry) => {
          if (zipEntry.dir || relativePath.startsWith('__MACOSX/') || !(zipEntry.name.toLowerCase().endsWith('.wav') || zipEntry.name.toLowerCase().endsWith('.mp3'))) {
            return;
          }
          foundInZip++;
          const promise = async () => {
            const fileData = await zipEntry.async('blob');
            const audioFile = new File([fileData], zipEntry.name.split('/').pop() || zipEntry.name, { type: fileData.type });
            audioFilesToProcess.push({ file: audioFile, name: audioFile.name });
          };
          zipPromises.push(promise());
        });
        await Promise.all(zipPromises);
        setProcessingStatus(prev => [...prev, `Se encontraron ${foundInZip} sonidos en ${zipFile.name}.`]);
      } catch (e) {
        console.error("Error al descomprimir el ZIP:", e);
        setProcessingStatus(prev => [...prev, `Error al leer ${zipFile.name}`]);
        toast({ variant: "destructive", title: "Error de ZIP", description: `No se pudo procesar el archivo ${zipFile.name}.` });
      }
    };

    // Iterate through dropped files
    for (const file of acceptedFiles) {
      if (file.type.startsWith('audio/')) {
        audioFilesToProcess.push({ file: file, name: file.name });
      } else if (file.name.toLowerCase().endsWith('.zip')) {
        await processZip(file);
      }
    }
    
    if (audioFilesToProcess.length === 0) {
      if (acceptedFiles.length > 0) {
        toast({ variant: "destructive", title: "No se encontraron archivos", description: "No se encontraron archivos de audio (.wav o .mp3) válidos en la selección." });
      }
      setIsProcessing(false);
      setProcessingStatus([]);
      return;
    }

    setProcessingStatus(prev => [...prev, `Procesando ${audioFilesToProcess.length} sonidos...`]);

    const newLibraryItems: SoundLibraryItem[] = [];
    for (const f of audioFilesToProcess) {
      try {
        setProcessingStatus(prev => [...prev, `Subiendo ${f.name}...`]);
        const soundDataUri = await fileToDataUri(f.file);
        const storageUrl = await uploadSound({ soundDataUri, filename: f.name });

        setProcessingStatus(prev => [...prev, `Categorizando ${f.name}...`]);
        const { soundType, key } = await categorizeSound({ filename: f.name });

        newLibraryItems.push({
          id: uuidv4(),
          originalName: f.name,
          storageUrl,
          soundType,
          key,
        });
        setProcessingStatus(prev => [...prev, `✅ Procesado: ${f.name}`]);
      } catch (error) {
        setProcessingStatus(prev => [...prev, `❌ Error en ${f.name}`]);
        console.error(`Error procesando ${f.name}:`, error);
        toast({
          variant: "destructive",
          title: "Error de Procesamiento",
          description: `No se pudo procesar el archivo ${f.name}.`,
        });
      }
    }

    setAppState(prevState => ({
      ...prevState,
      soundLibrary: [...prevState.soundLibrary, ...newLibraryItems]
    }));
    
    toast({ title: "¡Éxito!", description: `Se añadieron ${newLibraryItems.length} nuevos sonidos a tu librería.` });
    setIsProcessing(false);
    setProcessingStatus([]);
  }, [setAppState, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { 
        'audio/wav': ['.wav'], 
        'audio/mpeg': ['.mp3'], 
        'application/zip': ['.zip']
      }
  });

  const onCoverDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!activeProject || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setIsUploadingCover(true);
    toast({ title: "Subiendo carátula personalizada..." });

    try {
      const imageDataUri = await fileToDataUri(file);
      const finalUrl = await uploadCoverArt({ imageDataUri });

      setAppState(prevState => ({
        ...prevState,
        drumKitProjects: prevState.drumKitProjects.map(p => 
          p.id === activeProjectId ? { ...p, coverArtUrl: finalUrl } : p
        )
      }));

      toast({ title: "¡Éxito!", description: "Tu carátula personalizada ha sido subida." });

    } catch (error) {
      console.error("Error uploading custom cover art:", error);
      toast({
        variant: "destructive",
        title: "Error de Subida",
        description: `No se pudo subir la carátula. ${error instanceof Error ? error.message : ''}`,
      });
    } finally {
      setIsUploadingCover(false);
    }
  }, [activeProject, activeProjectId, setAppState, toast]);

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({
      onDrop: onCoverDrop,
      accept: { 
        'image/jpeg': ['.jpeg', '.jpg'], 
        'image/png': ['.png'],
        'image/webp': ['.webp'],
      },
      multiple: false
  });


  const handleCreateNewKit = () => {
    const todayStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
    const baseName = `Nuevo Kit - ${todayStr}`;
    const existingNames = new Set(appState.drumKitProjects.map(p => p.name));
    let finalName = baseName;
    let suffixCounter = 0;
    while (existingNames.has(finalName)) {
      finalName = `${baseName} ${String.fromCharCode(65 + suffixCounter)}`;
      suffixCounter++;
    }

    const newKit: DrumKitProject = {
      id: Date.now(), name: finalName, coverArtUrl: null, imagePrompt: '',
      seoNames: [], soundIds: [], soundNamesInKit: {},
    };

    setAppState(prevState => ({ ...prevState, drumKitProjects: [...prevState.drumKitProjects, newKit] }));
    setActiveProjectId(newKit.id);
  };
  
  const handleDeleteKit = (kitId: number) => {
    setAppState(prevState => {
      const updatedProjects = prevState.drumKitProjects.filter(p => p.id !== kitId);
      if (activeProjectId === kitId) {
        setActiveProjectId(updatedProjects[0]?.id || null);
      }
      return { ...prevState, drumKitProjects: updatedProjects };
    });
    toast({ title: 'Kit eliminado', description: 'El proyecto del kit ha sido borrado.' });
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, soundId: string) => {
      e.dataTransfer.setData("soundId", soundId);
  };

  const handleDropOnAssembler = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!activeProject) {
          toast({ variant: 'destructive', title: "No hay un kit seleccionado", description: "Por favor, crea o selecciona un kit antes de añadirle sonidos." });
          return;
      }
      const soundId = e.dataTransfer.getData("soundId");
      const sound = appState.soundLibrary.find(s => s.id === soundId);
      
      if (!sound || activeProject.soundIds.includes(soundId)) return;
      
      // Add sound immediately with a placeholder name
      setAppState(prevState => ({
        ...prevState,
        drumKitProjects: prevState.drumKitProjects.map(p => {
            if (p.id === activeProjectId) {
                const newSoundIds = [...p.soundIds, soundId];
                const newSoundNamesInKit = { ...p.soundNamesInKit, [soundId]: 'Generando nombre...' };
                return { ...p, soundIds: newSoundIds, soundNamesInKit: newSoundNamesInKit };
            }
            return p;
        })
      }));

      // Then, call the AI to get the real name
      try {
        const descriptionForAI = imagePrompt || activeProject.imagePrompt || 'general purpose';
        const { newName } = await renameSound({ originalName: sound.originalName, kitDescription: descriptionForAI, soundType: sound.soundType });
        setAppState(prevState => ({
            ...prevState,
            drumKitProjects: prevState.drumKitProjects.map(p => {
                if (p.id === activeProjectId) {
                    const newSoundNamesInKit = { ...p.soundNamesInKit, [soundId]: newName };
                    return { ...p, soundNamesInKit: newSoundNamesInKit };
                }
                return p;
            })
        }));
      } catch (error) {
         setAppState(prevState => ({
            ...prevState,
            drumKitProjects: prevState.drumKitProjects.map(p => {
                if (p.id === activeProjectId) {
                    const newSoundNamesInKit = { ...p.soundNamesInKit, [soundId]: `${sound.originalName} - ${sound.soundType}` };
                    return { ...p, soundNamesInKit: newSoundNamesInKit };
                }
                return p;
            })
        }));
        toast({ variant: "destructive", title: "Error de IA", description: "No se pudo generar el nuevo nombre." });
      }
  };
  
  const handleRemoveFromKit = (soundIdToRemove: string) => {
      if (!activeProjectId) return;
      setAppState(prevState => ({
           ...prevState,
           drumKitProjects: prevState.drumKitProjects.map(p => {
                if (p.id === activeProjectId) {
                    const newSoundIds = p.soundIds.filter(id => id !== soundIdToRemove);
                    const newSoundNamesInKit = { ...p.soundNamesInKit };
                    delete newSoundNamesInKit[soundIdToRemove];
                    return { ...p, soundIds: newSoundIds, soundNamesInKit: newSoundNamesInKit };
                }
                return p;
           })
      }));
  };

  const handleDownloadKit = async () => {
    if (!activeProject || activeProject.soundIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Kit Vacío",
        description: "Añade sonidos al kit antes de descargarlo.",
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Iniciando descarga...",
      description: `Preparando "${activeProject.name}.zip". Esto puede tardar un momento.`,
    });

    const zip = new JSZip();

    try {
        // Add README.txt to the root of the zip
        const readmeContent = `Hey! Thanks for downloading! <3\n\nAll sounds are free to use, hope you make some fire beats with them! :D\n\nEnjoy! :)\n\n- Danodals`;
        zip.file('README.txt', readmeContent);

        // Handle cover art at the root level
        if (activeProject.coverArtUrl) {
            try {
                const response = await fetch(`/api/r2-proxy?url=${encodeURIComponent(activeProject.coverArtUrl)}`);
                if (response.ok) {
                    const blob = await response.blob();
                    const extension = blob.type.split('/')[1] || 'png';
                    zip.file(`cover.${extension}`, blob);
                } else {
                    console.error("Failed to fetch cover art, status:", response.status);
                }
            } catch (e) {
                console.error("Error fetching cover art:", e);
            }
        }
        
        // Fetch all sound blobs in parallel
        const soundFetchPromises = activeProject.soundIds.map(soundId => {
            const soundInfo = appState.soundLibrary.find(s => s.id === soundId);
            if (!soundInfo || !soundInfo.storageUrl) return Promise.resolve(null);
            
            return fetch(`/api/r2-proxy?url=${encodeURIComponent(soundInfo.storageUrl)}`)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch ${soundInfo.originalName}`);
                    return response.blob();
                })
                .then(blob => ({ soundInfo, blob }))
                .catch(e => {
                    console.error(`Error downloading sound ${soundInfo.originalName}:`, e);
                    toast({ variant: "destructive", title: `Error en Sonido`, description: `No se pudo descargar "${soundInfo.originalName}".` });
                    return null;
                });
        });

        const fetchedSounds = (await Promise.all(soundFetchPromises)).filter(Boolean);

        // Add fetched sounds to the zip with correct folder structure
        for (const { soundInfo, blob } of fetchedSounds) {
            const nameInKit = activeProject.soundNamesInKit[soundInfo.id];
            if (!nameInKit) continue;

            const creativeName = nameInKit.replace(` - ${soundInfo.soundType}`, '').trim();
            const extension = soundInfo.originalName.split('.').pop() || 'wav';
            const finalName = `${creativeName} (DNDLS) - ${soundInfo.soundType}, ${activeProject.name}.${extension}`;
            
            let categoryFolder;
            if (soundInfo.soundType === 'Hi-Hat Open') {
                categoryFolder = zip.folder('Hi-Hat')?.folder('Open');
            } else {
                categoryFolder = zip.folder(soundInfo.soundType);
            }

            categoryFolder?.file(finalName, blob);
        }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${activeProject.name}.zip`);

    } catch (error) {
      console.error("Error creating zip file:", error);
      toast({
        variant: "destructive",
        title: "Error de Descarga",
        description: "No se pudo generar el archivo ZIP.",
      });
    } finally {
      setIsDownloading(false);
    }
  };


  const filteredSoundLibrary = useMemo(() => {
    return appState.soundLibrary.filter(item => {
        const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || item.soundType === filterType;
        return matchesSearch && matchesFilter;
    });
  }, [appState.soundLibrary, searchTerm, filterType]);

  const handleGenerateNames = async () => {
    if (!activeProject || !imagePrompt) {
        toast({ variant: "destructive", title: "Error", description: "Por favor, escribe una descripción para el kit." });
        return;
    }
    setIsGeneratingNames(true);
    setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, imagePrompt: imagePrompt } : p) }));
    try {
        const result = await generateKitNames({ prompt: imagePrompt });
        setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, seoNames: result.names } : p) }));
        toast({ title: "Nombres generados", description: "La IA ha sugerido algunos nombres para tu kit." });
    } catch (error) {
        console.error("Error generating names:", error);
        toast({ variant: "destructive", title: "Error de IA", description: "No se pudieron generar los nombres." });
    } finally {
        setIsGeneratingNames(false);
    }
  };

  const handleGenerateArt = async () => {
    if (!activeProject) {
        toast({ variant: "destructive", title: "Error", description: "Por favor, crea o selecciona un kit primero." });
        return;
    }
    if (!imagePrompt) {
        toast({ variant: "destructive", title: "Error", description: "La descripción para la IA no puede estar vacía." });
        return;
    }
    if (!currentKitName.trim()) {
        toast({ variant: "destructive", title: "Error", description: "El nombre del kit no puede estar vacío para generar la carátula." });
        return;
    }

    setIsGeneratingArt(true);
    setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, imagePrompt: imagePrompt, name: currentKitName.trim() } : p) }));
    
    const result = await generateCoverArt({ prompt: imagePrompt, kitName: currentKitName.trim() });
    
    setLastEnhancedPrompt(result.enhancedPrompt);

    if (result.error) {
        toast({ variant: "destructive", title: "Error de IA", description: result.error });
    } else if (result.finalUrl) {
        setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, coverArtUrl: result.finalUrl } : p) }));
        toast({ title: "¡Carátula generada!", description: "La nueva imagen para tu kit está lista." });
    }
    
    setIsGeneratingArt(false);
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">Kit Studio</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gestiona tu librería de sonidos y ensambla tus próximos drum kits con la ayuda de IA.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Librería Central */}
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
                <Input placeholder="Buscar en la librería..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as SoundType | 'all')}>
                  <SelectTrigger className="w-[180px]">
                      <ListFilter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {soundCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-96 rounded-md border">
              <div className='p-4 space-y-2'>
                <AnimatePresence>
                  {filteredSoundLibrary.length === 0 && !isProcessing ? (
                    <p className="text-muted-foreground text-center py-16">
                      Tu librería está vacía o no hay coincidencias.
                    </p>
                  ) : (
                    filteredSoundLibrary.map(item => (
                      <motion.div 
                        key={item.id} layout initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        draggable onDragStart={(e) => handleDragStart(e, item.id)}
                        className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 cursor-grab active:cursor-grabbing">
                        <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => handlePlaySound(item.storageUrl)}><Play className="h-4 w-4"/></Button>
                        <p className="flex-grow text-sm truncate" title={item.originalName}>{item.originalName}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Select value={item.soundType} onValueChange={(v) => handleTypeChange(item.id, v as SoundType)}>
                              <SelectTrigger className="w-[130px] h-8 text-xs shrink-0"><SelectValue/></SelectTrigger>
                              <SelectContent>{soundCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Key" value={item.key || ''} onChange={(e) => handleKeyChange(item.id, e.target.value)} className="w-[70px] h-8 text-xs shrink-0" />
                          <Button size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => handleDeleteSound(item.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ensamblador de Kits */}
        <Card className="glassmorphism-card lg:col-span-1" onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnAssembler}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ensamblador de Kits</CardTitle>
              <Button onClick={handleDownloadKit} disabled={!activeProject || activeProject.soundIds.length === 0 || isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Descargar Kit
              </Button>
            </div>
            <CardDescription>Arrastra sonidos aquí para crear y personalizar tus kits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2 items-center">
                 <Select value={activeProjectId?.toString() || ''} onValueChange={(v) => setActiveProjectId(Number(v))}>
                   <SelectTrigger className='w-full'><SelectValue placeholder="Selecciona un kit..."/></SelectTrigger>
                   <SelectContent>{appState.drumKitProjects.map(proj => (<SelectItem key={proj.id} value={proj.id.toString()}>{proj.name}</SelectItem>))}</SelectContent>
                 </Select>
                  <Button onClick={handleCreateNewKit}><PlusCircle className='h-4 w-4'/></Button>
                  {activeProject && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>¿Seguro que quieres eliminar este kit?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se borrará permanentemente el proyecto del kit "{activeProject.name}". Los sonidos originales permanecerán en tu librería.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteKit(activeProject.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
              </div>
              
              <Separator />

              {activeProject ? (
                <div className="space-y-4">
                  <div className='p-4 border rounded-lg space-y-4 bg-background/30'>
                    <div {...getCoverRootProps()} className={cn("border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/20 transition-colors", isUploadingCover && "border-primary bg-primary/10")}>
                      <input {...getCoverInputProps()} />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isUploadingCover ? (
                          <>
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-primary">Subiendo carátula...</p>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Arrastra una imagen aquí o haz clic para subir una carátula personalizada</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center my-2">
                      <Separator className="flex-grow" />
                      <span className="absolute px-2 bg-background/30 text-xs text-muted-foreground">Ó</span>
                    </div>
                  
                    <div className='flex gap-4 items-start'>
                        <div className='w-32 h-32 rounded-md bg-muted flex-shrink-0 relative flex items-center justify-center group'>
                          {isGeneratingArt ? <Loader2 className="animate-spin h-8 w-8"/> : 
                            activeProject.coverArtUrl ? (
                              <a href={activeProject.coverArtUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-pointer">
                                <Image src={activeProject.coverArtUrl} alt="Kit cover art" layout="fill" className="object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                                  <ZoomIn className="h-8 w-8 text-white" />
                                </div>
                              </a>
                            ) :
                            <ImageIcon className="h-8 w-8 text-muted-foreground"/>
                          }
                        </div>
                        <div className='space-y-4 flex-grow'>
                            <div>
                                <Label htmlFor="kit-prompt">1. Describe el concepto con IA</Label>
                                <Input id="kit-prompt" placeholder="Ej: Dark trap, estilo Travis Scott..." value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}/>
                            </div>
                             <Button onClick={handleGenerateNames} disabled={isGeneratingNames || !imagePrompt} size="sm" variant="outline" className="w-full text-purple-400 border-purple-400/50 hover:bg-purple-400/10 hover:text-purple-300">
                                <Sparkles className='mr-2'/>Sugerir Nombres
                            </Button>
                            <div>
                                <Label htmlFor="kit-name">2. Nombre final para carátula</Label>
                                <Input 
                                  id="kit-name"
                                  value={currentKitName}
                                  onChange={(e) => setCurrentKitName(e.target.value)}
                                  onBlur={onKitNameBlur}
                                  placeholder="Escribe el nombre del kit"
                                />
                            </div>
                        </div>
                    </div>
                     <div className="flex flex-col gap-2">
                        <Button onClick={handleGenerateArt} disabled={isGeneratingArt || !imagePrompt || !currentKitName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
                            <ImageIcon className='mr-2 h-4 w-4'/>Generar Carátula con IA
                        </Button>
                     </div>
                     {activeProject.seoNames.length > 0 && (
                        <div className="space-y-2">
                          <Label>Nombres Sugeridos:</Label>
                          <div className="flex flex-wrap gap-2">{activeProject.seoNames.map((name, i) => (<Badge key={i} variant="outline" className="cursor-pointer" onClick={() => onSuggestedNameClick(name)}>{name}</Badge>))}</div>
                        </div>
                      )}
                      {lastEnhancedPrompt && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full mt-2">
                                    <Quote className="mr-2 h-4 w-4" />
                                    Ver Prompt Final Usado
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Prompt Final Generado por IA</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Este fue el prompt mejorado que se utilizó para generar la última carátula. Puedes copiarlo para usarlo como referencia.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-4">
                                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                                        {lastEnhancedPrompt}
                                    </pre>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cerrar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                        navigator.clipboard.writeText(lastEnhancedPrompt);
                                        toast({ title: "Prompt copiado!" });
                                    }}>
                                        <ClipboardCopy className="mr-2 h-4 w-4" />
                                        Copiar Prompt
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </div>
                  
                  <ScrollArea className={cn("h-[250px] rounded-md border p-4 space-y-2", activeProjectId && "border-primary/50")}>
                    <AnimatePresence>
                    {activeProject.soundIds.length === 0 ? (
                        <div className='text-center text-muted-foreground pt-16'><p>Arrastra y suelta sonidos aquí.</p></div>
                    ) : (
                        activeProject.soundIds.map(soundId => {
                          const soundInfo = appState.soundLibrary.find(s => s.id === soundId);
                          const nameInKit = activeProject.soundNamesInKit[soundId] || soundInfo?.originalName || 'Cargando...';
                          const isLoadingName = nameInKit === 'Generando nombre...';

                          return (
                            <motion.div
                              key={soundId} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
                            >
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => soundInfo && handlePlaySound(soundInfo.storageUrl)} disabled={!soundInfo}><Play className="h-4 w-4"/></Button>
                              <p className="flex-grow text-sm truncate" title={soundInfo?.originalName}>
                                  {isLoadingName ? 
                                    <span className='flex items-center gap-2 text-muted-foreground'><Loader2 className='h-4 w-4 animate-spin'/>Generando...</span> 
                                    : nameInKit
                                  }
                              </p>
                              {soundInfo && <Badge variant="outline" className="text-xs">{soundInfo.soundType}</Badge>}
                              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleRemoveFromKit(soundId)}><Trash2 className="h-4 w-4"/></Button>
                            </motion.div>
                          )
                        })
                    )}
                    </AnimatePresence>
                  </ScrollArea>
                </div>
              ) : (
                <div className='text-center text-muted-foreground h-[50vh] flex flex-col items-center justify-center'>
                    <Music4 className="mx-auto h-16 w-16" />
                    <p className="mt-4">Crea un nuevo kit o selecciona uno para empezar.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KitStudioTab;
