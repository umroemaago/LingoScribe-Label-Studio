// SidePanelModal.tsx
import { FC, useEffect, useState } from "react";
import { OutlinerPanel } from "./OutlinerPanel/OutlinerPanel";
import { DetailsPanel } from "./DetailsPanel/DetailsPanel";
import "./SidePanelModal.scss";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  store: any;
  currentEntity: any;
}

export const SidePanelModal: FC<ModalProps> = ({ open, onClose, store, currentEntity }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="sidepanel-modal">
      <div className="sidepanel-modal__overlay" onClick={onClose} />
      <div className="sidepanel-modal__container">
        <button className="sidepanel-modal__close" onClick={onClose}>×</button>
        <div className="sidepanel-modal__content">
          <OutlinerPanel store={store} currentEntity={currentEntity} />
          <DetailsPanel store={store} currentEntity={currentEntity} />
        </div>
      </div>
    </div>
  );
};
