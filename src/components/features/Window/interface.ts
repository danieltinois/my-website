import { ReactNode } from "react";

export interface WindowProps {
  children: ReactNode;
  title: string;
  onClose?: () => void;
}
