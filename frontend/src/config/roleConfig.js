import { LayoutDashboard, BookOpen, FileText, Bot, MessageSquare, Settings, Users } from 'lucide-react';

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
    upgrade: true,
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
    upgrade: true,
  },
  admin: {
    label: "Admin",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/admin/courses" },
      { name: "Resources", icon: FileText, path: "/admin/resources" },
      { name: "AI Tutor", icon: Bot, path: "/admin/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/admin/messages" },
      { name: "Settings", icon: Settings, path: "/admin/settings" },
      { name: "Users", icon: Users, path: "/admin/users" },
    ],
    upgrade: true,
  },
};