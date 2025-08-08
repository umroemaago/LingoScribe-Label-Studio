import React from "react";
import { Dialog, DialogContent } from "@humansignal/ui";
import { SidePanels } from "../SidePanels/SidePanels";
import { SideTabsPanels } from "../SidePanels/TabPanels/SideTabsPanels";

export const SidePanelsModal = ({ open, onClose, store }) => {
  const as = store.annotationStore;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none h-[85vh] overflow-hidden rounded-xl shadow-xl p-4">
        <div className="flex w-full h-full gap-4">
          <SidePanels
            panelsHidden={false}
            currentEntity={as.selectedHistory ?? as.selected}
            regions={as.selected.regionStore}
          />
          <SideTabsPanels
            panelsHidden={false}
            currentEntity={as.selectedHistory ?? as.selected}
            regions={as.selected.regionStore}
            showComments={store.hasInterface("annotations:comments")}
            focusTab={store.commentStore.tooltipMessage ? "comments" : null}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
