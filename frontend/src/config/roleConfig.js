import { LayoutDashboard, BookOpen, Bot, MessageSquare, Users, GraduationCap, UserCog, BarChart3, FileText, Settings } from 'lucide-react';

export const roleConfig = {
  student: {
    label: "Student",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/student/courses" },
      { name: "Resources", icon: FileText, path: "/student/resources" },
      { name: "AI Tutor", icon: Bot, path: "/student/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/student/messages" },
      { name: "Settings", icon: Settings, path: "/student/settings" },
    ],
  },
  mentor: {
    label: "Mentor",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/mentor/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/mentor/courses" },
      { name: "Resources", icon: FileText, path: "/mentor/resources" },
      { name: "AI Tutor", icon: Bot, path: "/mentor/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/mentor/messages" },
      { name: "Settings", icon: Settings, path: "/mentor/settings" },
    ],
  },
  admin: {
    label: "Admin",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/admin/courses" },
      { name: "Mentors", icon: UserCog, path: "/admin/mentors" },
      { name: "Students", icon: GraduationCap, path: "/admin/students" },
      { name: "Users", icon: Users, path: "/admin/users" },
      { name: "Reports", icon: BarChart3, path: "/admin/reports" },
      { name: "AI Tutor", icon: Bot, path: "/admin/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/admin/messages" },
    ],
  },
};