/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, User, AlertCircle, ArrowRight } from 'lucide-react';

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  column: 'backlog' | 'in_progress' | 'review' | 'done';
  createdAt: string;
}

type ColumnType = 'backlog' | 'in_progress' | 'review' | 'done';

interface ColumnConfig {
  id: ColumnType;
  title: string;
  color: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'backlog', title: '待處理 (Backlog)', color: 'border-t-neutral-400 bg-neutral-50/50' },
  { id: 'in_progress', title: '進行中 (In Progress)', color: 'border-t-blue-500 bg-blue-50/10' },
  { id: 'review', title: '審核中 (Review)', color: 'border-t-amber-500 bg-amber-50/10' },
  { id: 'done', title: '已完成 (Done)', color: 'border-t-green-500 bg-green-50/10' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Load tasks on mount
  useEffect(() => {
    const saved = localStorage.getItem('archclock_kanban_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks helper
  const saveTasks = (newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('archclock_kanban_tasks', JSON.stringify(newTasks));
  };

  // Add task handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: KanbanTask = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim() || '未分配',
      priority,
      dueDate: dueDate || formatToday(),
      column: 'backlog',
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, newTask]);
    
    // Reset form & close
    setTitle('');
    setDescription('');
    setAssignee('');
    setPriority('medium');
    setDueDate('');
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = tasks.filter(t => t.id !== id);
    saveTasks(filtered);
  };

  // Helper to format date
  const formatToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: ColumnType) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, column: targetColumn };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Button-based move fallback (accessible & mobile-friendly)
  const moveTask = (id: string, direction: 'forward' | 'backward') => {
    const colOrder: ColumnType[] = ['backlog', 'in_progress', 'review', 'done'];
    const updated = tasks.map(t => {
      if (t.id === id) {
        const currentIndex = colOrder.indexOf(t.column);
        let newIndex = currentIndex;
        if (direction === 'forward' && currentIndex < colOrder.length - 1) {
          newIndex += 1;
        } else if (direction === 'backward' && currentIndex > 0) {
          newIndex -= 1;
        }
        return { ...t, column: colOrder[newIndex] };
      }
      return t;
    });
    saveTasks(updated);
  };

  const getPriorityBadge = (p: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100 rounded-sm">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 rounded-sm">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 rounded-sm">Low</span>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light tracking-tight text-neutral-900 uppercase">看板專案管理</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Kanban Task Board</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors rounded-sm shadow-md shadow-neutral-100"
        >
          <Plus className="h-4 w-4" />
          <span>新增任務</span>
        </button>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.column === col.id);
          
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`border border-neutral-200 border-t-4 p-4 rounded-sm flex flex-col min-h-[500px] ${col.color} transition-all duration-300`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">{col.title}</span>
                <span className="text-xs text-neutral-400 font-bold bg-neutral-200/50 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                <AnimatePresence>
                  {colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white border border-neutral-200 p-4 shadow-sm rounded-sm cursor-grab active:cursor-grabbing hover:border-neutral-400 transition-all group relative"
                    >
                      {/* Delete button (hover) */}
                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="刪除任務"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Header/Priority */}
                      <div className="flex items-center justify-between mb-2">
                        {getPriorityBadge(task.priority)}
                        <span className="text-[10px] text-neutral-400 font-mono">#{task.id}</span>
                      </div>

                      {/* Title & Desc */}
                      <h4 className="text-sm font-semibold text-neutral-900 mb-1 leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-50/50 text-[10px] text-neutral-400">
                        <div className="flex items-center space-x-1.5">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-neutral-50 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.column !== 'backlog' && (
                          <button
                            onClick={() => moveTask(task.id, 'backward')}
                            className="px-1.5 py-0.5 border border-neutral-200 hover:border-neutral-800 text-neutral-600 hover:text-neutral-900 rounded-sm font-medium"
                          >
                            ← 退回
                          </button>
                        )}
                        {task.column !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, 'forward')}
                            className="flex items-center space-x-0.5 px-1.5 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm font-medium"
                          >
                            <span>推進</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-neutral-200 shadow-xl rounded-sm w-full max-w-md p-6"
            >
              <h3 className="text-lg font-medium text-neutral-900 mb-6 uppercase tracking-wider text-center">新增任務</h3>
              
              <form onSubmit={handleAddTask} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">任務名稱 (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="輸入任務標題..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">任務描述 (Description)</label>
                  <textarea
                    placeholder="輸入任務詳細描述..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">指派給 (Assignee)</label>
                    <input
                      type="text"
                      placeholder="執行者姓名"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">優先級 (Priority)</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm text-neutral-800"
                    >
                      <option value="high">High (高)</option>
                      <option value="medium">Medium (中)</option>
                      <option value="low">Low (低)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">到期日 (Due Date)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-neutral-200 hover:border-neutral-950 text-neutral-600 hover:text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
                  >
                    確認新增
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
