
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, ListFilter } from 'lucide-react';
import { useAppState, SoundType } from '@/context/AppStateContext';

const soundCategories: SoundType[] = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Hi-Hat Closed', 'Perc', 'Rim', '808 & Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'Sin Categoría'];

const KitStudioTab = () => {
  const { appState, setAppState } = useAppState();

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">Kit Studio</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gestiona tu librería de sonidos y ensambla tus próximos drum kits con la ayuda de IA.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Vista "Librería Central" */}
        <Card className="glassmorphism-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Librería Central</CardTitle>
            <CardDescription>Sube, busca y categoriza todos tus sonidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Arrastra y suelta un .zip o archivos de audio aquí</p>
              <Button variant="outline" className="mt-4">O selecciona archivos</Button>
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
             <div className="h-96 overflow-y-auto rounded-md border p-4">
               <p className="text-muted-foreground text-center py-16">
                 La tabla o cuadrícula de sonidos aparecerá aquí.
               </p>
             </div>
          </CardContent>
        </Card>

        {/* Vista "Ensamblador de Kits" */}
        <Card className="glassmorphism-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Ensamblador de Kits</CardTitle>
            <CardDescription>Crea un nuevo kit arrastrando sonidos desde la librería.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-16">
              El ensamblador de kits estará aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KitStudioTab;
