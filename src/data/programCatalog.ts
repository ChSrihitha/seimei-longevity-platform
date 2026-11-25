import { Activity, Dumbbell, Flame, Flower2, GraduationCap, HeartPulse, Leaf, Moon, Users } from 'lucide-react';

/**
 * SEIMEI programmes that are implemented in the employee experience (/programs).
 * Shared by the employee Programmes page and the admin HR analytics so both use one catalogue.
 */
export const SEIMEI_PROGRAMS = [
  { id: 'reset', title: '15-Minute Reset', category: 'Stress & Recovery', duration: '15 min', description: 'A short guided session to reset your nervous system and return to your day with more space.', icon: Leaf, tone: 'bg-[#eef6e9] text-[var(--color-brand-600)]', benefits: ['Lower immediate tension', 'Restore focus', 'Build a daily reset habit'] },
  { id: 'unwind', title: 'Weekly Unwind Program', category: 'Mindfulness', duration: '30 min weekly', description: 'A gentle group recovery ritual with breathing, reflection, and practical tools for the week ahead.', icon: Users, tone: 'bg-[#eaf2fb] text-[#3d73bd]', benefits: ['Guided group practice', 'Reflect and share', 'Recover consistently'] },
  { id: 'sleep', title: 'Sleep Recovery Program', category: 'Sleep', duration: '4 weeks', description: 'Build a calmer evening routine and improve the quality of your recovery overnight.', icon: Moon, tone: 'bg-[#f0ebfb] text-[#7653ad]', benefits: ['Create an evening ritual', 'Improve sleep consistency', 'Wake with more energy'] },
  { id: 'burnout', title: 'Burnout Prevention Workshop', category: 'Stress & Recovery', duration: '60 min', description: 'Learn to spot early signals, protect your capacity, and create sustainable working rhythms.', icon: Flame, tone: 'bg-[#fff0e7] text-[#d87935]', benefits: ['Recognize early signals', 'Set useful boundaries', 'Plan sustainable recovery'] },
  { id: 'coaching', title: 'Wellness Coaching', category: 'Coaching', duration: '45 min', description: 'A one-to-one conversation with a coach tailored to your wellbeing goals and current season.', icon: Activity, tone: 'bg-[#fff4df] text-[#c28a25]', benefits: ['Clarify your goals', 'Make a practical plan', 'Stay accountable'] },
  { id: 'menopause-clinic-days', title: 'Menopause Clinic Days', category: 'Women’s Health', duration: 'Clinic days', description: 'Consultations focused on menopause and perimenopause, with care options discussed with a qualified clinician.', icon: Flower2, tone: 'bg-[#f8eaf0] text-[#ad5070]', benefits: ['Discuss menopause or perimenopause concerns', 'Review available care and support options', 'Prepare questions for a clinician'] },
  { id: 'longevity-assessments', title: 'Longevity Assessments', category: 'Preventive Health', duration: 'Assessment', description: 'A structured review of health indicators, fitness and lifestyle factors to inform a conversation about long-term wellbeing.', icon: HeartPulse, tone: 'bg-[#eaf2fb] text-[#3d73bd]', benefits: ['Review current health indicators', 'Discuss fitness and lifestyle factors', 'Identify topics for professional follow-up'] },
  { id: 'physio-drop-in', title: 'Physio Drop-in', category: 'Physical Health', duration: 'Drop-in', description: 'Access physiotherapy support for posture, movement and desk-related aches or strain.', icon: Dumbbell, tone: 'bg-[#eef6e9] text-[var(--color-brand-600)]', benefits: ['Discuss movement or posture concerns', 'Review practical ergonomic considerations', 'Ask a physiotherapist about next steps'] },
  { id: 'manager-training', title: 'Manager Training', category: 'Leadership', duration: 'Training', description: 'Practical learning for managers on recognising signs of strain and supporting constructive workplace conversations.', icon: GraduationCap, tone: 'bg-[#fff4df] text-[#c28a25]', benefits: ['Recognise signs that someone may need support', 'Practice supportive conversations', 'Learn when to signpost available resources'] },
] as const;

export type SeimeiProgram = typeof SEIMEI_PROGRAMS[number];
export type SeimeiProgramId = SeimeiProgram['id'];
