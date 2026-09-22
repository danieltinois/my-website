import { ReactNode } from "react";

export interface WindowProps {
  children: ReactNode;
  title: string;
  onClose?: () => void;
  onMinimize?: () => void;
  disabled?: boolean;
  onFocus?: () => void;
  defaultPosition?: { x: number; y: number };
  style?: React.CSSProperties;
}
