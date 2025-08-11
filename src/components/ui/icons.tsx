/**
 * Centralized icon exports following Shadcn/ui conventions
 * All icons from Lucide React with consistent sizing
 */

// Navigation & Layout
export { 
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react'

// Actions & CRUD
export {
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  RotateCw
} from 'lucide-react'

// Status & Feedback
export {
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X as XCircle,
  Loader2,
  Clock,
  Calendar,
  CalendarDays
} from 'lucide-react'

// Communication & Social
export {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Send,
  Phone,
  Video
} from 'lucide-react'

// User & Account
export {
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  LogIn,
  LogOut,
  Settings,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react'

// Business & Jobs
export {
  Briefcase,
  Building,
  Building2,
  MapPin,
  Navigation,
  Crosshair,
  ExternalLink,
  Link,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'

// Analytics & Charts
export {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap
} from 'lucide-react'

// Files & Documents
export {
  File,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Paperclip,
  Archive
} from 'lucide-react'

// Network & Connectivity
export {
  Wifi,
  WifiOff,
  Globe,
  Server,
  Database,
  Cloud,
  CloudOff
} from 'lucide-react'

// Media & Content
export {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Camera,
  Mic,
  MicOff
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Default icon size for Shadcn/ui consistency
 */
export const defaultIconSize = "h-4 w-4"

/**
 * Icon size variants following Shadcn conventions
 */
export const iconSizes = {
  xs: 'h-3 w-3',      // 12px
  sm: 'h-3.5 w-3.5',  // 14px  
  default: 'h-4 w-4', // 16px (Shadcn default)
  lg: 'h-5 w-5',      // 20px
  xl: 'h-6 w-6',      // 24px
} as const

/**
 * Utility function to get icon size class
 */
export function getIconSize(size: keyof typeof iconSizes = 'default') {
  return iconSizes[size]
}

/**
 * Utility to combine icon size with additional classes
 */
export function iconClass(size: keyof typeof iconSizes = 'default', additionalClasses?: string) {
  return cn(iconSizes[size], additionalClasses)
}
