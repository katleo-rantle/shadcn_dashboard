import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, addDays } from 'date-fns'; // Keep date-fns imports
import { Employee, Task, DailyTimeEntry, EmployeeTimeCard } from './types'; // Keep types import

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Date Utility (No Change) ---
export const generateBiWeeklyDates = (startDateStr: string): string[] => {
  const startDate = parseISO(startDateStr);
  const dates: string[] = [];
  for (let i = 0; i < 14; i++) {
    const date = addDays(startDate, i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }
  return dates;
};

// --- Calculation Utility (UPDATED) ---
export const calculateTimeCardData = (
    employeeTimeCards: EmployeeTimeCard[],
    employeesList: Employee[],
    tasksList: Task[],
    // 👇 NEW PARAMETER: Array of dates in the current bi-weekly period
    currentDates: string[], 
) => {
    const employeeMap = new Map(employeesList.map(e => [e.EmployeeID, e]));
    const taskMap = new Map(tasksList.map(t => [t.TaskID, { 
        ...t, 
        actualEmployeeCost: 0, 
        totalDaysWorked: 0, 
        totalEmployeePay: 0,
    }]));
  
    const payrollSummary: {
      [employeeId: number]: {
        totalEarned: number;
        totalBorrowed: number;
        netPay: number;
        totalDaysWorked: number;
      };
    } = {};

    // 👇 NEW: Create a Set for efficient O(1) date lookups
    const dateSet = new Set(currentDates);
  
    employeeTimeCards.forEach((tc: EmployeeTimeCard) => {
      const employee = employeeMap.get(tc.employeeId);
      if (!employee) return; 
  
      let totalEarned = 0;
      let totalBorrowed = 0;
      let totalDaysWorked = 0;
      const rate = employee.DailyRate ?? 0; 
  
      tc.entries.forEach((entry: DailyTimeEntry) => {
        
        // 🚨 CRITICAL FIX: Only process entries that fall within the current date range
        if (!dateSet.has(entry.date)) {
            return; 
        }

        // We calculate borrowed regardless of 'worked', but still filtered by date
        totalBorrowed += entry.borrowed; 
  
        if (entry.worked) {
          totalEarned += rate;
          totalDaysWorked++;
  
          if (entry.taskId !== null) {
            const taskData = taskMap.get(entry.taskId);
            if (taskData) {
              taskData.actualEmployeeCost += rate;
              taskData.totalDaysWorked++;
              taskData.totalEmployeePay += rate;
              taskMap.set(entry.taskId, taskData);
            }
          }
        }
      });
  
      payrollSummary[tc.employeeId] = {
        totalEarned,
        totalBorrowed,
        netPay: totalEarned - totalBorrowed,
        totalDaysWorked,
      };
    });
  
    const budgetAlerts: { taskId: number; message: string; taskName: string }[] = [];
    const invoiceSummary: {
      taskId: number;
      taskName: string;
      taskBudget: number;
      employeeCost: number; 
      totalDays: number;
      budgetVariance: number;
    }[] = [];
  
    taskMap.forEach((task) => {
      const taskBudget = task.TaskBudget ?? 0;
      const currentTaskLaborCost = task.actualEmployeeCost; 
      
      if (currentTaskLaborCost > taskBudget && taskBudget > 0) {
        budgetAlerts.push({
          taskId: task.TaskID,
          taskName: task.TaskName,
          message: `Labor cost is R${(currentTaskLaborCost - taskBudget).toFixed(2)} over the allocated budget R${taskBudget.toFixed(2)}!`,
        });
      }
  
      if (currentTaskLaborCost > 0) {
          invoiceSummary.push({
              taskId: task.TaskID,
              taskName: task.TaskName,
              taskBudget: taskBudget, 
              employeeCost: currentTaskLaborCost,
              totalDays: task.totalDaysWorked,
              budgetVariance: taskBudget - currentTaskLaborCost,
          });
      }
    });
  
    return { payrollSummary, taskMap, budgetAlerts, invoiceSummary };
};