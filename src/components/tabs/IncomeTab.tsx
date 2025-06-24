
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAppState } from '@/context/AppStateContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle, TrendingUp, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSound } from '@/context/SoundContext';

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const IncomeTab = () => {
  const { appState, setAppState } = useAppState();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const { playSound } = useSound();
  
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

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

  const handleAddIncome = () => {
    if (!amount || !exchangeRate) return;

    playSound('pomodoroStart'); // Success sound
    
    const numericAmount = parseFloat(amount);
    let newContribution;

    if (appState.selectedInputCurrencyIngresos === 'USD') {
      const fee = 3;
      const percentageFee = 0.03;
      if (numericAmount <= fee) return;
      const netUSD = (numericAmount - fee) * (1 - percentageFee);
      const netCOP = netUSD * exchangeRate;
      newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSD, rate: exchangeRate, netCOP };
    } else {
      const netCOP = numericAmount;
      const netUSD = netCOP / exchangeRate;
      newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSD, rate: exchangeRate, netCOP };
    }
    
    setAppState({ contributions: [newContribution, ...appState.contributions] });
    setAmount('');
  };

  const handleDeleteIncome = (id: string) => {
    playSound('deleteItem');
    const updatedContributions = appState.contributions.filter(c => c.id !== id);
    setAppState({ contributions: updatedContributions });
  };
  
  const financialSummary = useMemo(() => {
    const totalNetCOP = appState.contributions.reduce((sum, c) => sum + c.netCOP, 0);
    const totalNetUSD = appState.contributions.reduce((sum, c) => sum + c.netUSD, 0);
    const incomeThisMonth = appState.contributions
      .filter(c => c.date.startsWith(currentMonthKey))
      .reduce((sum, c) => sum + c.netCOP, 0);
    const progress = currentMonthTarget > 0 ? (incomeThisMonth / currentMonthTarget) * 100 : 0;
    
    return { totalNetCOP, totalNetUSD, incomeThisMonth, progress };
  }, [appState.contributions, currentMonthTarget, currentMonthKey]);

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
        
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="glassmorphism-card">
                <CardHeader><CardTitle>Historial de Ingresos</CardTitle></CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <ul className="space-y-3 pr-4">
                            {appState.contributions.map(c => (
                                <li key={c.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                                    <div>
                                        <div className="font-medium text-ios-green">{formatCOP(c.netCOP)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(c.date), 'dd MMM yyyy', { locale: es })} - {formatUSD(c.netUSD)}
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
                                    .reduce((sum, c) => sum + c.netCOP, 0);
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
      <div className="space-y-6">
        <Card className="glassmorphism-card text-center p-6">
            <p className="text-sm text-muted-foreground">INGRESO PESOS</p>
            <p className="text-4xl font-bold text-ios-green">{formatCOP(financialSummary.totalNetCOP)}</p>
        </Card>
        <Card className="glassmorphism-card text-center p-6">
            <p className="text-sm text-muted-foreground">INGRESO USD</p>
            <p className="text-3xl font-semibold text-ios-blue">{formatUSD(financialSummary.totalNetUSD)}</p>
        </Card>
        <Card className="glassmorphism-card text-center p-6">
            <p className="text-sm text-muted-foreground">Ingresos Este Mes</p>
            <p className="text-3xl font-semibold">{formatCOP(financialSummary.incomeThisMonth)}</p>
        </Card>
        {financialSummary.progress >= 100 && (
            <Card className="glassmorphism-card bg-ios-green/20 border-ios-green p-4 text-center">
                <p className="font-bold text-ios-green animate-pulse">🎉✨ ¡FELICITACIONES! ¡META ALCANZADA! ✨🎉</p>
            </Card>
        )}
      </div>
    </div>
  );
};

export default IncomeTab;
