# 🎯 Guide des Icônes Shadcn/ui

## 📦 **Structure et Organisation**

Toutes les icônes sont centralisées dans `src/components/ui/icons.tsx` et suivent les conventions Shadcn/ui.

## 🎨 **Utilisation Standard (Outline Style)**

```tsx
import { Bell, Menu, Plus, User } from '@/components/ui/icons'
import { defaultOutlineIcon, outlineIcon, iconClass } from '@/components/ui/icons'

// ✅ Utilisation recommandée avec style outline (16px + stroke-[1.5])
<Bell className={defaultOutlineIcon} />

// ✅ Utilisation avec taille spécifique et outline
<Menu className={outlineIcon('lg')} />

// ✅ Utilisation avec utilitaire et classes additionnelles
<Plus className={outlineIcon('sm', 'text-green-600')} />

// ✅ Sans outline (si nécessaire)
<User className={iconClass('default', 'text-blue-600', false)} />
```

## 📏 **Tailles Disponibles**

| Taille | Classe | Pixels | Usage |
|--------|--------|--------|-------|
| `xs` | `h-3 w-3` | 12px | Badges, indicateurs |
| `sm` | `h-3.5 w-3.5` | 14px | Boutons compacts |
| `default` | `h-4 w-4` | 16px | **Standard Shadcn** |
| `lg` | `h-5 w-5` | 20px | Headers, navigation |
| `xl` | `h-6 w-6` | 24px | Call-to-actions |

## 🗂️ **Catégories d'Icônes**

### Navigation & Layout
- `Menu`, `X`, `ChevronDown`, `ChevronUp`, `MoreHorizontal`

### Actions & CRUD  
- `Plus`, `Edit`, `Trash2`, `Save`, `Copy`, `RefreshCw`

### Status & Feedback
- `CheckCircle`, `AlertCircle`, `Info`, `Loader2`, `Clock`

### Communication
- `Bell`, `Mail`, `MessageSquare`, `Send`, `Phone`

### User & Account
- `User`, `Users`, `UserPlus`, `LogIn`, `LogOut`, `Settings`

### Business & Jobs
- `Briefcase`, `Building`, `MapPin`, `Search`, `Filter`

### Analytics & Charts
- `BarChart3`, `LineChart`, `TrendingUp`, `Activity`

## ✨ **Exemples Pratiques**

### Notifications avec Badge
```tsx
<Button variant="ghost" size="icon" className="relative">
  <Bell className={defaultIconSize} />
  {count > 0 && (
    <Badge variant="destructive" className="absolute -top-1 -right-1">
      {count}
    </Badge>
  )}
</Button>
```

### Loading State
```tsx
<Button disabled={loading}>
  {loading && <Loader2 className={iconClass('sm', 'animate-spin')} />}
  {loading ? 'Creating...' : 'Create Job'}
</Button>
```

### Menu avec Icônes
```tsx
{menuItems.map(item => (
  <Button key={item.id} variant="ghost" className="justify-start gap-2">
    <item.icon className={defaultIconSize} />
    {item.label}
  </Button>
))}
```

## 🎯 **Bonnes Pratiques**

1. **Taille par défaut** : Utilisez `defaultIconSize` pour la cohérence
2. **Import centralisé** : Toujours importer depuis `@/components/ui/icons`
3. **Sémantique** : Choisissez des icônes cohérentes avec l'action
4. **Accessibilité** : Ajoutez `aria-label` si nécessaire
5. **Performance** : Les icônes sont tree-shakées automatiquement

## 🔄 **Migration depuis Lucide Direct**

```tsx
// ❌ Avant
import { Bell } from 'lucide-react'
<Bell size={16} />

// ✅ Après  
import { Bell } from '@/components/ui/icons'
<Bell className={defaultIconSize} />
```

## 🎨 **Personnalisation Avancée**

```tsx
// Icône avec couleur et animation
<Bell className={iconClass('lg', 'text-blue-600 hover:text-blue-800 transition-colors')} />

// Icône dans un contexte spécifique
<div className="flex items-center gap-2">
  <CheckCircle className={iconClass('sm', 'text-green-600')} />
  <span className="text-sm text-green-800">Success!</span>
</div>
```

Ce système d'icônes garantit la cohérence visuelle et facilite la maintenance ! 🎨✨
