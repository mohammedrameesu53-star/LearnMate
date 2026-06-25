import { LayoutDashboard, BookOpen, FileText, Bot, MessageSquare, Settings, Users } from 'lucide-react';

export const roleConfig = {
  student: {
    label: "Student",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/courses" },
      { name: "Resources", icon: FileText, path: "/resources" },
      { name: "AI Tutor", icon: Bot, path: "/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/messages" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
    upgrade: true,
  },
  mentor: {
    label: "Mentor",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/courses" },
      { name: "Resources", icon: FileText, path: "/resources" },
      { name: "AI Tutor", icon: Bot, path: "/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/messages" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
    upgrade: true,
  },
  admin: {
    label: "Admin",
    navItems: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Courses", icon: BookOpen, path: "/courses" },
      { name: "Resources", icon: FileText, path: "/resources" },
      { name: "AI Tutor", icon: Bot, path: "/ai-tutor" },
      { name: "Messages", icon: MessageSquare, path: "/messages" },
      { name: "Settings", icon: Settings, path: "/settings" },
      { name: "Users", icon: Users, path: "/users" },
    ],
    upgrade: true,
  },
};