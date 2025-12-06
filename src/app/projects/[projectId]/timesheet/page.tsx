// TimeSheet.tsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO, isSaturday, isSunday, addDays } from 'date-fns';
import { useParams } from 'next/navigation'; // 👈 Import useParams

// --- DATA IMPORTS ---
import {
    employees,
    tasks,
    employeeTimeCards as initialMockTimeCards,
    jobs
} from '@/lib/data';
// --- TYPE IMPORTS ---
import {
    Employee,
    Task,
    EmployeeTimeCard,
    DailyTimeEntry,
    TimeCardData,
    TimeCardCellProps
} from '@/lib/types';
// --- UTILITY IMPORTS ---
import {
    generateBiWeeklyDates,
    calculateTimeCardData
} from '@/lib/utils';


// --- TIME sheet CELL COMPONENT (Omitted for brevity) ---
const TimeCardCell: React.FC<TimeCardCellProps> = ({ entry, employee, projectTasks, date, onUpdate }) => {
    const isWeekend = isSaturday(parseISO(date)) || isSunday(parseISO(date));
    const assignedTasks = projectTasks.filter((t: Task) => t.JobID);

    return (
        <div className={`p-1 border-t border-l ${isWeekend ? 'bg-gray-100' : 'bg-white'}`}>
            <div className="flex items-center space-x-2 mb-1">
                <input
                    type="checkbox"
                    checked={entry?.worked || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(date, 'worked', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="text-xs text-gray-700 font-medium">Worked</label>
            </div>

            {entry?.worked && (
                <div className="space-y-1">
                    <select
                        value={entry.taskId || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate(date, 'taskId', parseInt(e.target.value) || null)}
                        className="w-full text-xs p-1 border rounded"
                        disabled={!entry.worked}
                    >
                        <option value="">-- Select Task --</option>
                        {assignedTasks.map((task: Task) => (
                            <option key={task.TaskID} value={task.TaskID}>
                                {task.TaskName}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Borrowed (R)"
                        value={entry.borrowed || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(date, 'borrowed', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-1 border rounded mt-1"
                        min="0"
                    />
                    <p className="text-xs text-green-700 font-medium mt-1">Earned: R{employee.DailyRate?.toFixed(2) ?? '0.00'}</p>
                </div>
            )}
        </div>
    );
};


// --- MAIN TIMECARD PAGE COMPONENT ---
const TimeSheet = () => {
    const defaultStartDate = '2024-04-01';
    const [startDate, setStartDate] = useState<string>(defaultStartDate);

    const params = useParams();
    const projectID = params.projectId as string;
    // console.log('Loaded TimeSheet for Project ID:', projectID);

    type ComponentData = Omit<TimeCardData, 'startDate' | 'projectId'>;
    const [data, setData] = useState<ComponentData>({
        tasks: [],
        employees: [],
        employeeTimeCards: [],
    });

    const projectIdNumber = parseInt(projectID);

    // 1. URL ID -> Job
    const projectJobs = useMemo(() => {
        return jobs.filter((job) => job.ProjectID === projectIdNumber);
    }, [projectIdNumber]);

    // 2. Job -> Task
    const currentProjectTasks = useMemo(() => {
        const projectJobIDs = new Set(projectJobs.map(job => job.JobID));
        return tasks.filter((task) => projectJobIDs.has(task.JobID));
    }, [projectJobs]);

    // 3. EMPLOYEE FILTERING
    const employeesToDisplay: Employee[] = useMemo(() => {
        return employees.filter(employee => employee.projects.includes(projectIdNumber));
    }, [projectIdNumber]);


    // --- EFFECT 1: Load/Filter Data when Project Changes ---
    useEffect(() => {
        const projectTaskIDs = new Set(currentProjectTasks.map(t => t.TaskID));

        const projectTimeCards: EmployeeTimeCard[] = employeesToDisplay.map((emp: Employee) => {
            const existingTc = initialMockTimeCards.find(tc => tc.employeeId === emp.EmployeeID);

            if (existingTc) {
                return {
                    ...existingTc,
                    // Keep project-relevant entries
                    entries: existingTc.entries.filter((entry: DailyTimeEntry) =>
                        entry.taskId !== null && projectTaskIDs.has(entry.taskId)
                    ),
                };
            }
            return { employeeId: emp.EmployeeID, entries: [] };
        });

        setData({
            tasks: tasks,
            employees: employeesToDisplay,
            employeeTimeCards: projectTimeCards,
        });

    }, [projectID, currentProjectTasks.length, employeesToDisplay.length]);


    // --- Calculation Dependencies (FIXED) ---

    // dates changes when startDate changes
    const dates = useMemo(() => generateBiWeeklyDates(startDate), [startDate]);
    
    // 👇 FIX: Pass 'dates' to the calculation function and add it as a dependency
    const { payrollSummary, taskMap, budgetAlerts, invoiceSummary } = useMemo(
        // Ensure calculateTimeCardData accepts 'dates' in its signature!
        () => calculateTimeCardData(data.employeeTimeCards, data.employees, data.tasks, dates), 
        [data.employeeTimeCards, data.employees, data.tasks, dates] // 👈 ADDED 'dates'
    );

    // --- Event Handler (No change) ---
    const handleUpdateEntry = (employeeId: number, date: string, field: 'worked' | 'taskId' | 'borrowed' | 'dailyRate', value: boolean | number | null) => {
        setData(prevData => {
            const newEmployeeTimeCards: EmployeeTimeCard[] = [...prevData.employeeTimeCards];
            let tcIndex = newEmployeeTimeCards.findIndex(tc => tc.employeeId === employeeId);

            if (tcIndex === -1) {
                newEmployeeTimeCards.push({ employeeId, entries: [] });
                tcIndex = newEmployeeTimeCards.length - 1;
            }

            const tcToUpdate = newEmployeeTimeCards[tcIndex];
            const newEntries = [...tcToUpdate.entries];
            let entryIndex = newEntries.findIndex(e => e.date === date);

            if (entryIndex === -1) {
                newEntries.push({ date, worked: false, taskId: null, borrowed: 0 });
                entryIndex = newEntries.length - 1;
            }

            const entryToUpdate = newEntries[entryIndex];

            if (field === 'worked' && value === false) {
                entryToUpdate.worked = false;
                entryToUpdate.taskId = null;
                entryToUpdate.borrowed = 0;
            } else {
                (entryToUpdate as any)[field] = value;
                if (field === 'worked' && value === true) {
                    entryToUpdate.worked = true;
                }
            }

            tcToUpdate.entries = newEntries;
            return { ...prevData, employeeTimeCards: newEmployeeTimeCards };
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (newDate) {
            setStartDate(newDate);
        }
    };

    const getEmployeeEntry = (employeeId: number, date: string): DailyTimeEntry => {
        const timeCard = data.employeeTimeCards.find((tc: EmployeeTimeCard) => tc.employeeId === employeeId);
        // NOTE: The entry is found in the project-filtered entries list.
        const entry = timeCard?.entries.find((e: DailyTimeEntry) => e.date === date); 
        return entry || { date, worked: false, taskId: null, borrowed: 0 };
    };

    // --- RENDERING ---
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🗓️ Time Sheet Tracking</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
                <div className="flex justify-between items-start">
                    {/* --- PROJECT AND PERIOD CONTEXT --- */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800">
                            Project: <span className="text-blue-600">{projectID}</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Current Period:
                            <span className="font-semibold text-gray-700 ml-1">
                                {format(parseISO(startDate), 'MMM dd')} - {format(addDays(parseISO(startDate), 13), 'MMM dd, yyyy')}
                            </span>
                        </p>
                    </div>

                    {/* --- DATE PICKER INPUT (IMPROVED) --- */}
                    <label 
                        htmlFor="startDate"
                        className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-100 transition duration-150 group" 
                    >
                        <span className="text-xs font-semibold text-blue-700 mb-1">
                            📅 Change Start Date
                        </span>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={handleDateChange}
                            className="
                                p-2 
                                text-base 
                                font-medium 
                                text-gray-800
                                border-2 
                                border-blue-500 
                                rounded-lg 
                                shadow-lg 
                                focus:ring-blue-600 
                                focus:border-blue-600 
                                transition duration-150
                                cursor-pointer
                            "
                        />
                    </label>
                </div>
            </div>

            <hr className="mb-6" />

            {/* --- 1. Bi-Weekly Time sheet Grid --- */}
            <h2 className="text-xl font-semibold mb-4 text-blue-700">⌚ Employee Time Entry</h2>
            <div className="overflow-x-auto shadow-xl rounded-lg bg-white">
                <div className="min-w-full grid border border-gray-200">

                    {/* Header Row (Employee Name + Dates) */}
                    <div className="grid grid-cols-[150px_repeat(14,_minmax(0,_1fr))] font-bold text-center bg-blue-700 text-white">
                        <div className="p-2 border-r">Employee</div>
                        {dates.map((dateStr) => {
                            const date = parseISO(dateStr);
                            return (
                                <div key={dateStr} className="p-2 border-r">
                                    <div>{format(date, 'E')}</div>
                                    <div className="text-sm">{format(date, 'MM/dd')}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Employee Rows */}
                    {employeesToDisplay.length > 0 ? (
                        employeesToDisplay.map((employee) => (
                            <div key={employee.EmployeeID} className="grid grid-cols-[150px_repeat(14,_minmax(0,_1fr))]">
                                <div className="p-2 border-r border-t bg-gray-50 font-medium flex items-center">{employee.Name}</div>
                                {dates.map((dateStr) => (
                                    <TimeCardCell
                                        key={`${employee.EmployeeID}-${dateStr}`}
                                        entry={getEmployeeEntry(employee.EmployeeID, dateStr)}
                                        employee={employee}
                                        projectTasks={currentProjectTasks}
                                        date={dateStr}
                                        onUpdate={(date, field, value) => handleUpdateEntry(employee.EmployeeID, date, field, value)}
                                    />
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 italic">No employees are currently assigned to Project **{projectID}**.</div>
                    )}
                </div>
            </div>

            <hr className="my-8" />

            {/* --- 2. Payroll Summary and Budget Alerting --- */}
            <h2 className="text-xl font-semibold mb-4 text-blue-700">💰 Payroll & Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payroll Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-xl rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Employee Payroll Summary</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Earned (R)</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Borrowed (R)</th>
                                    <th className="px-3 py-2 text-right text-sm font-bold text-gray-700">NET PAY (R)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employeesToDisplay.map((employee) => {
                                    const summary = payrollSummary[employee.EmployeeID] || { totalEarned: 0, totalBorrowed: 0, netPay: 0, totalDaysWorked: 0 };
                                    // Only show employees in the payroll summary if they have earned something in this view
                                    if (summary.totalDaysWorked > 0) {
                                        return (
                                            <tr key={employee.EmployeeID}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{employee.Name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{summary.totalDaysWorked}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">R{summary.totalEarned.toFixed(2)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-red-500">-R{summary.totalBorrowed.toFixed(2)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-md font-bold text-right text-green-600">R{summary.netPay.toFixed(2)}</td>
                                            </tr>
                                        );
                                    }
                                    return null;
                                })}
                                {(employeesToDisplay.length > 0 && employeesToDisplay.every(e => (payrollSummary[e.EmployeeID]?.totalDaysWorked || 0) === 0)) && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500 italic">No time recorded for any employee in this project and period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Budget Alerting */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-700">⚠️ Budget Alerts</h3>
                    <div className="bg-white shadow-xl rounded-lg p-4 space-y-3">
                        {budgetAlerts.length === 0 ? (
                            <p className="text-green-600 font-medium">All recorded tasks are currently within budget for labor costs.</p>
                        ) : (
                            budgetAlerts.map((alert, index) => (
                                <div key={index} className="p-3 bg-red-100 border-l-4 border-red-500">
                                    <p className="text-sm font-medium text-red-800">**BUDGET EXCEEDED: {alert.taskName}**</p>
                                    <p className="text-xs text-red-700">{alert.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <hr className="my-8" />

            {/* --- 4. Invoice Summary & Task Detail --- */}
            <h2 className="text-xl font-semibold mb-4 text-blue-700">🧾 Task-Based Invoice Summary</h2>
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Task</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Task Budget (R)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Labor Cost (This Period R)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days Worked</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance (Budget - Cost R)</th>
                            <th className="px-4 py-3 text-sm font-bold text-gray-700">INVOICE AMOUNT (R)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoiceSummary.map((summary) => {
                            if (currentProjectTasks.find((t: Task) => t.TaskID === summary.taskId)) {
                                const variance = summary.budgetVariance;
                                return (
                                    <tr key={summary.taskId}>
                                        <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900">{summary.taskName}</td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-500">R{summary.taskBudget.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                                            R{summary.employeeCost.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-500">{summary.totalDays}</td>
                                        <td className={`px-4 py-3 text-right text-sm font-bold ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {variance < 0 ? `-R${Math.abs(variance).toFixed(2)}` : `R${variance.toFixed(2)}`}
                                        </td>
                                        <td className="px-4 py-3 text-right text-lg font-extrabold text-blue-700">
                                            R{summary.employeeCost.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            }
                            return null;
                        })}
                    </tbody>
                </table>

                <div className="p-4 bg-gray-50 text-right">
                    <span className="text-lg font-semibold mr-4">Total Labor Cost for Invoice: R{invoiceSummary.filter(s => currentProjectTasks.some((t: Task) => t.TaskID === s.taskId)).reduce((sum, s) => sum + s.employeeCost, 0).toFixed(2)}</span>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow ml-4">
                        Generate Invoice Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeSheet;