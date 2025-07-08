
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { useAppState, SoundLibraryItem, SoundType, DrumKitProject } from '@/context/AppStateContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, ListFilter, Play, Trash2, Loader2, Music4, PlusCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { generateKitNames } from '@/ai/flows/generate-kit-names-flow';
import { Label } from '@/components/ui/label';


const soundCategories: SoundType[] = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Hi-Hat Closed', 'Perc', 'Rim', '808 & Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'Sin Categoría'];

const KitStudioTab = () => {
  const { appState, setAppState } = useAppState();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
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
    setAppState(prevState => {
      const updatedProjects = prevState.drumKitProjects.map(proj => ({
        ...proj,
        soundIds: proj.soundIds.filter(soundId => soundId !== id)
      }));

      return {
        ...prevState,
        soundLibrary: prevState.soundLibrary.filter(item => item.id !== id),
        drumKitProjects: updatedProjects,
      }
    });
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

                    if (zipEntry.dir || relativePath.startsWith('__MACOSX/')) {
                        continue;
                    }
                    
                    const normalizedName = (zipEntry.name.split('/').pop() || zipEntry.name).trim().toLowerCase();
                    if (normalizedName && (normalizedName.endsWith('.wav') || normalizedName.endsWith('.mp3'))) {
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

      setAppState(prevState => {
        const updatedState = { ...prevState, soundLibrary: [...prevState.soundLibrary, ...newLibraryItems] };
        return updatedState;
      });
      
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

  const handleCreateNewKit = () => {
    const newKit: DrumKitProject = {
        id: Date.now(),
        name: `Nuevo Kit - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`,
        coverArtUrl: null,
        imagePrompt: '',
        seoNames: [],
        soundIds: [],
    };
    setAppState(prevState => ({
        ...prevState,
        drumKitProjects: [...prevState.drumKitProjects, newKit]
    }));
    setActiveProjectId(newKit.id);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, soundId: string) => {
      e.dataTransfer.setData("soundId", soundId);
  };

  const handleDropOnAssembler = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!activeProjectId) {
          toast({
              variant: 'destructive',
              title: "No hay un kit seleccionado",
              description: "Por favor, crea o selecciona un kit antes de añadirle sonidos.",
          });
          return;
      }

      const soundId = e.dataTransfer.getData("soundId");
      if (!soundId) return;
      
      setAppState(prevState => {
          const activeProject = prevState.drumKitProjects.find(p => p.id === activeProjectId);
          if (!activeProject || activeProject.soundIds.includes(soundId)) {
              return prevState; 
          }

          const updatedProject = {
              ...activeProject,
              soundIds: [...activeProject.soundIds, soundId]
          };

          return { 
            ...prevState,
            drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? updatedProject : p) 
          };
      });
  };
  
  const handleRemoveFromKit = (soundId: string) => {
      if (!activeProjectId) return;

      setAppState(prevState => {
           const activeProject = prevState.drumKitProjects.find(p => p.id === activeProjectId);
           if (!activeProject) return prevState;

           const updatedProject = {
               ...activeProject,
               soundIds: activeProject.soundIds.filter(id => id !== soundId)
           };
          
           return { 
            ...prevState,
            drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? updatedProject : p) 
          };
      });
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

  const soundsInKit = useMemo(() => {
      if (!activeProject) return [];
      return activeProject.soundIds.map(id => 
          appState.soundLibrary.find(s => s.id === id)
      ).filter((s): s is SoundLibraryItem => s !== undefined);
  }, [activeProject, appState.soundLibrary]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeProject) return;
    const newPrompt = e.target.value;
    setAppState(prevState => ({
        ...prevState,
        drumKitProjects: prevState.drumKitProjects.map(p =>
            p.id === activeProjectId ? { ...p, imagePrompt: newPrompt } : p
        )
    }));
  };

  const handleGenerateNames = async () => {
    if (!activeProject || !activeProject.imagePrompt) {
        toast({ variant: "destructive", title: "Error", description: "Por favor, escribe una descripción para el kit." });
        return;
    }
    setIsGeneratingNames(true);
    try {
        const result = await generateKitNames({ prompt: activeProject.imagePrompt });
        setAppState(prevState => ({
            ...prevState,
            drumKitProjects: prevState.drumKitProjects.map(p =>
                p.id === activeProjectId ? { ...p, seoNames: result.names } : p
            )
        }));
        toast({ title: "Nombres generados", description: "La IA ha sugerido algunos nombres para tu kit." });
    } catch (error) {
        console.error("Error generating names:", error);
        toast({ variant: "destructive", title: "Error de IA", description: "No se pudieron generar los nombres." });
    } finally {
        setIsGeneratingNames(false);
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
                        key={item.id} 
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 cursor-grab active:cursor-grabbing">
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
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card 
            className="glassmorphism-card lg:col-span-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnAssembler}
        >
          <CardHeader>
            <CardTitle>Ensamblador de Kits</CardTitle>
            <CardDescription>Crea un kit arrastrando sonidos desde la librería.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={activeProjectId?.toString() || ''} onValueChange={(v) => setActiveProjectId(Number(v))}>
                  <SelectTrigger className='flex-grow'>
                    <SelectValue placeholder="Selecciona un kit..."/>
                  </SelectTrigger>
                  <SelectContent>
                    {appState.drumKitProjects.map(proj => (
                      <SelectItem key={proj.id} value={proj.id.toString()}>{proj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateNewKit}>
                  <PlusCircle className='h-4 w-4 mr-2'/>
                  Nuevo Kit
                </Button>
              </div>

              {activeProject && (
                <div className="space-y-4">
                  <div className='space-y-2'>
                    <Label htmlFor="kit-prompt">Descripción del Kit (para la IA)</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="kit-prompt"
                        placeholder="Ej: Dark trap, estilo Travis Scott..."
                        value={activeProject.imagePrompt}
                        onChange={handlePromptChange}
                      />
                      <Button onClick={handleGenerateNames} disabled={isGeneratingNames}>
                        {isGeneratingNames ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Generar Nombres
                      </Button>
                    </div>
                  </div>
                  {activeProject.seoNames.length > 0 && (
                    <div className="space-y-2">
                      <Label>Nombres Sugeridos:</Label>
                      <div className="flex flex-wrap gap-2">
                        {activeProject.seoNames.map((name, i) => (
                          <Badge key={i} variant="outline">{name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <ScrollArea className={cn("h-[450px] rounded-md border p-4 space-y-2", activeProjectId && "border-primary/50")}>
                <AnimatePresence>
                {!activeProject ? (
                    <div className='text-center text-muted-foreground pt-16'>
                      <Music4 className="mx-auto h-16 w-16" />
                      <p className="mt-4">
                        Crea un nuevo kit o selecciona uno existente para empezar a añadir sonidos.
                      </p>
                    </div>
                ) : soundsInKit.length === 0 ? (
                    <div className='text-center text-muted-foreground pt-16'>
                      <p>Arrastra y suelta sonidos aquí para construir tu kit.</p>
                    </div>
                ) : (
                    soundsInKit.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
                      >
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handlePlaySound(item.storageUrl)}><Play className="h-4 w-4"/></Button>
                        <p className="flex-grow text-sm truncate" title={item.originalName}>{item.originalName}</p>
                        <Badge variant="outline" className="text-xs">{item.soundType}</Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleRemoveFromKit(item.id)}><Trash2 className="h-4 w-4"/></Button>
                      </motion.div>
                    ))
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
