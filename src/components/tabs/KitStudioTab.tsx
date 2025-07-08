
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { useAppState, SoundLibraryItem, SoundType, DrumKitProject } from '@/context/AppStateContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, ListFilter, Play, Trash2, Loader2, Music4, PlusCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { generateKitNames } from '@/ai/flows/generate-kit-names-flow';
import { categorizeSound } from '@/ai/flows/categorizeSoundFlow';
import { renameSound } from '@/ai/flows/renameSoundFlow';
import { generateCoverArt } from '@/ai/flows/generateCoverArtFlow';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const soundCategories: SoundType[] = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Hi-Hat Closed', 'Perc', 'Rim', '808 & Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'Sin Categoría'];

const KitStudioTab = () => {
  const { appState, setAppState } = useAppState();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string[]>([]);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SoundType | 'all'>('all');

  useEffect(() => {
    if (!activeProjectId && appState.drumKitProjects.length > 0) {
        setActiveProjectId(appState.drumKitProjects[0].id);
    }
  }, [appState.drumKitProjects, activeProjectId]);

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

    for (const file of acceptedFiles) {
        setProcessingStatus(prev => [...prev, `Leyendo ${file.name}...`]);
        if (file.name.toLowerCase().endsWith('.zip')) {
            try {
              const zip = await JSZip.loadAsync(file);
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
              setProcessingStatus(prev => [...prev, `Se encontraron ${foundInZip} sonidos en ${file.name}.`]);
            } catch (e) {
              console.error("Error al descomprimir el ZIP:", e);
              setProcessingStatus(prev => [...prev, `Error al leer ${file.name}`]);
              toast({ variant: "destructive", title: "Error de ZIP", description: `No se pudo procesar el archivo ${file.name}.` });
            }
        } else if (file.type.startsWith('audio/')) {
            audioFilesToProcess.push({ file: file, name: file.name });
        }
    }
    
    if (audioFilesToProcess.length === 0) {
      toast({ variant: "destructive", title: "No se encontraron archivos", description: "No se encontraron archivos de audio (.wav o .mp3) válidos en la selección." });
      setIsProcessing(false);
      setProcessingStatus([]);
      return;
    }

    setProcessingStatus(prev => [...prev, `Procesando ${audioFilesToProcess.length} sonidos con IA...`]);

    // This is where we call the AI
    const newLibraryItems: SoundLibraryItem[] = [];
    for (const f of audioFilesToProcess) {
      try {
        // TODO: Replace with real upload logic to R2 and get public URL
        const storageUrl = URL.createObjectURL(f.file); // Temporary local URL
        const { soundType, key } = await categorizeSound({ filename: f.name });
        newLibraryItems.push({
          id: uuidv4(),
          originalName: f.name,
          storageUrl,
          soundType,
          key,
        });
        setProcessingStatus(prev => [...prev, `✅ Categorizado: ${f.name}`]);
      } catch (error) {
        setProcessingStatus(prev => [...prev, `❌ Error en ${f.name}`]);
        console.error(`Error categorizing ${f.name}:`, error);
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
      accept: { 'audio/wav': ['.wav'], 'audio/mpeg': ['.mp3'], 'application/zip': ['.zip'] }
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
      if (!activeProjectId) {
          toast({ variant: 'destructive', title: "No hay un kit seleccionado", description: "Por favor, crea o selecciona un kit antes de añadirle sonidos." });
          return;
      }
      const soundId = e.dataTransfer.getData("soundId");
      const sound = appState.soundLibrary.find(s => s.id === soundId);
      const activeProject = appState.drumKitProjects.find(p => p.id === activeProjectId);
      if (!sound || !activeProject || activeProject.soundIds.includes(soundId)) return;
      
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
        const { newName } = await renameSound({ originalName: sound.originalName, kitDescription: activeProject.imagePrompt || 'general purpose' });
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
                    const newSoundNamesInKit = { ...p.soundNamesInKit, [soundId]: sound.originalName };
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

  const filteredSoundLibrary = useMemo(() => {
    return appState.soundLibrary.filter(item => {
        const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || item.soundType === filterType;
        return matchesSearch && matchesFilter;
    });
  }, [appState.soundLibrary, searchTerm, filterType]);

  const activeProject = useMemo(() => {
      return appState.drumKitProjects.find(p => p.id === activeProjectId);
  }, [appState.drumKitProjects, activeProjectId]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeProject) return;
    const newPrompt = e.target.value;
    setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, imagePrompt: newPrompt } : p) }));
  };

  const handleGenerateNames = async () => {
    if (!activeProject || !activeProject.imagePrompt) {
        toast({ variant: "destructive", title: "Error", description: "Por favor, escribe una descripción para el kit." });
        return;
    }
    setIsGeneratingNames(true);
    try {
        const result = await generateKitNames({ prompt: activeProject.imagePrompt });
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
    if (!activeProject || !activeProject.imagePrompt) {
        toast({ variant: "destructive", title: "Error", description: "La descripción no puede estar vacía." });
        return;
    }
    setIsGeneratingArt(true);
    try {
        const imageUrl = await generateCoverArt({ prompt: activeProject.imagePrompt });
        setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, coverArtUrl: imageUrl } : p) }));
        toast({ title: "¡Carátula generada!", description: "La nueva imagen para tu kit está lista." });
    } catch (error) {
        console.error("Error generating cover art:", error);
        toast({ variant: "destructive", title: "Error de IA", description: "No se pudo generar la imagen." });
    } finally {
        setIsGeneratingArt(false);
    }
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

        <Card className="glassmorphism-card lg:col-span-1" onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnAssembler}>
          <CardHeader>
            <CardTitle>Ensamblador de Kits</CardTitle>
            <CardDescription>Crea un kit arrastrando sonidos desde la librería.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={activeProjectId?.toString() || ''} onValueChange={(v) => setActiveProjectId(Number(v))}>
                  <SelectTrigger className='flex-grow'><SelectValue placeholder="Selecciona un kit..."/></SelectTrigger>
                  <SelectContent>{appState.drumKitProjects.map(proj => (<SelectItem key={proj.id} value={proj.id.toString()}>{proj.name}</SelectItem>))}</SelectContent>
                </Select>
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
                <Button onClick={handleCreateNewKit}><PlusCircle className='h-4 w-4 mr-2'/>Nuevo Kit</Button>
              </div>

              {activeProject && (
                <div className="space-y-4">
                  <div className='flex gap-4 items-start'>
                    <div className='w-32 h-32 rounded-md bg-muted flex-shrink-0 relative flex items-center justify-center'>
                      {isGeneratingArt ? <Loader2 className="animate-spin h-8 w-8"/> : 
                        activeProject.coverArtUrl ? <Image src={activeProject.coverArtUrl} alt="Kit cover art" layout="fill" className="object-cover rounded-md" /> :
                        <ImageIcon className="h-8 w-8 text-muted-foreground"/>
                      }
                    </div>
                    <div className='space-y-2 flex-grow'>
                      <Label htmlFor="kit-prompt">Descripción del Kit (para la IA)</Label>
                      <Input id="kit-prompt" placeholder="Ej: Dark trap, estilo Travis Scott..." value={activeProject.imagePrompt} onChange={handlePromptChange}/>
                       <div className="flex gap-2">
                          <Button onClick={handleGenerateArt} disabled={isGeneratingArt || !activeProject.imagePrompt} className="w-full"><Sparkles className='mr-2'/>Generar Carátula</Button>
                          <Button onClick={handleGenerateNames} disabled={isGeneratingNames || !activeProject.imagePrompt} className="w-full"><Sparkles className='mr-2'/>Generar Nombres</Button>
                       </div>
                    </div>
                  </div>
                  {activeProject.seoNames.length > 0 && (
                    <div className="space-y-2">
                      <Label>Nombres Sugeridos:</Label>
                      <div className="flex flex-wrap gap-2">{activeProject.seoNames.map((name, i) => (<Badge key={i} variant="outline">{name}</Badge>))}</div>
                    </div>
                  )}
                </div>
              )}
              
              <ScrollArea className={cn("h-[300px] rounded-md border p-4 space-y-2", activeProjectId && "border-primary/50")}>
                <AnimatePresence>
                {!activeProject ? (
                    <div className='text-center text-muted-foreground pt-16'><Music4 className="mx-auto h-16 w-16" /><p className="mt-4">Crea un nuevo kit o selecciona uno.</p></div>
                ) : activeProject.soundIds.length === 0 ? (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KitStudioTab;
