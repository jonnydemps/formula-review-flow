
import { useToast as useShadcnToast, toast as shadcnToast } from "@/hooks/use-toast";

// Export toast functions for consistent usage across the app
export const useToast = useShadcnToast;
export const toast = shadcnToast;
