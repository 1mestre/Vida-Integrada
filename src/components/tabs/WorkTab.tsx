
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState, WorkItem, WorkPackageTemplate, type Contribution, SoundLibraryItem, SoundType, DrumKitProject } from '@/context/AppStateContext';
import { TrendingUp, Settings, PlusCircle, Wrench, Music, Link, Edit, MessageSquare, Trash2, FileText, Gift, ClipboardCopy, Loader2, Upload, Search, ListFilter, Play, Music4, Sparkles, Quote, Image as ImageIcon } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { generateKitNames } from '@/ai/flows/generate-kit-names-flow';
import { categorizeSound } from '@/ai/flows/categorizeSoundFlow';
import { renameSound } from '@/ai/flows/renameSoundFlow';
import { generateArtPrompt } from '@/ai/flows/generateCoverArtFlow';
import { uploadSound } from '@/ai/flows/uploadSoundFlow';
import { uploadCoverArt } from '@/ai/flows/uploadCoverArtFlow';

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
            width: 800px; /* Fixed width for consistent rendering */
            margin: 0;
            background-color: #ffffff;
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
                                Fiverr Order ID {{orderNumber}}
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
const normalizeKeyString = (key: string | undefined | null): string => {
    if (!key) return '';
    return key.split(',')
        .map(k =>
            k.trim()
             .replace(/[\/\-_]/g, ' or ')
             .replace(/\s+/g, ' ')
        )
        .join(', ');
};
const generateClientMessage = (item: WorkItem, packageTemplates: WorkPackageTemplate[]): string => {
    const isMultiple = item.remakeType.includes('Multiple');
    let message = `Heyyy ${item.clientName}! 👋👋\n\n`;
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
    const normalizedKey = normalizeKeyString(item.key);
    message += `${isMultiple ? 'Keys' : 'Key'}: ${normalizedKey} | ${isMultiple ? 'BPMs' : 'BPM'}: ${item.bpm}\n\n`;
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
    const safeClientName = item.clientName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
    const safeGenre = item.genre.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const safeBPM = item.bpm
        .toString()
        .split(',')
        .map(b => b.trim())
        .filter(b => b)
        .join(', ');
    const safeKeyForDisplay = normalizeKeyString(item.key);
    const safeKeyForFilename = safeKeyForDisplay.replace(/#/g, 'sharp');
    const baseName = `${safeClientName} - ${safeGenre} ${safeBPM}bpm ${safeKeyForFilename}`;
    return baseName
        .replace(/[\\/:\*\?"<>\|]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};
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
const TruncatedCell = ({ text, maxWidth = 100 }: { text: string | number; maxWidth?: number }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="truncate mx-auto text-center" style={{ maxWidth: `${maxWidth}px` }}>
          {text}
        </p>
      </TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};
const soundCategories: SoundType[] = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Perc', 'Rim', '808', 'Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'EXTRAS'];


const WorkTab = () => {
    const { appState, setAppState } = useAppState();
    const { toast } = useToast();
    const { playSound } = useSound();
    
    // States for Fiverr Orders
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [generatingVocalFstId, setGeneratingVocalFstId] = useState<string | null>(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageToPreview, setMessageToPreview] = useState('');

    // States for Income Calculator
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [rateLoading, setRateLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

    // States for Kit Studio
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isGeneratingNames, setIsGeneratingNames] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<SoundType | 'all'>('all');
    const [currentKitName, setCurrentKitName] = useState('');
    const [imagePrompt, setImagePrompt] = useState('');
    const [lastEnhancedPrompt, setLastEnhancedPrompt] = useState<string | null>(null);
    const activeAudio = useRef<HTMLAudioElement | null>(null);

    // --- Effects ---
    useEffect(() => {
        fetch('https://open.er-api.com/v6/latest/USD')
          .then(res => res.json())
          .then(data => { setExchangeRate(data.rates.COP); setRateLoading(false); })
          .catch(() => { setExchangeRate(4000); setRateLoading(false); });
    }, []);

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

    // --- Handlers for Fiverr Orders ---
    const handleOpenEditModal = (item: WorkItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
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
    const handleGeneratePdf = async (item: WorkItem) => {
        setGeneratingPdfId(item.id);
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.top = 'auto';
        let html = contractTemplateHtml;
        const agreementDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        html = html.replace(/{{clientName}}/g, item.clientName || "N/A");
        html = html.replace(/{{orderNumber}}/g, item.orderNumber || "N/A");
        html = html.replace(/{{agreementDate}}/g, agreementDate);
        html = html.replace(/{{producerEmail}}/g, "danodalbeats@gmail.com");
        tempElement.innerHTML = html;
        document.body.appendChild(tempElement);
        try {
            const canvas = await html2canvas(tempElement.querySelector('.contract-container')!, { scale: 4, useCORS: true, backgroundColor: null });
            const pdfWidth = 595.28;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: [pdfWidth, pdfHeight] });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
            const fileName = `Exclusive Rights for ${item.clientName} Contract ${item.orderNumber}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'Error al generar PDF', description: 'No se pudo crear el archivo PDF. Inténtalo de nuevo.' });
        } finally {
            document.body.removeChild(tempElement);
            setGeneratingPdfId(null);
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
    const handleDownloadVocalPreset = async (item: WorkItem) => {
        setGeneratingVocalFstId(item.id);
        const sourceFilePath = '/sounds/NAME GENRE Vocal Chain BY @DANODALS  on Fiverr.fst';
        try {
            const response = await fetch(sourceFilePath);
            if (!response.ok) throw new Error(`File not found: ${response.statusText}`);
            const blob = await response.blob();
            const safeClientName = item.clientName.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Preset';
            const safeGenre = item.genre.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Vocal';
            const downloadFileName = `${safeClientName} - ${safeGenre} Vocal Preset.fst`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = downloadFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            toast({ title: 'Descarga Iniciada!', description: `Guardando como: ${downloadFileName}` });
        } catch (error: any) {
            console.error("Error initiating download:", error);
            toast({ variant: 'destructive', title: 'Error de Descarga', description: `No se pudo encontrar el archivo del preset. Asegúrate que está en public/sounds/.` });
        } finally {
            setGeneratingVocalFstId(null);
        }
    };
    const handleStatusUpdate = useCallback((itemId: string, newStatus: WorkItem['deliveryStatus']) => {
        setAppState(prevState => {
          const statusToColumnMap: Record<WorkItem['deliveryStatus'], 'todo' | 'inprogress' | 'done'> = {
            'Pending': 'todo', 'In Transit': 'inprogress', 'In Revision': 'inprogress', 'Delivered': 'done', 'Returned': 'done',
          };
          const updatedWorkItems = prevState.workItems.map(item => item.id === itemId ? { ...item, deliveryStatus: newStatus } : item);
          const updatedTasks = prevState.tasks.map(task => task.workItemId === itemId ? { ...task, column: statusToColumnMap[newStatus] } : task);
          return { ...prevState, workItems: updatedWorkItems, tasks: updatedTasks };
        });
    }, [setAppState]);
    const handleRevisionsUpdate = (itemId: string, newRevisions: number) => {
        setAppState(prevState => ({ ...prevState, workItems: prevState.workItems.map(item => item.id === itemId ? { ...item, revisionsRemaining: newRevisions } : item) }));
    };
    const handleDateUpdate = useCallback((itemId: string, newDate: Date) => {
        const formattedDate = format(newDate, 'yyyy-MM-dd');
        setAppState(prevState => {
            const updatedWorkItems = prevState.workItems.map(item => item.id === itemId ? { ...item, deliveryDate: formattedDate } : item);
            const updatedEvents = prevState.calendarEventsData.map(event => event.workItemId === itemId ? { ...event, start: formattedDate } : event);
            return { ...prevState, workItems: updatedWorkItems, calendarEventsData: updatedEvents };
        });
    }, [setAppState]);
    const handlePackageUpdate = useCallback((itemId: string, newPackageName: string) => {
        const template = appState.workPackageTemplates.find(t => t.name === newPackageName);
        if (!template) return;
        setAppState(prevState => {
            const updatedWorkItems = prevState.workItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, packageName: template.name, price: template.price, revisionsRemaining: template.revisions, songLength: template.songLength, numberOfInstruments: template.numberOfInstruments, quantity: template.quantity || 1, separateFiles: template.separateFiles, masterAudio: template.masterAudio, projectFileDelivery: template.projectFileDelivery, exclusiveLicense: template.exclusiveLicense, vocalProduction: template.vocalProduction, vocalChainPreset: template.vocalChainPreset };
                }
                return item;
            });
            return { ...prevState, workItems: updatedWorkItems };
        });
    }, [appState.workPackageTemplates, setAppState]);

    // --- Handlers for Income Calculator ---
    const handleAddIncome = async () => {
        const rawAmount = parseFloat(amount);
        if (isNaN(rawAmount) || rawAmount <= 0) {
          toast({ variant: "destructive", title: "Monto Inválido", description: "Por favor, introduce un número positivo." });
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
          setExchangeRate(currentRate);
          let netUSD = 0;
          let netCOP = 0;
          if (appState.selectedInputCurrencyIngresos === 'USD') {
            const grossAmount = rawAmount;
            if (grossAmount <= 3) {
              toast({ variant: "destructive", title: "Monto Demasiado Bajo", description: "El monto en USD debe ser mayor a $3 para cubrir las comisiones." });
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
            toast({ variant: "destructive", title: "Error de Cálculo", description: "No se pudo procesar el ingreso. El resultado era inválido o negativo." });
            setRateLoading(false);
            return;
          }
          playSound('pomodoroStart');
          const newContribution: Contribution = { id: uuidv4(), date: new Date().toISOString(), netUSDValue: netUSD, netCOPValue: netCOP };
          setAppState(prevState => ({ contributions: [newContribution, ...prevState.contributions] }));
          setAmount('');
        } catch (error) {
          console.error("No se pudo obtener la tasa de cambio, usando fallback.", error);
          toast({ variant: "destructive", title: "Error de Red", description: "No se pudo obtener la tasa de cambio actualizada." });
        } finally {
          setRateLoading(false);
        }
    };
    const handleDeleteIncome = (id: string) => {
        playSound('deleteItem');
        const updatedContributions = appState.contributions.filter(c => c.id !== id);
        setAppState({ contributions: updatedContributions });
    };

    // --- Handlers for Kit Studio ---
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
        setCurrentKitName(name);
        handleUpdateKitName(name);
        toast({ title: "Nombre del kit actualizado", description: `Has seleccionado "${name}".` });
    };
    const handlePlaySound = useCallback((url: string) => {
        if (!url || !url.startsWith('http')) {
          toast({ variant: "destructive", title: "URL de Sonido Inválida", description: "Este sonido no tiene una fuente válida. Intenta subirlo de nuevo." });
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
          if (e.name === 'AbortError') return;
          console.error("Error playing audio:", e);
          toast({ variant: "destructive", title: "Error de Reproducción", description: "No se pudo cargar el audio. La URL puede ser inválida o el archivo está corrupto." });
        });
    }, [toast]);
    const handleTypeChange = (id: string, newType: SoundType) => {
        setAppState(prevState => ({ ...prevState, soundLibrary: prevState.soundLibrary.map(item => item.id === id ? { ...item, soundType: newType } : item) }));
    };
    const handleKeyChange = (id: string, newKey: string) => {
        setAppState(prevState => ({ ...prevState, soundLibrary: prevState.soundLibrary.map(item => item.id === id ? { ...item, key: newKey || null } : item) }));
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
          return { ...prevState, soundLibrary: prevState.soundLibrary.filter(item => item.id !== id), drumKitProjects: updatedProjects, }
        });
        toast({ title: "Sonido Eliminado", description: `"${soundToDelete.originalName}" ha sido borrado de tu librería.` });
    };
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setIsProcessing(true);
        setProcessingStatus([`Iniciando proceso para ${acceptedFiles.length} archivo(s)...`]);
        const audioFilesToProcess: { file: File, name: string }[] = [];
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
            newLibraryItems.push({ id: uuidv4(), originalName: f.name, storageUrl, soundType, key });
            setProcessingStatus(prev => [...prev, `✅ Procesado: ${f.name}`]);
          } catch (error) {
            setProcessingStatus(prev => [...prev, `❌ Error en ${f.name}`]);
            console.error(`Error procesando ${f.name}:`, error);
            toast({ variant: "destructive", title: "Error de Procesamiento", description: `No se pudo procesar el archivo ${f.name}.` });
          }
        }
        setAppState(prevState => ({ ...prevState, soundLibrary: [...prevState.soundLibrary, ...newLibraryItems] }));
        toast({ title: "¡Éxito!", description: `Se añadieron ${newLibraryItems.length} nuevos sonidos a tu librería.` });
        setIsProcessing(false);
        setProcessingStatus([]);
    }, [setAppState, toast]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'audio/wav': ['.wav'], 'audio/mpeg': ['.mp3'], 'application/zip': ['.zip'] } });
    const onCoverDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!activeProject || acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        setIsUploadingCover(true);
        toast({ title: "Subiendo carátula personalizada..." });
        try {
          const imageDataUri = await fileToDataUri(file);
          const finalUrl = await uploadCoverArt({ imageDataUri });
          setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, coverArtUrl: finalUrl } : p) }));
          toast({ title: "¡Éxito!", description: "Tu carátula personalizada ha sido subida." });
        } catch (error) {
          console.error("Error uploading custom cover art:", error);
          toast({ variant: "destructive", title: "Error de Subida", description: `No se pudo subir la carátula. ${error instanceof Error ? error.message : ''}` });
        } finally {
          setIsUploadingCover(false);
        }
    }, [activeProject, activeProjectId, setAppState, toast]);
    const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({ onDrop: onCoverDrop, accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }, multiple: false });
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
        const newKit: DrumKitProject = { id: Date.now(), name: finalName, coverArtUrl: null, imagePrompt: '', seoNames: [], soundIds: [], soundNamesInKit: {} };
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
    };
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
          toast({ variant: "destructive", title: "Kit Vacío", description: "Añade sonidos al kit antes de descargarlo." });
          return;
        }
        setIsDownloading(true);
        toast({ title: "Iniciando descarga...", description: `Preparando "${activeProject.name}.zip". Esto puede tardar un momento.` });
        const zip = new JSZip();
        try {
            const readmeContent = `Hey! Thanks for downloading! <3\n\nAll sounds are free to use, hope you make some fire beats with them! :D\n\nEnjoy! :)\n\n- Danodals`;
            zip.file('README.txt', readmeContent);
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
          toast({ variant: "destructive", title: "Error de Descarga", description: "No se pudo generar el archivo ZIP." });
        } finally {
          setIsDownloading(false);
        }
    };
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
        } finally {
            setIsGeneratingNames(false);
        }
    };
    const handleGenerateArtPrompt = async () => {
        if (!activeProject) {
          toast({ variant: "destructive", title: "Error", description: "Por favor, crea o selecciona un kit primero." });
          return;
        }
        if (!imagePrompt) {
          toast({ variant: "destructive", title: "Error", description: "La descripción para la IA no puede estar vacía." });
          return;
        }
        if (!currentKitName.trim()) {
          toast({ variant: "destructive", title: "Error", description: "El nombre del kit no puede estar vacío para generar el prompt." });
          return;
        }
        setIsGeneratingPrompt(true);
        setAppState(prevState => ({ ...prevState, drumKitProjects: prevState.drumKitProjects.map(p => p.id === activeProjectId ? { ...p, imagePrompt: imagePrompt, name: currentKitName.trim() } : p) }));
        const result = await generateArtPrompt({ prompt: imagePrompt, kitName: currentKitName.trim() });
        if (result.error) {
          toast({ variant: "destructive", title: "Error de IA", description: result.error });
          setLastEnhancedPrompt(null);
        } else if (result.finalPrompt) {
          setLastEnhancedPrompt(result.finalPrompt);
          toast({ title: "¡Prompt de arte generado!", description: "Puedes verlo y copiarlo para usarlo en otra herramienta." });
        }
        setIsGeneratingPrompt(false);
    };

    // --- Memoized Values ---
    const sortedWorkItems = useMemo(() => {
        return [...appState.workItems].sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
    }, [appState.workItems]);
    const financialSummary = useMemo(() => {
        const incomeThisMonth = appState.contributions.filter(c => c.date.startsWith(currentMonthKey)).reduce((sum, c) => sum + c.netCOPValue, 0);
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
    const filteredSoundLibrary = useMemo(() => {
        return appState.soundLibrary.filter(item => {
            const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === 'all' || item.soundType === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [appState.soundLibrary, searchTerm, filterType]);
    
    // --- Table Columns ---
    const columns: ColumnDef<WorkItem>[] = useMemo(() => [
        {
          id: 'tools',
          header: 'Tools',
          cell: ({ row }) => {
            const item = row.original;
            const baseName = generateFileNames(item);
            const isLoadingPdf = generatingPdfId === item.id;
            const isLoadingVocalFst = generatingVocalFstId === item.id;
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
                        <span>Mensaje Delivery</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Nombrar Archivos</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>WAV</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onSelect={() => handleCopyToClipboard(`(JUST INSTRUMENTAL) ${baseName}`)}>Instrumental</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleCopyToClipboard(`(VOCALS + INSTRUMENTAL) ${baseName}`)}>Vocal + Inst</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem onSelect={() => handleCopyToClipboard(`(STEMS - SEPARATED INSTRUMENT TRACKS) ${baseName}`)}>STEMS</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleCopyToClipboard(`(PROJECT FLP) ${baseName}`)}>FLP</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem onSelect={() => handleGeneratePdf(item)} disabled={isLoadingPdf}>
                       {isLoadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                       <span>Descargar Contrato</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDownloadVocalPreset(item)} disabled={isLoadingVocalFst}>
                        {isLoadingVocalFst ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                        <span>VocalFst🎁</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
        { accessorKey: 'clientName', header: 'Cliente', cell: ({ row }) => <TruncatedCell text={row.getValue('clientName')} maxWidth={120} /> },
        { accessorKey: 'deliveryDate', header: 'Fecha', cell: (props) => <EditableDateCell {...props} updateDate={handleDateUpdate} /> },
        { accessorKey: 'key', header: 'Key', cell: ({ row }) => {
            const keyText = row.getValue('key') as string;
            const firstKey = normalizeKeyString(keyText).split(',')[0];
            const parts = firstKey.split(' or ');
            return (
              <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <div className="truncate max-w-[110px] mx-auto text-center">
                              <span className="font-semibold text-orange-500">{parts[0]}</span>
                              {parts[1] && (<><span className="text-muted-foreground text-xs mx-1">or</span><span className="font-semibold text-sky-700">{parts[1]}</span></>)}
                          </div>
                      </TooltipTrigger>
                      <TooltipContent><p>{normalizeKeyString(keyText)}</p></TooltipContent>
                  </Tooltip>
              </TooltipProvider>
            );
        }},
        { accessorKey: 'bpm', header: 'BPM', cell: ({ row }) => <TruncatedCell text={row.getValue('bpm')} maxWidth={80} /> },
        { accessorKey: 'deliveryStatus', header: 'Estado', cell: ({ row }) => {
            const item = row.original;
            const statusOptions: WorkItem['deliveryStatus'][] = ['Pending', 'In Transit', 'In Revision', 'Delivered', 'Returned'];
            return (
                <div className="text-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="p-0 h-auto"><Badge className={cn("cursor-pointer", statusColorMap[item.deliveryStatus])}>{item.deliveryStatus}</Badge></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {statusOptions.map(status => (<DropdownMenuItem key={status} onSelect={() => handleStatusUpdate(item.id, status)}><span className={cn('h-2 w-2 rounded-full mr-2', statusColorMap[status])} /><span>{status}</span></DropdownMenuItem>))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }},
        { accessorKey: 'revisionsRemaining', header: 'Revs', cell: ({ row }) => {
            const item = row.original;
            const revisionOptions = [4, 3, 2, 1, 0];
            return (
                <div className="text-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className={cn("font-semibold", revisionColorMap[item.revisionsRemaining])}>{item.revisionsRemaining}</Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">{revisionOptions.map(revs => (<DropdownMenuItem key={revs} onSelect={() => handleRevisionsUpdate(item.id, revs)}><span className={cn('font-semibold', revisionColorMap[revs])}>{revs}</span></DropdownMenuItem>))}</DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }},
        { accessorKey: 'packageName', header: 'Pack', cell: ({ row }) => {
            const item = row.original;
            const currentPackage = appState.workPackageTemplates.find(p => p.name === item.packageName);
            const colorClass = currentPackage ? currentPackage.colorClassName : 'bg-gray-500';
            return (
                <div className="text-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="p-0 h-auto"><Badge className={cn("cursor-pointer", colorClass)}>{item.packageName}</Badge></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {appState.workPackageTemplates.map(pkg => (<DropdownMenuItem key={pkg.id} onSelect={() => handlePackageUpdate(item.id, pkg.name)}><span className={cn('h-2 w-2 rounded-full mr-2', pkg.colorClassName)} /><span>{pkg.name}</span></DropdownMenuItem>))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }},
        { accessorKey: 'price', header: 'Precio', cell: ({row}) => <div className="text-center font-medium">{formatUSD(row.original.price)}</div> },
        { accessorKey: 'orderNumber', header: 'Orden #', cell: ({ row }) => <TruncatedCell text={row.getValue('orderNumber')} maxWidth={100} /> },
        { accessorKey: 'genre', header: 'Género', cell: ({ row }) => <TruncatedCell text={row.getValue('genre')} maxWidth={90} /> },
        { id: 'actions', header: () => <div className="text-right">Acciones</div>, cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => handleOpenEditModal(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteWorkItem(item)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            );
        }}
    ], [appState.workPackageTemplates, handleDateUpdate, handleStatusUpdate, handlePackageUpdate, handleRevisionsUpdate, playSound, handleDeleteWorkItem, handleOpenEditModal, toast, generatingPdfId, generatingVocalFstId]);
    const table = useReactTable({ data: sortedWorkItems, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <Tabs defaultValue="fiverr" className="w-full">
            <div className="flex justify-center mb-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="fiverr">Órdenes Fiverr</TabsTrigger>
                    <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
                    <TabsTrigger value="kit-studio">Kit Studio</TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="fiverr" className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col items-start">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FIVERR📀</h1>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <a href="https://www.fiverr.com/seller_dashboard" target="_blank" rel="noopener noreferrer" onClick={() => playSound('genericClick')}>
                        <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm"><Link className="mr-2 h-4 w-4" />Fiverr</Button>
                      </a>
                      <a href="https://tunebat.com/Analyzer" target="_blank" rel="noopener noreferrer" onClick={() => playSound('genericClick')}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"><Music className="mr-2 h-4 w-4" />Tunebat</Button>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" onClick={handleOpenPackageSettingsModal}><Settings className="mr-2 h-4 w-4" />Set Packages</Button>
                     <Button onClick={handleOpenNewOrderModal} className="h-12 md:h-14 text-base md:text-lg">Nueva Orden🤑💵</Button>
                    </div>
                </div>
                <Card className="glassmorphism-card">
                  <CardContent className="pt-6">
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id} className="text-center whitespace-nowrap px-2 py-3">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id} className="py-1 px-2 text-center">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
                                ) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No hay datos.</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ingresos" className="space-y-8">
                <Card className="glassmorphism-card">
                    <CardHeader>
                        <CardTitle className="flex items-center"><TrendingUp className="mr-2 text-primary" />Meta de Ingresos - {format(new Date(), 'MMMM yyyy', { locale: es })}</CardTitle>
                        <CardDescription>Establece y sigue tu objetivo de ingresos mensuales.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Input type="number" placeholder="Meta en COP" value={currentMonthTarget || ''} onChange={(e) => setAppState({ monthlyTargets: { ...appState.monthlyTargets, [currentMonthKey]: Number(e.target.value) } })} className="bg-background/50 border-border" />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Progreso: {formatCOP(financialSummary.incomeThisMonth)} / {formatCOP(currentMonthTarget)}</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Progreso Meta del Mes ({financialSummary.progress.toFixed(1)}%)</p>
                            <Progress value={financialSummary.progress} className="h-4 shimmer [&>div]:bg-ios-green"/>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Progreso del Mes (Tiempo: {monthTimeProgress.toFixed(1)}%)</p>
                            <Progress value={monthTimeProgress} className="h-4 [&>div]:bg-ios-orange"/>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="glassmorphism-card">
                        <CardHeader><CardTitle>Añadir Ingreso</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Select value={appState.selectedInputCurrencyIngresos} onValueChange={(val: 'USD' | 'COP') => setAppState({ selectedInputCurrencyIngresos: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COP">COP</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select>
                                <Input type="number" placeholder={`Monto en ${appState.selectedInputCurrencyIngresos}`} value={amount} onChange={(e) => setAmount(e.target.value)} className="sm:col-span-2 bg-background/50 border-border" />
                            </div>
                            <Button onClick={handleAddIncome} disabled={rateLoading || !amount} className="w-full"><PlusCircle className="mr-2 h-4 w-4" />{rateLoading ? 'Cargando tasa...' : 'Añadir Ingreso'}</Button>
                            <p className="text-xs text-center text-muted-foreground">Tasa de cambio actual (USD a COP): {rateLoading ? '...' : exchangeRate?.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card className="glassmorphism-card">
                        <CardHeader><CardTitle>Historial de Ingresos</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64"><ul className="space-y-3 pr-4">{appState.contributions.map(c => (<li key={c.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2"><div><div className="font-medium text-ios-green">{formatCOP(c.netCOPValue)}</div><div className="text-xs text-muted-foreground">{format(new Date(c.date), 'dd MMM yyyy', { locale: es })} - {formatUSD(c.netUSDValue)}</div></div><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDeleteIncome(c.id)}><Trash2 className="h-4 w-4" /></Button></li>))}</ul></ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="kit-studio" className="space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold">Kit Studio</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">Gestiona tu librería de sonidos y ensambla tus próximos drum kits con la ayuda de IA.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card className="glassmorphism-card lg:col-span-1">
                        <CardHeader><CardTitle>Librería Central</CardTitle><CardDescription>Sube, busca y categoriza todos tus sonidos.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div {...getRootProps()} className={cn("border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors", isDragActive && "border-primary bg-primary/10")}>
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center gap-4">
                                    {isProcessing ? (<><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="mt-4 text-sm text-primary">Procesando archivos...</p><ScrollArea className="h-24 w-full text-left text-xs bg-background/50 p-2 rounded-md">{processingStatus.map((status, i) => <p key={i}>{status}</p>)}</ScrollArea></>) : (<><Upload className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">Arrastra un .zip o archivos de audio aquí</p><Button variant="outline">O selecciona archivos</Button></>)}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar en la librería..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                                <Select value={filterType} onValueChange={(v) => setFilterType(v as SoundType | 'all')}><SelectTrigger className="w-[180px]"><ListFilter className="mr-2 h-4 w-4" /><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{soundCategories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent></Select>
                            </div>
                            <ScrollArea className="h-96 rounded-md border"><div className='p-4 space-y-2'><AnimatePresence>{filteredSoundLibrary.length === 0 && !isProcessing ? (<p className="text-muted-foreground text-center py-16">Tu librería está vacía o no hay coincidencias.</p>) : (filteredSoundLibrary.map(item => (<motion.div key={item.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} draggable onDragStart={(e) => handleDragStart(e, item.id)} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 cursor-grab active:cursor-grabbing"><Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => handlePlaySound(item.storageUrl)}><Play className="h-4 w-4"/></Button><p className="flex-grow text-sm truncate" title={item.originalName}>{item.originalName}</p><div className="flex items-center gap-2 flex-shrink-0"><Select value={item.soundType} onValueChange={(v) => handleTypeChange(item.id, v as SoundType)}><SelectTrigger className="w-[130px] h-8 text-xs shrink-0"><SelectValue/></SelectTrigger><SelectContent>{soundCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent></Select><Input placeholder="Key" value={item.key || ''} onChange={(e) => handleKeyChange(item.id, e.target.value)} className="w-[70px] h-8 text-xs shrink-0" /><Button size="icon" variant="destructive" className="h-8 w-8 shrink-0" onClick={() => handleDeleteSound(item.id)}><Trash2 className="h-4 w-4"/></Button></div></motion.div>)))}</AnimatePresence></div></ScrollArea>
                        </CardContent>
                    </Card>
                    <Card className="glassmorphism-card lg:col-span-1" onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnAssembler}>
                        <CardHeader><div className="flex justify-between items-center"><CardTitle>Ensamblador de Kits</CardTitle><Button onClick={handleDownloadKit} disabled={!activeProject || activeProject.soundIds.length === 0 || isDownloading}>{isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Descargar Kit</Button></div><CardDescription>Arrastra sonidos aquí para crear y personalizar tus kits.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 items-center">
                               <Select value={activeProjectId?.toString() || ''} onValueChange={(v) => setActiveProjectId(Number(v))}><SelectTrigger className='w-full'><SelectValue placeholder="Selecciona un kit..."/></SelectTrigger><SelectContent>{appState.drumKitProjects.map(proj => (<SelectItem key={proj.id} value={proj.id.toString()}>{proj.name}</SelectItem>))}</SelectContent></Select>
                                <Button onClick={handleCreateNewKit}><PlusCircle className='h-4 w-4'/></Button>
                                {activeProject && (<AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Seguro que quieres eliminar este kit?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se borrará permanentemente el proyecto del kit "{activeProject.name}". Los sonidos originales permanecerán en tu librería.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteKit(activeProject.id)}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}
                            </div>
                            <Separator />
                            {activeProject ? (
                                <div className="space-y-4">
                                  <div className='p-4 border rounded-lg space-y-4 bg-background/30'>
                                      <div {...getCoverRootProps()} className={cn("border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/20 transition-colors", isUploadingCover && "border-primary bg-primary/10")}>
                                          <input {...getCoverInputProps()} />
                                          <div className="flex flex-col items-center justify-center gap-2">{isUploadingCover ? (<><Loader2 className="h-8 w-8 text-primary animate-spin" /><p className="text-sm text-primary">Subiendo carátula...</p></>) : (<><ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Arrastra una imagen aquí o haz clic para subir una carátula personalizada</p></>)}</div>
                                      </div>
                                      <div className="relative flex items-center justify-center my-2"><Separator className="flex-grow" /><span className="absolute px-2 bg-background/30 text-xs text-muted-foreground">Ó</span></div>
                                      <div className='space-y-4 flex-grow'>
                                          <div><Label htmlFor="kit-prompt">1. Describe el concepto con IA</Label><Input id="kit-prompt" placeholder="Ej: Dark trap, estilo Travis Scott..." value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}/></div>
                                          <Button onClick={handleGenerateNames} disabled={isGeneratingNames || !imagePrompt} size="sm" variant="outline" className="w-full text-purple-400 border-purple-400/50 hover:bg-purple-400/10 hover:text-purple-300"><Sparkles className='mr-2'/>Sugerir Nombres</Button>
                                          <div><Label htmlFor="kit-name">2. Nombre final para carátula</Label><Input id="kit-name" value={currentKitName} onChange={(e) => setCurrentKitName(e.target.value)} onBlur={onKitNameBlur} placeholder="Escribe el nombre del kit" /></div>
                                      </div>
                                      <div className="flex flex-col gap-2"><Button onClick={handleGenerateArtPrompt} disabled={isGeneratingPrompt || !imagePrompt || !currentKitName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700"><Quote className='mr-2 h-4 w-4'/>Generar Prompt de Arte</Button></div>
                                      <div className="text-center text-xs text-muted-foreground my-2">Una vez generado, usa el prompt en una de estas herramientas:</div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          <a href="https://aistudio.google.com/gen-media" target="_blank" rel="noopener noreferrer" className="w-full"><Button variant="outline" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"><Sparkles className="mr-2 h-4 w-4" />AI Studio</Button></a>
                                          <a href="https://labs.google/fx/es-419/tools/whisk" target="_blank" rel="noopener noreferrer" className="w-full"><Button variant="outline" className="w-full bg-blue-600 hover:bg-blue-700 text-white"><Sparkles className="mr-2 h-4 w-4" />ImageFX</Button></a>
                                      </div>
                                      {activeProject.seoNames.length > 0 && (<div className="space-y-2"><Label>Nombres Sugeridos:</Label><div className="flex flex-wrap gap-2">{activeProject.seoNames.map((name, i) => (<Badge key={i} variant="outline" className="cursor-pointer" onClick={() => onSuggestedNameClick(name)}>{name}</Badge>))}</div></div>)}
                                      {lastEnhancedPrompt && (<AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="w-full mt-2"><Quote className="mr-2 h-4 w-4" />Ver Prompt Final Usado</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Prompt Final Generado por IA</AlertDialogTitle><AlertDialogDescription>Este es el prompt detallado que generó la IA. Cópialo y pégalo en AI Studio o ImageFX para crear tu carátula.</AlertDialogDescription></AlertDialogHeader><div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-4"><pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{lastEnhancedPrompt}</pre></div><AlertDialogFooter><AlertDialogCancel>Cerrar</AlertDialogCancel><AlertDialogAction onClick={() => { navigator.clipboard.writeText(lastEnhancedPrompt); toast({ title: "Prompt copiado!" }); }}><ClipboardCopy className="mr-2 h-4 w-4" />Copiar Prompt</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}
                                  </div>
                                  <ScrollArea className={cn("h-[250px] rounded-md border p-4 space-y-2", activeProjectId && "border-primary/50")}>
                                      <AnimatePresence>{activeProject.soundIds.length === 0 ? (<div className='text-center text-muted-foreground pt-16'><p>Arrastra y suelta sonidos aquí.</p></div>) : (activeProject.soundIds.map(soundId => { const soundInfo = appState.soundLibrary.find(s => s.id === soundId); const nameInKit = activeProject.soundNamesInKit[soundId] || soundInfo?.originalName || 'Cargando...'; const isLoadingName = nameInKit === 'Generando nombre...'; return (<motion.div key={soundId} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => soundInfo && handlePlaySound(soundInfo.storageUrl)} disabled={!soundInfo}><Play className="h-4 w-4"/></Button><p className="flex-grow text-sm truncate" title={soundInfo?.originalName}>{isLoadingName ? <span className='flex items-center gap-2 text-muted-foreground'><Loader2 className='h-4 w-4 animate-spin'/>Generando...</span> : nameInKit}</p>{soundInfo && <Badge variant="outline" className="text-xs">{soundInfo.soundType}</Badge>}<Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleRemoveFromKit(soundId)}><Trash2 className="h-4 w-4"/></Button></motion.div>) }))}</AnimatePresence>
                                  </ScrollArea>
                                </div>
                            ) : (<div className='text-center text-muted-foreground h-[50vh] flex flex-col items-center justify-center'><Music4 className="mx-auto h-16 w-16" /><p className="mt-4">Crea un nuevo kit o selecciona uno para empezar.</p></div>)}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* Modals */}
            <WorkItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={selectedItem} />
            <PackageSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
            <AlertDialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Mensaje para el Cliente</AlertDialogTitle><AlertDialogDescription>Revisa el mensaje generado. Puedes copiarlo con el botón de abajo.</AlertDialogDescription></AlertDialogHeader>
                <div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-4"><pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{messageToPreview}</pre></div>
                <AlertDialogFooter><AlertDialogCancel>Cerrar</AlertDialogCancel><AlertDialogAction onClick={() => handleCopyToClipboard(messageToPreview)}><ClipboardCopy className="mr-2 h-4 w-4" />Copiar Mensaje</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </Tabs>
    );
};

export default WorkTab;
