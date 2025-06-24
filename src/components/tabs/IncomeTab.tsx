
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAppState, type Contribution } from '@/context/AppStateContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle, TrendingUp, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSound } from '@/context/SoundContext';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const IncomeDisplay = ({ monthlyTotals, accumulatedTotals, progress }: {
    monthlyTotals: { cop: number, usd: number };
    accumulatedTotals: { cop: number, usd: number };
    progress: number;
}) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">
                        Ingresos Este Mes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-baseline gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold tracking-tighter text-yellow-500">{formatCOP(monthlyTotals.cop)}</p>
                            <p className="text-xs font-medium text-yellow-500">(COP)</p>
                        </div>
                        <div className="text-2xl font-bold text-muted-foreground">/</div>
                        <div className="text-center">
                            <p className="text-2xl font-bold tracking-tighter text-green-500">{formatUSD(monthlyTotals.usd)}</p>
                            <p className="text-xs font-medium text-green-500">(USD)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Ingresos Acumulados: {formatCOP(accumulatedTotals.cop)} / {formatUSD(accumulatedTotals.usd)}
                </p>
            </div>
            {progress >= 100 && (
                <Card className="glassmorphism-card bg-ios-green/20 border-ios-green p-4 text-center">
                    <p className="font-bold text-ios-green animate-pulse">🎉✨ ¡FELICITACIONES! ¡META ALCANZADA! ✨🎉</p>
                </Card>
            )}
        </div>
    );
};


const IncomeTab = () => {
  const { appState, setAppState } = useAppState();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

  useEffect(() => {
    setRateLoading(true);
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

  const handleAddIncome = async () => {
    // 1. Validar y convertir el input a un número de forma segura.
    const rawAmount = parseFloat(amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Monto Inválido",
        description: "Por favor, introduce un número positivo.",
      });
      console.error("Monto inválido introducido.");
      return;
    }
    
    setRateLoading(true);
    
    // 2. Obtener la tasa de cambio actual.
    let currentRate = 4000; // Tasa de fallback
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (response.ok) {
        const data = await response.json();
        currentRate = data.rates.COP;
      }
      setExchangeRate(currentRate);
    } catch (error) {
      console.error("No se pudo obtener la tasa de cambio, usando fallback.", error);
      setExchangeRate(currentRate);
    }
  
    let netUSD = 0;
    let netCOP = 0;
  
    // 3. Aplicar la lógica de negocio correcta.
    if (appState.selectedInputCurrencyIngresos === 'USD') {
      const grossAmount = rawAmount;
      netUSD = (grossAmount - 3) * 0.97;
      netCOP = netUSD * currentRate;
    } else { // Si el input es en COP
      netCOP = rawAmount;
      netUSD = netCOP / currentRate;
    }
  
    // Asegurarse de que no estamos guardando NaN
    if (isNaN(netUSD) || isNaN(netCOP)) {
        console.error("Error en el cálculo, resultado es NaN. Revisar fórmula.");
        toast({
          variant: "destructive",
          title: "Error de Cálculo",
          description: "No se pudo procesar el ingreso. El resultado era inválido.",
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
  
    // 4. Actualizar el estado de la aplicación.
    setAppState(prevState => ({
      contributions: [newContribution, ...prevState.contributions],
    }));
    
    // Limpiar el formulario después de guardar.
    setAmount('');
    setRateLoading(false);
  };


  const handleDeleteIncome = (id: string) => {
    playSound('deleteItem');
    const updatedContributions = appState.contributions.filter(c => c.id !== id);
    setAppState({ contributions: updatedContributions });
  };
  
  const { monthlyTotals, accumulatedTotals, progress } = useMemo(() => {
    const monthlyContributions = appState.contributions.filter(c => c.date.startsWith(currentMonthKey));

    const monthlyCOP = monthlyContributions.reduce((sum, c) => sum + c.netCOPValue, 0);
    const monthlyUSD = monthlyContributions.reduce((sum, c) => sum + c.netUSDValue, 0);
    
    const accumulatedCOP = appState.contributions.reduce((sum, c) => sum + c.netCOPValue, 0);
    const accumulatedUSD = appState.contributions.reduce((sum, c) => sum + c.netUSDValue, 0);
    
    const monthlyProgress = currentMonthTarget > 0 ? (monthlyCOP / currentMonthTarget) * 100 : 0;

    return {
        monthlyTotals: { cop: monthlyCOP, usd: monthlyUSD },
        accumulatedTotals: { cop: accumulatedCOP, usd: accumulatedUSD },
        progress: monthlyProgress
    };
  }, [appState.contributions, currentMonthKey, currentMonthTarget]);

  const monthTimeProgress = useMemo(() => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return (today.getDate() / endOfMonth.getDate()) * 100;
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
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
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Meta en COP"
                value={currentMonthTarget || ''}
                onChange={(e) => setAppState({ monthlyTargets: { ...appState.monthlyTargets, [currentMonthKey]: Number(e.target.value) } })}
                className="bg-background/50 border-border"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Progreso: {formatCOP(monthlyTotals.cop)} / {formatCOP(currentMonthTarget)}
              </span>
            </div>
            
            <div className="space-y-2">
                <p className="text-sm font-medium">Progreso Meta del Mes ({progress.toFixed(1)}%)</p>
                <Progress value={progress} className="h-4 shimmer [&>div]:bg-ios-green"/>
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
              {rateLoading ? 'Calculando...' : 'Añadir Ingreso'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Tasa de cambio actual (USD a COP): {rateLoading ? '...' : exchangeRate?.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
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
                                            <span className={`font-bold ${achieved ? 'text-ios-green' : 'text-ios-orange'}`}>
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
      <IncomeDisplay 
        monthlyTotals={monthlyTotals}
        accumulatedTotals={accumulatedTotals}
        progress={progress}
      />
    </div>
  );
};

export default IncomeTab;
