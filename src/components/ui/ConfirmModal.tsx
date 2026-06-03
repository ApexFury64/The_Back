import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card w-full max-w-md p-6 rounded-2xl relative shadow-2xl border border-white/10"
        >
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl flex-shrink-0 ${isDestructive ? 'bg-coral/20 text-coral' : 'bg-teal/20 text-teal'}`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-center shadow-lg transition-all
                ${isDestructive 
                  ? 'bg-coral hover:bg-coral/90 text-white shadow-coral/20' 
                  : 'bg-teal hover:bg-teal/90 text-navy-900 shadow-teal/20'}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
