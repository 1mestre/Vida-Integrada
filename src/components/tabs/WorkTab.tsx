
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
import { TrendingUp, Settings, PlusCircle, Wrench, Music, Link, Edit, MessageSquare, Trash2, FileText, Gift, ClipboardCopy } from 'lucide-react';
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const contractTemplateHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Work for Hire & Rights Transfer Agreement - Danodals</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f3f4f6;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        .contract-container {
            max-width: 800px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 41px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header-wave {
            background: linear-gradient(135deg, #005c4f, #009483);
            color: #ffffff;
            padding: 40px;
            position: relative;
        }
        .header-content {
            position: relative;
        }
        .content-body {
            padding: 40px;
            color: #374151;
        }
        h1, h2, h3 {
            color: #003d33;
        }
        strong {
            color: #003d33;
            font-weight: 600;
        }
        .signature-section {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #374151;
            margin-bottom: 8px;
        }
        .signature-area {
            height: 54px;
        }
        .signature-font {
            font-family: 'Dancing Script', cursive;
            font-size: 2.7rem;
            color: #1a202c;
            line-height: 1;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="contract-container">
        <div class="header-wave">
            <div class="header-content">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-white">WORK FOR HIRE & RIGHTS TRANSFER AGREEMENT</h1>
                    <p class="text-lg text-white">Custom Instrumental Production Service</p>
                </div>
            </div>
        </div>

        <div class="content-body">
            <div class="overflow-x-auto mb-8">
                <table class="w-full text-sm text-left">
                    <tbody>
                        <tr class="border-b">
                            <th scope="row" class="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                Agreement Date
                            </th>
                            <td class="px-6 py-4">
                                {{agreementDate}}
                            </td>
                        </tr>
                        <tr class="border-b">
                            <th scope="row" class="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                Parties
                            </th>
                            <td class="px-6 py-4">
                                <strong>Danodals</strong> (Sebastián Mestre, the "Producer")<br>
                                <strong>{{clientName}}</strong> (the "Artist")
                            </td>
                        </tr>
                        <tr class="border-b">
                            <th scope="row" class="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                Project Reference
                            </th>
                            <td class="px-6 py-4">
                                Fiverr Order ID #{{orderNumber}}
                            </td>
                        </tr>
                         <tr class="border-b">
                            <th scope="row" class="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                Contact
                            </th>
                            <td class="px-6 py-4">
                                {{producerEmail}}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="space-y-6 text-base leading-relaxed">
                <div>
                    <h3 class="text-xl font-bold mb-2">1. Subject of Agreement</h3>
                    <p>This agreement outlines the terms and conditions under which the Producer agrees to create a custom musical work (the "Instrumental") for the Artist, as detailed in the referenced Fiverr order. This is a "Work for Hire" agreement.</p>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-2">2. Scope of Work</h3>
                    <p>The Producer will deliver a high-quality, custom Instrumental based on the specifications agreed upon by both parties within the Fiverr platform. The final deliverables will correspond to the package purchased by the Artist (e.g., MP3, WAV, Track Stems).</p>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-2">3. Transfer of Rights</h3>
                    <p>Upon full and final payment of the project on Fiverr, the Producer transfers to the Artist <strong>100% of the exclusive, worldwide, and perpetual rights</strong> to the finished Instrumental.</p>
                    <ul class="list-disc list-inside mt-4 space-y-2 pl-4">
                        <li><strong>Exclusive Usage:</strong> The Artist has the sole right to use, modify, distribute, sell, and publicly perform the Instrumental.</li>
                        <li><strong>Commercial Use:</strong> The Artist is entitled to 100% of all royalties and revenue generated from the commercial exploitation of the Instrumental across all platforms (Spotify, Apple Music, YouTube, etc.).</li>
                        <li><strong>Exclusivity Guarantee:</strong> The Producer guarantees that the custom-created elements of the Instrumental are exclusive to the Artist and will not be resold, licensed, or distributed to any third party.</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-2">4. Producer's Credit (Optional but Recommended)</h3>
                    <p>While not mandatory, a production credit is customary in the industry. The preferred format is: <strong>"Prod. by Danodals"</strong>.</p>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-2">5. Agreement & Confirmation</h3>
                    <p>By completing the payment for this order on Fiverr, the Artist confirms that they have read, understood, and agreed to the terms of this Work for Hire & Rights Transfer Agreement.</p>
                </div>
            </div>

            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-area">
                        <div class="signature-font">Danodals</div>
                    </div>
                    <div class="signature-line"></div>
                    <p class="text-sm font-semibold">Sebastián Mestre (Danodals)</p>
                    <p class="text-xs text-gray-500">Producer</p>
                </div>
                <div class="signature-box">
                    <div class="signature-area"></div>
                    <div class="signature-line"></div>
                    <p class="text-sm font-semibold">{{clientName}}</p>
                    <p class="text-xs text-gray-500">Artist</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;


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

    const getDifferentialFeatures = (higherPkg: WorkPackageTemplate, currentItem: WorkItem): string[] => {
        const features: string[] = [];
        if (higherPkg.masterAudio && !currentItem.masterAudio) features.push("• Professional mixing/mastering 🎛️🎚️");
        if (higherPkg.separateFiles && !currentItem.separateFiles) features.push("• Full STEMS 💎");
        if (higherPkg.projectFileDelivery && !currentItem.projectFileDelivery) features.push("• FLP Project File 🎚️🎚️");
        if (higherPkg.exclusiveLicense && !currentItem.exclusiveLicense) features.push("• Exclusive license (100% yours) 📜");
        if (higherPkg.vocalProduction && !currentItem.vocalProduction) features.push("• Vocal Production ✨🎙️");
        return features;
    };
    
    if (highestPkg && !(item.exclusiveLicense && item.projectFileDelivery && item.separateFiles)) {
        let upsellOffers: string[] = [];
        
        if (item.packageName === cheapestPkg?.name) {
            if (middlePkg) {
                const features = getDifferentialFeatures(middlePkg, item);
                if (features.length > 0) {
                    const diff = middlePkg.price - item.price;
                    let offer = `• ${item.packageName} ($${item.price}) → ${middlePkg.name} ($${middlePkg.price}): +$${diff}\n`;
                    offer += `  And get:\n  ${features.join('\n  ')}`;
                    upsellOffers.push(offer);
                }
            }
            const featuresToHighest = getDifferentialFeatures(highestPkg, item);
            if (featuresToHighest.length > 0) {
                const diff = highestPkg.price - item.price;
                let offer = `• ${item.packageName} ($${item.price}) → ${highestPkg.name} ($${highestPkg.price}): +$${diff}\n`;
                offer += `  And get:\n  ${featuresToHighest.join('\n  ')}`;
                upsellOffers.push(offer);
            }
        }
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
    
    message += `${isMultiple ? 'Keys' : 'Key'}: ${item.key} | ${isMultiple ? 'BPMs' : 'BPM'}: ${item.bpm}\n\n`;
    message += `📦📦 Order #${item.orderNumber}\n\n`;
    
    if (item.packageName === highestPkg?.name) {
        message += `✅✅ This is built for the BIGGG stages - Spotify, radio, wherever you wanna take it!! 🌟🌟\n${item.revisionsRemaining} revisions remaining 🔧🔧\n\n🎁 PRO TIP: Drop a 5-star review and I'll hook you UPPP with $10 off your next order!! Helps me out FOR REALLL 🙏🙏\n\nNow go make some MAGIC happen!! ✨🎤`;
    } else if (middlePkg && item.packageName === middlePkg.name) {
        message += `✅ ${item.revisionsRemaining} revisions remaining 🔧\n${isMultiple ? "Time to make these BEATS slap!! 💥💥" : "Time to make some WAVES!! 🌊🌊"}\n\n🎁 PRO TIP: Leave me a 5-star review and I'll give you $10 off your next beat!! WIN-WIN SITUATION 😉💰💰\n\nLet's get this music out there!!! 🚀🚀`;
    } else { 
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

const generateFileNames = (item: WorkItem) => {
    const safeClientName = item.clientName.replace(/[^a-zA-Z0-9 -]/g, '').trim();
    const keyFormatted = item.key.replace(/\s*\/\s*/g, '_').replace(/#/g, 'sharp');
    const baseName = `${safeClientName} - ${item.genre} ${item.bpm}bpm ${keyFormatted}`;
    return baseName;
};

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
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageToPreview, setMessageToPreview] = useState('');
  
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
    
    const handleGenerateContract = (item: WorkItem) => {
        try {
            let html = contractTemplateHtml;
    
            const agreementDate = new Date().toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
            });
    
            html = html.replace(/{{clientName}}/g, item.clientName || "N/A");
            html = html.replace(/{{orderNumber}}/g, item.orderNumber || "N/A");
            html = html.replace(/{{agreementDate}}/g, agreementDate);
            html = html.replace(/{{producerEmail}}/g, "danodalbeats@gmail.com");

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Contrato - ${item.clientName} - #${item.orderNumber}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
    
        } catch (error: any) {
            console.error('Error al generar el contrato HTML:', error);
            toast({
                variant: 'destructive',
                title: 'Error al generar contrato',
                description: error.message || 'Ocurrió un error inesperado.',
            });
        }
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado al portapapeles!" });
        playSound('genericClick');
    };

    const handlePreviewMessage = (item: WorkItem) => {
        const message = generateClientMessage(item, appState.workPackageTemplates);
        setMessageToPreview(message);
        setIsMessageModalOpen(true);
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

    const columns: ColumnDef<WorkItem>[] = useMemo(() => [
        {
          id: 'tools',
          header: 'Tools',
          cell: ({ row }) => {
            const item = row.original;
            const baseName = generateFileNames(item);
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Wrench className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handlePreviewMessage(item)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Mensaje Cliente</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Nombrar Archivos</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>✩ WAV</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onSelect={() => handleCopyToClipboard(`✩ (JUST INSTRUMENTAL) ${baseName} ✩`)}>
                                            Instrumental
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleCopyToClipboard(`✩ (VOCALS + INSTRUMENTAL) ${baseName} ✩`)}>
                                            Vocal + Inst
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem onSelect={() => handleCopyToClipboard(`♪ (STEMS / SEPARATED INSTRUMENT TRACKS) ${baseName} ♪`)}>
                                ♪ STEMS
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleCopyToClipboard(`♬ (PROJECT FLP) ${baseName} ♬`)}>
                                ♬ FLP
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem onSelect={() => handleGenerateContract(item)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Ver Contrato</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => {
                            const downloadUrl = "https://drive.google.com/uc?export=download&id=1UN9N5MWO3tj5iimjLKGpLgH0Tj-Z9j5u";
                            const downloadFileName = `${item.clientName} ${item.genre} Vocal Chain BY @DANODALS on Fiverr.fst`;
                        
                            const a = document.createElement('a');
                            a.href = downloadUrl;
                            a.download = downloadFileName; 
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            
                            toast({ title: '¡Descarga iniciada!' });
                        }}
                    >
                        <Gift className="mr-2 h-4 w-4" />
                        <span>VocalFst🎁</span>
                    </DropdownMenuItem>
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
                  size="icon"
                  onClick={() => handleOpenEditModal(item)}
                >
                  <Edit className="h-4 w-4" />
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
    ], [appState.workPackageTemplates, handleDateUpdate, handleStatusUpdate, handlePackageUpdate, handleRevisionsUpdate, playSound, handleDeleteWorkItem, handleOpenEditModal, toast]);

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

            <AlertDialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mensaje para el Cliente</AlertDialogTitle>
                  <AlertDialogDescription>
                    Revisa el mensaje generado. Puedes copiarlo con el botón de abajo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-4">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {messageToPreview}
                  </pre>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cerrar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCopyToClipboard(messageToPreview)}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copiar Mensaje
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default WorkTab;

    