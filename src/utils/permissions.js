import {
  Zap,
  ClipboardList,
  Camera,
  Eye,
  Mail,
  Clock3,
  Pencil,
  ShieldCheck,
  ShieldX,
  UserPlus,
} from "lucide-react";

export const EXECUTION_PERMISSIONS = [
  {
    key: "taf",
    label: "TAF",
    icon: Zap,
  },
  {
    key: "controle",
    label: "Controle",
    icon: ClipboardList,
  },
  {
    key: "fotos",
    label: "Fotos",
    icon: Camera,
  },
];

export const MANAGEMENT_PERMISSIONS = [
  {
    key: "ver_tudo",
    label: "Ver todas as fichas",
    icon: Eye,
  },
  {
    key: "ver_enviadas",
    label: "Ver concluídas",
    icon: Mail,
  },
  {
    key: "ver_aprovacao",
    label: "Ver aprovação",
    icon: Clock3,
  },
  {
    key: "editar_ficha",
    label: "Editar ficha",
    icon: Pencil,
  },
  {
    key: "aprovar",
    label: "Aprovar fichas",
    icon: ShieldCheck,
  },
  {
    key: "rejeitar",
    label: "Rejeitar fichas",
    icon: ShieldX,
  },
  {
    key: "alocar_usuario",
    label: "Alocar usuários",
    icon: UserPlus,
  },
];
