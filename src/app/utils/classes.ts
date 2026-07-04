import { Class } from '../types';

const CLASSES_KEY = 'academy_classes';

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
  '#06B6D4', // cyan
  '#A855F7', // purple
];

export const getClasses = (): Class[] => {
  const data = localStorage.getItem(CLASSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveClasses = (classes: Class[]): void => {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
};

export const getOrCreateClass = (className: string): Class => {
  const classes = getClasses();
  let classItem = classes.find(c => c.name === className);
  
  if (!classItem) {
    classItem = {
      id: Date.now().toString(),
      name: className,
      color: DEFAULT_COLORS[classes.length % DEFAULT_COLORS.length],
    };
    classes.push(classItem);
    saveClasses(classes);
  }
  
  return classItem;
};

export const getClassColor = (className: string | undefined): string => {
  if (!className) return '#6B7280'; // gray
  
  const classes = getClasses();
  const classItem = classes.find(c => c.name === className);
  return classItem?.color || '#6B7280';
};

export const deleteClass = (className: string): void => {
  const classes = getClasses().filter(c => c.name !== className);
  saveClasses(classes);
};

export const renameClass = (oldName: string, newName: string): void => {
  const classes = getClasses();
  const classItem = classes.find(c => c.name === oldName);
  
  if (classItem) {
    classItem.name = newName;
    saveClasses(classes);
  }
};