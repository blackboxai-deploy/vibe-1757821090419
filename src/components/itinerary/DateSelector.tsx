"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type FormData, type TripDates } from '@/types';

interface DateSelectorProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export function DateSelector({ formData, updateFormData, onNext }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<Date | null>(null);
  const [selectedDeparture, setSelectedDeparture] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calculateDays = (arrival: Date, departure: Date): number => {
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleConfirmDates = () => {
    if (selectedArrival && selectedDeparture) {
      const days = calculateDays(selectedArrival, selectedDeparture);
      const tripDates: TripDates = {
        arrival: selectedArrival,
        departure: selectedDeparture,
        days
      };
      
      updateFormData({ dates: tripDates });
      setIsOpen(false);
      onNext();
    }
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return; // Não permite datas passadas

    if (!selectedArrival || (selectedArrival && selectedDeparture)) {
      // Primeira seleção ou resetar seleção
      setSelectedArrival(date);
      setSelectedDeparture(null);
    } else if (date > selectedArrival) {
      // Segunda seleção - deve ser depois da chegada
      setSelectedDeparture(date);
    } else {
      // Se clicou numa data anterior à chegada, redefine a chegada
      setSelectedArrival(date);
      setSelectedDeparture(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Pegar o domingo anterior ao primeiro dia do mês
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Pegar o sábado após o último dia do mês
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const isDateSelected = (date: Date) => {
    if (!selectedArrival) return false;
    
    const dateTime = date.getTime();
    const arrivalTime = selectedArrival.getTime();
    
    if (selectedDeparture) {
      const departureTime = selectedDeparture.getTime();
      return dateTime >= arrivalTime && dateTime <= departureTime;
    }
    
    return dateTime === arrivalTime;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateClass = (date: Date) => {
    const baseClass = "w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all hover:bg-blue-100";
    
    if (isDateDisabled(date)) {
      return `${baseClass} text-gray-300 cursor-not-allowed hover:bg-transparent`;
    }
    
    if (!isDateInCurrentMonth(date)) {
      return `${baseClass} text-gray-400`;
    }
    
    if (isDateSelected(date)) {
      if (selectedArrival && selectedDeparture && date.getTime() === selectedArrival.getTime()) {
        return `${baseClass} bg-green-600 text-white font-bold`;
      }
      if (selectedArrival && selectedDeparture && date.getTime() === selectedDeparture.getTime()) {
        return `${baseClass} bg-red-600 text-white font-bold`;
      }
      return `${baseClass} bg-blue-500 text-white`;
    }
    
    return `${baseClass} hover:bg-blue-50`;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const openCalendar = () => {
    setSelectedArrival(formData.dates?.arrival || null);
    setSelectedDeparture(formData.dates?.departure || null);
    setCurrentMonth(formData.dates?.arrival || new Date());
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      {formData.dates ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">
                  📅 Datas Selecionadas
                </p>
                <p className="text-green-700">
                  Chegada: {formatDate(formData.dates.arrival)} | 
                  Partida: {formatDate(formData.dates.departure)}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {formData.dates.days} dias de viagem
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={openCalendar}>
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          size="lg" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={openCalendar}
        >
          📅 Selecionar Datas
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Datas da Viagem</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                ←
              </Button>
              <h3 className="font-semibold text-lg capitalize">
                {formatMonthYear(currentMonth)}
              </h3>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                →
              </Button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map(date => (
                <div
                  key={date.toISOString()}
                  className={getDateClass(date)}
                  onClick={() => !isDateDisabled(date) && handleDateClick(date)}
                >
                  {date.getDate()}
                </div>
              ))}
            </div>

            {/* Selection Info */}
            {selectedArrival && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Chegada: {formatDate(selectedArrival)}</span>
                  </div>
                  {selectedDeparture && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-600 rounded"></div>
                      <span>Partida: {formatDate(selectedDeparture)}</span>
                    </div>
                  )}
                  {selectedDeparture && (
                    <div className="font-medium text-blue-800 mt-2">
                      Total: {calculateDays(selectedArrival, selectedDeparture)} dias
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedArrival && (
              <p className="text-sm text-gray-600 text-center">
                Clique na data de chegada
              </p>
            )}

            {selectedArrival && !selectedDeparture && (
              <p className="text-sm text-gray-600 text-center">
                Agora clique na data de partida
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmDates}
                disabled={!selectedArrival || !selectedDeparture}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar Datas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}