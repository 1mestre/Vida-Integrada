
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState, WorkItem, WorkPackageTemplate, type Contribution } from '@/context/AppStateContext';
import { TrendingUp, Settings, PlusCircle, Wrench, Music, Link, Edit, MessageSquare, Trash2, FileText } from 'lucide-react';
import WorkItemModal from '@/components/WorkItemModal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, differenceInCalendarDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSound } from '@/context/SoundContext';
import PackageSettingsModal from '@/components/PackageSettingsModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { v4 as uuidv4 } from 'uuid';


const generateClientMessage = (item: WorkItem, packageTemplates: WorkPackageTemplate[]): string => {
    const isMultiple = item.remakeType.includes('Multiple');
    let message = `Heyyy ${item.clientName}! 👋👋\n\n`;

    // === Bloque 1: Saludo y Descripción (Basado en el tono del paquete) ===
    if (item.packageName === 'Masterpiece') {
        message += isMultiple ? `Yoooo, your ${item.genre} masterpiece remaked beats are officially done and they're straight fire fr!! 🔥🔥✨ Hahaha, we went CRAZY on these!!\n\n` : `Yooo, your ${item.genre} masterpiece is officially done and it's straighttt fire fr!! 🔥✨\n\n`;
        message += isMultiple ? "🎛️🎛️ These remakes are CLEANNN as hell and ready to make some NOISEEE!! Each one hits different!! 🚀🚀\n\n" : "🎛️🎛️ This remake got the FULL treatment - custom-built and clean as hell!! Readyyy for the big leagues!! 🏆🏆\n\n";
    } else if (item.packageName === 'Exclusive') {
        message += isMultiple ? `Your ${item.genre} remaked beats are readyyy to drop!! 💣💣 No cap, these ones hit DIFFERENT!! 💯🎵\n\n` : `Your ${item.genre} beat is readyyy to drop!! No cap, this one hits different 💯🎵\n\n`;
        message += isMultiple ? "🎛️ All these remakes are LOCKED IN!! 🔒 Multiple vibes, same CRAZY energy!! 💪💪 Hahaha let's gooo!\n\n" : "🎛️ The remake is LOCKED and loaded!! 🔫 Custom-made just for you, readyyy for your vocals!! 🎤✨\n\n";
    } else { // Amateurs
        message += isMultiple ? `So hereee are those ${item.genre} demos you wanted!! 🎉 Just some quick vibes, nothing too wild yet hehe 😎🎧\n\n` : `So here's that ${item.genre} demo you wanted!! Just a quick vibe check, nothing too wild yet 😎🎧\n\n`;
        message += isMultiple ? "🎛️ These are just demo ideas for the remakes - the foundation's there, just needs the FULLLL glow-up!! 🏗️🏗️\n\n" : "🎛️ This is just the demo version of the remake - think of it as the rough draft with MADDD potential!! 🎨\n\n";
    }

    // === Bloque 2: Entregables (100% dinámico - Lo que el cliente YA TIENE) ===
    const deliverables: string[] = [];
    if (item.masterAudio) deliverables.push("- Full WAV: Mixed, mastered, and READYYY to upload!! 🎯");
    if (item.separateFiles) deliverables.push("- Full WAV + STEMS: The WHOLE package, no bs!! 💎");
    if (item.projectFileDelivery) deliverables.push("- FLP Project File: Full creative control in your hands!! 🎚️🎚️");
    if (item.exclusiveLicense) deliverables.push("- Exclusive Rights Contract: 100% ownership, no sharing needed!! 📋");
    if (item.vocalProduction) deliverables.push("- Vocal Production Add-on: Pro-level vocal mixing & tuning to make your voice SHINE!! ✨🎙️");
    
    if (deliverables.length > 0) {
        message += "📎📎 WHAT YOU'RE GETTING:\n" + deliverables.join('\n') + '\n\n';
    }

    if (item.vocalChainPreset) {
        message += `🎁 EXCLUSIVE GIFT: Custom vocal chain preset made for ${isMultiple ? `these ${item.genre} vibes` : `this ${item.genre} vibe`} 🎙️🎙️\n(Appreciate you being chill to work with, let's keep the collabs going!!) 🤝🤝\n\n`;
    }
    
    // === Bloque 3: Oferta de "Upsell" (Inteligente, Diferencial y a Prueba de Contradicciones) ===
    const sortedPkgs = [...packageTemplates].sort((a, b) => a.price - b.price);
    const cheapestPkg = sortedPkgs[0];
    const middlePkg = sortedPkgs.length > 1 ? sortedPkgs[1] : null;
    const highestPkg = sortedPkgs[sortedPkgs.length - 1];
    let upsellSection = "";

    // Función auxiliar para comparar beneficios entre un paquete superior y la ORDEN ACTUAL
    const getDifferentialFeatures = (higherPkg: WorkPackageTemplate, currentItem: WorkItem): string[] => {
        const features: string[] = [];
        // Solo se añade si el paquete superior lo tiene Y el item actual NO lo tiene
        if (higherPkg.masterAudio && !currentItem.masterAudio) features.push("• Professional mixing/mastering 🎛️🎚️");
        if (higherPkg.separateFiles && !currentItem.separateFiles) features.push("• Full STEMS 💎");
        if (higherPkg.projectFileDelivery && !currentItem.projectFileDelivery) features.push("• FLP Project File 🎚️🎚️");
        if (higherPkg.exclusiveLicense && !currentItem.exclusiveLicense) features.push("• Exclusive license (100% yours) 📜");
        if (higherPkg.vocalProduction && !currentItem.vocalProduction) features.push("• Vocal Production ✨🎙️");
        return features;
    };
    
    // Solo mostrar la oferta si el cliente NO tiene todos los beneficios del paquete más alto
    if (highestPkg && !(item.exclusiveLicense && item.projectFileDelivery && item.separateFiles)) {
        let upsellOffers: string[] = [];
        
        // CASO A: El paquete actual es el más barato
        if (item.packageName === cheapestPkg?.name) {
            // Oferta a Paquete Intermedio
            if (middlePkg) {
                const features = getDifferentialFeatures(middlePkg, item);
                if (features.length > 0) {
                    const diff = middlePkg.price - item.price;
                    let offer = `• ${item.packageName} ($${item.price}) → ${middlePkg.name} ($${middlePkg.price}): +$${diff}\n`;
                    offer += `  And get:\n  ${features.join('\n  ')}`;
                    upsellOffers.push(offer);
                }
            }
            // Oferta a Paquete Más Caro
            const featuresToHighest = getDifferentialFeatures(highestPkg, item);
            if (featuresToHighest.length > 0) {
                const diff = highestPkg.price - item.price;
                let offer = `• ${item.packageName} ($${item.price}) → ${highestPkg.name} ($${highestPkg.price}): +$${diff}\n`;
                offer += `  And get:\n  ${featuresToHighest.join('\n  ')}`;
                upsellOffers.push(offer);
            }
        }
        // CASO B: El paquete actual es el intermedio
        else if (item.packageName === middlePkg?.name) {
             const features = getDifferentialFeatures(highestPkg, item);
             if (features.length > 0) {
                const diff = highestPkg.price - item.price;
                let offer = `• ${item.packageName} ($${item.price}) → ${highestPkg.name} ($${highestPkg.price}): +$${diff}\n`;
                offer += `  And get:\n  ${features.join('\n  ')}`;
                upsellOffers.push(offer);
             }
        }

        if (upsellOffers.length > 0) {
            upsellSection = "🤔 BUT WAIT - If you're feeling this and want the full experience, just pay the difference:\n" + upsellOffers.join('\n\n') + "\n\nJust holla at me if you wanna upgrade! 🚀🚀\n\n";
        }
    }
    
    message += upsellSection;
    
    // === Bloque 4: Secciones Finales (CON LÓGICA DE REVISIONES CORREGIDA) ===
    message += `${isMultiple ? 'Keys' : 'Key'}: ${item.key} | ${isMultiple ? 'BPMs' : 'BPM'}: ${item.bpm}\n\n`;
    message += `📦📦 Order #${item.orderNumber}\n\n`;
    
    if (item.packageName === highestPkg?.name) { // Compara con el más caro
        message += `✅✅ This is built for the BIGGG stages - Spotify, radio, wherever you wanna take it!! 🌟🌟\n${item.revisionsRemaining} revisions remaining 🔧🔧\n\n🎁 PRO TIP: Drop a 5-star review and I'll hook you UPPP with $10 off your next order!! Helps me out FOR REALLL 🙏🙏\n\nNow go make some MAGIC happen!! ✨🎤`;
    } else if (middlePkg && item.packageName === middlePkg.name) { // Compara con el intermedio
        message += `✅ ${item.revisionsRemaining} revisions remaining 🔧\n${isMultiple ? "Time to make these BEATS slap!! 💥💥" : "Time to make some WAVES!! 🌊🌊"}\n\n🎁 PRO TIP: Leave me a 5-star review and I'll give you $10 off your next beat!! WIN-WIN SITUATION 😉💰💰\n\nLet's get this music out there!!! 🚀🚀`;
    } else { // El paquete más barato
        message += "✅ Let me know what you think of the direction!! If you're vibing with it, we can ALWAYSSS take it to the next level!! 🎯🎯\n\n";
        if (item.revisionsRemaining > 0) {
            message += `(${item.revisionsRemaining} custom revision(s) included in this deal! 😉💡💡)`;
        } else {
            message += "(No revisions on standard demos, but that's what upgrades are for!! 😉💡💡)";
        }
    }

    return message;
};

const statusColorMap: Record<WorkItem['deliveryStatus'], string> = {
  'Pending': 'bg-yellow-500 hover:bg-yellow-600 text-white',
  'In Transit': 'bg-blue-500 hover:bg-blue-600 text-white',
  'Delivered': 'bg-green-600 hover:bg-green-700 text-white',
  'In Revision': 'bg-purple-500 hover:bg-purple-600 text-white',
  'Returned': 'bg-red-600 hover:bg-red-700 text-white'
};

const revisionColorMap: { [key: number]: string } = {
  4: 'text-green-400 font-bold',
  3: 'text-lime-400',
  2: 'text-yellow-400',
  1: 'text-orange-400',
  0: 'text-gray-500',
};

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);


// Componente especializado para la celda de fecha editable
const EditableDateCell = ({
  row: { original: item },
  updateDate,
}: {
  row: any;
  updateDate: (itemId: string, newDate: Date) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const date = new Date(item.deliveryDate + 'T00:00:00');
  const today = startOfDay(new Date());
  const daysDiff = differenceInCalendarDays(date, today);

  let colorClass = 'text-muted-foreground';
  if (daysDiff <= 1) colorClass = 'text-red-500 font-bold';
  else if (daysDiff <= 3) colorClass = 'text-yellow-500 font-semibold';
  else if (daysDiff >= 4) colorClass = 'text-green-600';

  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      updateDate(item.id, newDate);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onDoubleClick={() => setIsOpen(true)}
          className={cn('text-center font-medium cursor-pointer p-2 rounded-md hover:bg-muted', colorClass)}
        >
          {format(date, "d 'de' MMMM, yyyy", { locale: es })}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          disabled={(date) => date < startOfDay(new Date())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};


const WorkTab = () => {
    const { appState, setAppState } = useAppState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
    const { toast } = useToast();
    const { playSound } = useSound();

    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [rateLoading, setRateLoading] = useState(true);
    const [amount, setAmount] = useState('');
  
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

    const handleOpenEditModal = (item: WorkItem) => {
      setSelectedItem(item);
      setIsModalOpen(true);
    };

    useEffect(() => {
        fetch('https://open.er-api.com/v6/latest/USD')
          .then(res => res.json())
          .then(data => {
            setExchangeRate(data.rates.COP);
            setRateLoading(false);
          })
          .catch(() => {
            setExchangeRate(4000); // Fallback
            setRateLoading(false);
          });
    }, []);
    
    const sortedWorkItems = useMemo(() => {
        return [...appState.workItems].sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
    }, [appState.workItems]);
    
    const handleDeleteWorkItem = (itemToDelete: WorkItem) => {
        playSound('deleteItem');
        setAppState(prevState => ({
          ...prevState,
          workItems: prevState.workItems.filter(item => item.id !== itemToDelete.id),
          tasks: prevState.tasks.filter(task => task.workItemId !== itemToDelete.id),
          calendarEventsData: prevState.calendarEventsData.filter(event => event.id !== `event-${itemToDelete.id}`)
        }));
    };
    
    const handleOpenNewOrderModal = () => {
        playSound('genericClick');
        setSelectedItem(null);
        setIsModalOpen(true);
    };
    
    const handleOpenPackageSettingsModal = () => {
        playSound('genericClick');
        setIsSettingsModalOpen(true);
    };

    const handleAddIncome = async () => {
      const rawAmount = parseFloat(amount);
      if (isNaN(rawAmount) || rawAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Monto Inválido",
          description: "Por favor, introduce un número positivo.",
        });
        return;
      }
    
      setRateLoading(true);
    
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        let currentRate = 4000; // fallback
        if (response.ok) {
          const data = await response.json();
          currentRate = data.rates.COP;
        }
        setExchangeRate(currentRate); // update UI
    
        let netUSD = 0;
        let netCOP = 0;
    
        if (appState.selectedInputCurrencyIngresos === 'USD') {
          const grossAmount = rawAmount;
          if (grossAmount <= 3) {
            toast({
              variant: "destructive",
              title: "Monto Demasiado Bajo",
              description: "El monto en USD debe ser mayor a $3 para cubrir las comisiones.",
            });
            setRateLoading(false);
            return;
          }
          netUSD = (grossAmount - 3) * 0.97;
          netCOP = netUSD * currentRate;
        } else {
          netCOP = rawAmount;
          netUSD = netCOP / currentRate;
        }
    
        if (isNaN(netUSD) || isNaN(netCOP) || netUSD < 0) {
          toast({
            variant: "destructive",
            title: "Error de Cálculo",
            description: "No se pudo procesar el ingreso. El resultado era inválido o negativo.",
          });
          setRateLoading(false);
          return;
        }
    
        playSound('pomodoroStart');
    
        const newContribution: Contribution = {
          id: uuidv4(),
          date: new Date().toISOString(),
          netUSDValue: netUSD,
          netCOPValue: netCOP,
        };
    
        setAppState(prevState => ({
          contributions: [newContribution, ...prevState.contributions],
        }));
    
        setAmount('');
      } catch (error) {
        console.error("No se pudo obtener la tasa de cambio, usando fallback.", error);
        toast({
          variant: "destructive",
          title: "Error de Red",
          description: "No se pudo obtener la tasa de cambio actualizada.",
        });
      } finally {
        setRateLoading(false);
      }
    };


    const handleDeleteIncome = (id: string) => {
        playSound('deleteItem');
        const updatedContributions = appState.contributions.filter(c => c.id !== id);
        setAppState({ contributions: updatedContributions });
    };

    const handleStatusUpdate = useCallback((itemId: string, newStatus: WorkItem['deliveryStatus']) => {
      setAppState(prevState => {
        const statusToColumnMap: Record<WorkItem['deliveryStatus'], 'todo' | 'inprogress' | 'done'> = {
          'Pending': 'todo',
          'In Transit': 'inprogress',
          'In Revision': 'inprogress',
          'Delivered': 'done',
          'Returned': 'done',
        };

        const updatedWorkItems = prevState.workItems.map(item =>
          item.id === itemId ? { ...item, deliveryStatus: newStatus } : item
        );

        const updatedTasks = prevState.tasks.map(task =>
          task.workItemId === itemId ? { ...task, column: statusToColumnMap[newStatus] } : task
        );

        return { ...prevState, workItems: updatedWorkItems, tasks: updatedTasks };
      });
    }, [setAppState]);

    const handleRevisionsUpdate = (itemId: string, newRevisions: number) => {
        setAppState(prevState => ({
          ...prevState,
          workItems: prevState.workItems.map(item =>
            item.id === itemId ? { ...item, revisionsRemaining: newRevisions } : item
          ),
        }));
      };

    const handleDateUpdate = useCallback((itemId: string, newDate: Date) => {
        const formattedDate = format(newDate, 'yyyy-MM-dd');
  
        setAppState(prevState => {
            const updatedWorkItems = prevState.workItems.map(item =>
                item.id === itemId ? { ...item, deliveryDate: formattedDate } : item
            );
    
            const updatedEvents = prevState.calendarEventsData.map(event =>
                event.workItemId === itemId ? { ...event, start: formattedDate } : event
            );
            
            return { ...prevState, workItems: updatedWorkItems, calendarEventsData: updatedEvents };
        });
    }, [setAppState]);
    
    const handlePackageUpdate = useCallback((itemId: string, newPackageName: string) => {
        const template = appState.workPackageTemplates.find(t => t.name === newPackageName);
        if (!template) return;

        setAppState(prevState => {
            const updatedWorkItems = prevState.workItems.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        packageName: template.name,
                        price: template.price,
                        revisionsRemaining: template.revisions,
                        songLength: template.songLength,
                        numberOfInstruments: template.numberOfInstruments,
                        quantity: template.quantity || 1,
                        separateFiles: template.separateFiles,
                        masterAudio: template.masterAudio,
                        projectFileDelivery: template.projectFileDelivery,
                        exclusiveLicense: template.exclusiveLicense,
                        vocalProduction: template.vocalProduction,
                        vocalChainPreset: template.vocalChainPreset,
                    };
                }
                return item;
            });
            return { ...prevState, workItems: updatedWorkItems };
        });
    }, [appState.workPackageTemplates, setAppState]);

    const financialSummary = useMemo(() => {
        const incomeThisMonth = appState.contributions
          .filter(c => c.date.startsWith(currentMonthKey))
          .reduce((sum, c) => sum + c.netCOPValue, 0);
        
        const totalNetCOP = appState.contributions.reduce((sum, c) => sum + c.netCOPValue, 0);
        const totalNetUSD = appState.contributions.reduce((sum, c) => sum + c.netUSDValue, 0);
        
        const progress = currentMonthTarget > 0 ? (incomeThisMonth / currentMonthTarget) * 100 : 0;
        
        return { totalNetCOP, totalNetUSD, incomeThisMonth, progress };
    }, [appState.contributions, currentMonthTarget, currentMonthKey]);

    const monthTimeProgress = useMemo(() => {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return (today.getDate() / endOfMonth.getDate()) * 100;
    }, []);

    const handleGenerateContract = (item: WorkItem) => {
        const formattedDate = format(new Date(item.deliveryDate + 'T00:00:00'), "do 'de' MMMM 'de' yyyy", { locale: es });
        const contractTemplateHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acuerdo de Transferencia de Derechos de Uso</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />

    <style>
        /* Estilos CSS incrustados en el HEAD para una mejor compatibilidad con la impresión */
        .pdf-page-container {
            width: 210mm; /* Ancho estándar de una hoja A4 */
            min-height: 297mm; /* Altura estándar de una hoja A4 */
            position: relative;
            background-color: #e8e5df;
            background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png");
            font-family: 'Poppins', sans-serif; /* Fuente principal para el contenido */
            padding: 20mm;
            box-sizing: border-box;
            color: #333333;
            margin: 0 auto; /* Centra el contenedor en la página */
            overflow: hidden;
            /* Estos estilos son cruciales para la impresión a PDF desde el navegador */
            print-color-adjust: exact; /* Asegura que los colores de fondo se impriman */
            -webkit-print-color-adjust: exact;
        }
        .main-content-wrapper {
            /* Ajustado padding-bottom para encajar todo en una página */
            padding-bottom: 50mm; /* Antes 70mm, reducción para permitir más contenido en la primera página */
            position: relative;
            z-index: 5;
        }
        .signature-font {
            font-family: 'Dancing Script', cursive; /* Fuente específica para la firma */
        }
        .fiverr-logo-container { /* Contenedor para el logo de Fiverr */
            position: absolute;
            top: 20mm;
            right: 20mm;
            width: 50mm; /* Ajusta el ancho para el logo */
            height: auto;
            z-index: 10; /* Asegura que el logo esté en la parte superior */
            display: flex;
            justify-content: flex-end; /* Alinea el logo a la derecha dentro de su contenedor */
        }
        .fiverr-logo-img { /* Estilos para la imagen del logo SVG */
            height: 15mm; /* Altura del SVG */
            width: auto;
            /* Aplica un filtro CSS para intentar darle un tono verde al logo.
            Se ajusta el brillo a 30% para un verde más oscuro. */
            filter: invert(40%) sepia(90%) saturate(1000%) hue-rotate(80deg) brightness(30%) contrast(100%);
        }
        .svg-graphics-corner {
            position: absolute;
            width: 200px;
            height: 200px;
            overflow: hidden;
            z-index: 0; /* Envía los gráficos al fondo */
        }
        .top-left-graphics {
            top: 0;
            left: 0;
            transform: scaleY(-1); /* Voltea el SVG verticalmente para la esquina superior izquierda */
        }
        .bottom-left-graphics {
            bottom: 0;
            left: 0;
        }
        .bottom-right-graphics {
            bottom: 0;
            right: 0;
            transform: scaleX(-1); /* Voltea el SVG horizontalmente para la esquina inferior derecha */
        }
        header {
            /* Ajustado margin-top para dar más espacio arriba del contenido */
            margin-top: 35mm; /* Antes 45mm, para permitir más espacio superior */
            color: #105652;
            font-family: 'Montserrat', sans-serif; /* Fuente para el encabezado */
            text-align: center;
            margin-bottom: 15mm;
        }
        .contact-info {
            position: absolute;
            bottom: 55mm; /* Posición desde la parte inferior de la página */
            left: 50%;
            transform: translateX(-50%); /* Centra horizontalmente */
            text-align: center;
            font-family: 'Poppins', sans-serif;
            font-size: 11pt;
            color: #555555;
            width: fit-content; /* Ajusta el ancho al contenido */
            z-index: 5;
        }
        .contact-info p {
            margin: 2px 0; /* Margen pequeño para los párrafos de contacto */
        }
        .signature-section {
            position: absolute;
            bottom: 20mm; /* Posición de la sección de firma desde la parte inferior */
            left: 25mm;
            right: 25mm;
            display: flex; /* Usa flexbox para alinear las firmas */
            justify-content: space-between; /* Distribuye el espacio entre las firmas */
            font-size: 10pt;
            z-index: 5;
        }
        .signature-block {
            flex: 0 0 45%; /* Cada bloque de firma ocupa el 45% del espacio */
            text-align: center;
        }
        .signature-block hr {
            border: none;
            border-top: 1px solid #333; /* Línea de la firma */
            width: 80%;
            margin: 5px auto 0 auto; /* Centra la línea */
        }

        /* Estilos específicos para impresión */
        @media print {
            html, body {
                margin: 0 !important; /* Fuerza márgenes a cero para impresión */
                padding: 0 !important;
                height: auto !important; /* Asegura que no haya altura fija que corte el contenido */
            }
            @page {
                size: A4; /* Asegura el tamaño de página A4 */
                margin: 0; /* Elimina márgenes de página por defecto */
            }
            .pdf-page-container {
                margin: 0 !important;
                padding: 20mm !important;
                box-shadow: none !important;
                border: none !important;
                background-color: #e8e5df !important;
                background-image: url("https://www.transparenttextures.com/patterns/light-paper-fibers.png") !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                /* El padding y min-height ya deberían manejar el espacio si el contenido es A4 */
            }
        }
    </style>
</head>
<body>
    <div class="pdf-page-container">
        <div class="svg-graphics-corner top-left-graphics">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
                <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
                <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
            </svg>
        </div>
        <div class="svg-graphics-corner bottom-left-graphics">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
                <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
                <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
            </svg>
        </div>
        <div class="svg-graphics-corner bottom-right-graphics">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 C 100 0, 200 100, 200 200 L 0 200 Z" fill="#1d5a2d" opacity="0.4"/>
                <path d="M0 0 C 80 0, 160 80, 160 160 L 0 160 Z" fill="#105652" opacity="0.4"/>
                <path d="M0 0 C 60 0, 120 60, 120 120 L 0 120 Z" fill="#588157" opacity="0.4"/>
            </svg>
        </div>

        <div class="fiverr-logo-container">
            <img src="https://cdn.worldvectorlogo.com/logos/fiverr-2.svg" alt="Fiverr Logo" class="fiverr-logo-img" />
        </div>

        <div class="main-content-wrapper">
            <header>
                <h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">RIGHTS OF USE</h1>
                <h1 style="font-size: 30pt; font-weight: bold; margin: 0; letter-spacing: 1px;">TRANSFER AGREEMENT</h1>
                <p style="font-size: 12pt; margin-top: 5px; letter-spacing: 2px; color: #1d5a2d;">FIVERR INSTRUMENTAL REMAKE SERVICE</p>
            </header>

            <hr style="border: none; border-top: 1px solid #105652; margin: 15mm 0;" />

            <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 15mm;">
                <tbody>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Services from</strong></td><td style="padding: 8px 0;">@danodals</td><td style="padding: 8px 0;"><strong>Contact</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Date</strong></td><td style="padding: 8px 0; font-family: 'Montserrat', sans-serif;">${date}</td><td style="padding: 8px 0;">danodalbeats@gmail.com</td>
                    </tr>
                </tbody>
            </table>

            <h3 style="font-size: 15.18pt; color: #105652; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10mm; font-weight: bold;">
                Digital Services Contract
            </h3>

            <p style="font-size: 9pt; lineHeight: 1.6; color: #555555; text-align: justify;">
                Rights of Use Transfer Agreement (Fiverr Remake Service @danodals) Sebastián Mestre, with Fiverr username @danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <strong style="color: #105652;">@${clientName}</strong> under the following terms:
            </p>

            <div style="margin-top: 10mm; font-size: 9pt; color: #555555;">
                <p style="margin-top: 8px;"><strong>• Purpose:</strong> This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</p>
                <p style="margin-top: 8px;"><strong>• Scope of Transfer:</strong> The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</p>
                <p style="margin-top: 8px;"><strong>• Exclusivity Guarantee:</strong> The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</p>
                <p style="margin-top: 8px;"><strong>• Payment and Contract Completion:</strong> Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</p>
                <p style="margin-top: 8px;"><strong>• Duration:</strong> The transfer of rights is indefinite, with no time or territory restrictions.</p>
            </div>
        </div>

        <div class="contact-info">
            <p>fiverr.com/danodals</p>
            <p>(+57) 3223238670</p>
            <p>Bogotá, Colombia</p>
        </div>

        <div class="signature-section">
            <div class="signature-block">
                <p class="signature-font" style="font-size: 40pt; margin: 0 0 5px 0; line-height: 1;">Dano</p>
                <hr style="border: none; border-top: 1px solid #333; width: 80%; margin: 0 auto;" />
                <p style="margin-top: 5px;">Danodals Beats</p>
            </div>
            <div class="signature-block">
                <div style="width: 150px; height: 50px; margin: 0 auto;"></div>
                <hr style="border: none; border-top: 1px solid #333; width: 80%; margin: 0 auto;" />
                <p style="margin-top: 5px;">CLIENT'S SIGNATURE</p>
            </div>
        </div>
    </div>
</body>
</html>`;
    
        const personalizedHtml = contractTemplateHtml
            .replace(/\$\{date\}/g, formattedDate)
            .replace(/\$\{clientName\}/g, item.clientName);

        const newTab = window.open();
        if (newTab) {
            newTab.document.write(personalizedHtml);
            newTab.document.close();
            playSound('genericClick');
        } else {
            toast({
                variant: "destructive",
                title: "Error al abrir",
                description: "No se pudo abrir la nueva pestaña. Revisa si tu navegador está bloqueando pop-ups.",
            });
        }
    };

    const columns: ColumnDef<WorkItem>[] = useMemo(() => [
        {
          id: 'tools',
          header: 'Tools',
          cell: ({ row }) => {
            const item = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Wrench className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          try {
                            navigator.clipboard.writeText(generateClientMessage(item, appState.workPackageTemplates));
                            toast({ title: "¡Copiado!", description: "Mensaje para cliente copiado al portapapeles." });
                          } catch (err) {
                            console.error("Error al copiar al portapapeles:", err);
                            toast({ variant: "destructive", title: "Error al Copiar", description: "No se pudo copiar el mensaje." });
                          }
                          playSound('genericClick');
                        }}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Copiar Mensaje Cliente</span>
                    </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Wrench className="mr-2 h-4 w-4" />
                      <span>Nombrar Archivos</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(generateFileNames(item).wav);
                          toast({ title: "Copiado!" });
                          playSound('genericClick');
                        }}>
                          Copiar Nombre WAV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(generateFileNames(item).stems);
                          toast({ title: "Copiado!" });
                          playSound('genericClick');
                        }}>
                          Copiar Nombre STEMS
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(generateFileNames(item).project);
                          toast({ title: "Copiado!" });
                          playSound('genericClick');
                        }}>
                          Copiar Nombre FLP
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
        { 
            accessorKey: 'clientName', 
            header: () => <div className="text-center">Cliente</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('clientName')}</div>
        },
        {
            accessorKey: 'deliveryDate',
            header: () => <div className="text-center">Entrega</div>,
            cell: (props) => <EditableDateCell {...props} updateDate={handleDateUpdate} />,
        },
        {
          accessorKey: 'key',
          header: () => <div className="text-center">Key</div>,
          cell: ({ row }) => {
            const keyText = row.getValue('key') as string;
            const parts = keyText.split(' / ');
            return (
              <div className="text-center">
                <span className="font-semibold text-orange-500">{parts[0]}</span>
                {parts[1] && (
                  <>
                    <span className="text-muted-foreground"> / </span> 
                    <span className="font-semibold text-sky-700">{parts[1]}</span>
                  </>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: 'bpm',
          header: () => <div className="text-center">BPM</div>,
          cell: ({ row }) => <div className="text-center">{row.getValue('bpm')}</div>
        },
        { 
            accessorKey: 'deliveryStatus', 
            header: () => <div className="text-center">Estado</div>,
            cell: ({ row }) => {
                const item = row.original;
                const statusOptions: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'In Revision', 'Delivered', 'Returned'];
          
                return (
                    <div className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 h-auto">
                                <Badge className={cn("cursor-pointer", statusColorMap[item.deliveryStatus])}>
                                {item.deliveryStatus}
                                </Badge>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            {statusOptions.map(status => (
                                <DropdownMenuItem
                                key={status}
                                onSelect={() => handleStatusUpdate(item.id, status)}
                                >
                                <span className={cn('h-2 w-2 rounded-full mr-2', statusColorMap[status])} />
                                <span>{status}</span>
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        },
        {
            accessorKey: 'revisionsRemaining',
            header: () => <div className="text-center">Revisiones</div>,
            cell: ({ row }) => {
              const item = row.original;
              const revisionOptions = [4, 3, 2, 1, 0];
          
              return (
                <div className="text-center">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn("font-semibold", revisionColorMap[item.revisionsRemaining])}>
                        {item.revisionsRemaining}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {revisionOptions.map(revs => (
                        <DropdownMenuItem key={revs} onSelect={() => handleRevisionsUpdate(item.id, revs)}>
                            <span className={cn('font-semibold', revisionColorMap[revs])}>{revs}</span>
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              );
            },
        },
        { 
            accessorKey: 'packageName', 
            header: () => <div className="text-center">Paquete</div>,
            cell: ({ row }) => {
                const item = row.original;
                const currentPackage = appState.workPackageTemplates.find(p => p.name === item.packageName);
                const colorClass = currentPackage ? currentPackage.colorClassName : 'bg-gray-500';

                return (
                    <div className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 h-auto">
                                <Badge className={cn("cursor-pointer", colorClass)}>
                                {item.packageName}
                                </Badge>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            {appState.workPackageTemplates.map(pkg => (
                                <DropdownMenuItem
                                key={pkg.id}
                                onSelect={() => handlePackageUpdate(item.id, pkg.name)}
                                >
                                <span className={cn('h-2 w-2 rounded-full mr-2', pkg.colorClassName)} />
                                <span>{pkg.name}</span>
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        },
        {
            accessorKey: 'price',
            header: () => <div className="text-center">Precio</div>,
            cell: ({row}) => <div className="text-center">{formatUSD(row.original.price)}</div>
        },
        { 
            accessorKey: 'orderNumber', 
            header: () => <div className="text-center">Orden #</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('orderNumber')}</div>
        },
        { 
            accessorKey: 'genre', 
            header: () => <div className="text-center">Género</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('genre')}</div>
        },
        {
          id: 'actions',
          header: () => <div className="text-right">Acciones</div>,
          cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateContract(item)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Contrato
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditModal(item)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteWorkItem(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        }
    ], [appState.workPackageTemplates, appState.contributions, handleDateUpdate, handleStatusUpdate, handlePackageUpdate, handleRevisionsUpdate, playSound, handleDeleteWorkItem, handleOpenEditModal, toast, handleGenerateContract]);

    const table = useReactTable({
        data: sortedWorkItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <div className="flex flex-col items-start">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FIVERR📀</h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <a href="https://www.fiverr.com/seller_dashboard" target="_blank" rel="noopener noreferrer" onClick={() => playSound('genericClick')}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                      <Link className="mr-2 h-4 w-4" />
                      Fiverr
                    </Button>
                  </a>
                  <a href="https://tunebat.com/Analyzer" target="_blank" rel="noopener noreferrer" onClick={() => playSound('genericClick')}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Music className="mr-2 h-4 w-4" />
                      Tunebat
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={handleOpenPackageSettingsModal}>
                   <Settings className="mr-2 h-4 w-4" />
                   Set Packages
                 </Button>
                 <Button onClick={handleOpenNewOrderModal} className="h-12 md:h-14 text-base md:text-lg">
                   Nueva Orden🤑💵
                 </Button>
               </div>
            </div>

            <Card className="glassmorphism-card">
                <CardContent className="pt-6">
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-center whitespace-nowrap">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="whitespace-nowrap">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No hay datos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="glassmorphism-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 text-primary" />
                      Meta de Ingresos - {format(new Date(), 'MMMM yyyy', { locale: es })}
                    </CardTitle>
                    <CardDescription>Establece y sigue tu objetivo de ingresos mensuales.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Input
                        type="number"
                        placeholder="Meta en COP"
                        value={currentMonthTarget || ''}
                        onChange={(e) => setAppState({ monthlyTargets: { ...appState.monthlyTargets, [currentMonthKey]: Number(e.target.value) } })}
                        className="bg-background/50 border-border"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Progreso: {formatCOP(financialSummary.incomeThisMonth)} / {formatCOP(currentMonthTarget)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Progreso Meta del Mes ({financialSummary.progress.toFixed(1)}%)</p>
                        <Progress value={financialSummary.progress} className="h-4 shimmer [&>div]:bg-ios-green"/>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Progreso del Mes (Tiempo: {monthTimeProgress.toFixed(1)}%)</p>
                        <Progress value={monthTimeProgress} className="h-4 [&>div]:bg-ios-orange"/>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Select value={appState.selectedInputCurrencyIngresos} onValueChange={(val: 'USD' | 'COP') => setAppState({ selectedInputCurrencyIngresos: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="COP">COP</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder={`Monto en ${appState.selectedInputCurrencyIngresos}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="sm:col-span-2 bg-background/50 border-border"
                      />
                    </div>
                    <Button onClick={handleAddIncome} disabled={rateLoading || !amount} className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {rateLoading ? 'Cargando tasa...' : 'Añadir Ingreso'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">Tasa de cambio actual (USD a COP): {rateLoading ? '...' : exchangeRate?.toFixed(2)}</p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glassmorphism-card">
                        <CardHeader><CardTitle>Historial de Ingresos</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                                <ul className="space-y-3 pr-4">
                                    {appState.contributions.map(c => (
                                        <li key={c.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                                            <div>
                                                <div className="font-medium text-ios-green">{formatCOP(c.netCOPValue)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(c.date), 'dd MMM yyyy', { locale: es })} - {formatUSD(c.netUSDValue)}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => handleDeleteIncome(c.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                     <Card className="glassmorphism-card">
                        <CardHeader><CardTitle>Progreso Metas Mensuales</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                               <ul className="space-y-3 pr-4">
                                    {Object.entries(appState.monthlyTargets).reverse().map(([key, target]) => {
                                        const monthIncome = appState.contributions
                                            .filter(c => c.date.startsWith(key))
                                            .reduce((sum, c) => sum + c.netCOPValue, 0);
                                        const achieved = monthIncome >= target;
                                        return (
                                            <li key={key} className="text-sm border-b border-border/50 pb-2">
                                                <p className="font-medium">{format(new Date(`${key}-02`), 'MMMM yyyy', { locale: es })}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">{formatCOP(monthIncome)} / {formatCOP(target)}</span>
                                                    <span className={`font-bold ${achieved ? 'text-ios-green' : 'Logrado'}`}>
                                                        {achieved ? 'Logrado' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
              </div>
              <div className="space-y-6">
                 <Card className="w-full max-w-md glassmorphism-card">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Ingresos Este Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center items-baseline gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold tracking-tighter text-yellow-500">{formatCOP(financialSummary.incomeThisMonth)}</p>
                                <p className="text-xs font-medium text-yellow-500">(COP)</p>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">/</div>
                            <div className="text-center">
                                <p className="text-2xl font-bold tracking-tighter text-green-500">{formatUSD(financialSummary.incomeThisMonth / (exchangeRate || 4000))}</p>
                                <p className="text-xs font-medium text-green-500">(USD)</p>
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingresos Acumulados: {formatCOP(financialSummary.totalNetCOP)} / {formatUSD(financialSummary.totalNetUSD)}
                    </p>
                  </div>
                {financialSummary.progress >= 100 && (
                    <Card className="glassmorphism-card bg-ios-green/20 border-ios-green p-4 text-center">
                        <p className="font-bold text-ios-green animate-pulse">🎉✨ ¡FELICITACIONES! ¡META ALCANZADA! ✨🎉</p>
                    </Card>
                )}
              </div>
            </div>

            <WorkItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
            />

            <PackageSettingsModal 
              isOpen={isSettingsModalOpen}
              onClose={() => setIsSettingsModalOpen(false)}
            />
        </div>
    );
};

export default WorkTab;

    

    