import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconChevronDown, IconGearNewUI } from "@humansignal/icons";
import { Block, Elem } from "../../utils/bem";
import { Button } from "@humansignal/ui";
import { FieldsButton } from "../Common/FieldsButton";
import { Icon } from "../Common/Icon/Icon";
import { Resizer } from "../Common/Resizer/Resizer";
import { Space } from "../Common/Space/Space";
import { DataView } from "../MainView";
import "./Label.scss";

const LabelingHeader = ({ SDK, onClick, isExplorerMode }) => {
  return (
    <Elem name="header" mod={{ labelStream: !isExplorerMode }}>
      <Space size="large">
        {isExplorerMode ? (
          <FieldsButton
            wrapper={FieldsButton.Checkbox}
            icon={<Icon icon={IconGearNewUI} />}
            trailingIcon={<Icon icon={IconChevronDown} />}
            title={"Fields"}
            className="desktop-only"
          />
        ) : null}
      </Space>
    </Elem>
  );
};

const injector = inject(({ store }) => ({
  store,
  loading: store?.loadingData,
}));

export const Labeling = injector(
  observer(({ store, loading }) => {
    const lsfRef = useRef();
    const SDK = store?.SDK;
    const view = store?.currentView;
    const { isExplorerMode } = store;

    const isLabelStream = useMemo(() => SDK?.mode === "labelstream", [SDK]);

    const closeLabeling = useCallback(() => {
      store?.closeLabeling?.();
    }, [store]);

    const initLabeling = useCallback(() => {
      if (SDK && !SDK.lsf && lsfRef.current) {
        SDK.initLSF(lsfRef.current);
      }
      SDK?.startLabeling?.();
    }, [SDK]);

    useEffect(() => {
      if (SDK && !isLabelStream) {
        SDK.on("taskSelected", initLabeling);
        return () => SDK.off("taskSelected", initLabeling);
      }
    }, [SDK, isLabelStream, initLabeling]);

    useEffect(() => {
      if (SDK && ((!SDK.lsf && store?.dataStore?.selected) || isLabelStream)) {
        initLabeling();
      }
    }, [SDK, store?.dataStore?.selected, isLabelStream, initLabeling]);

    useEffect(() => {
      return () => SDK?.destroyLSF?.();
    }, [SDK]);

    const onResize = useCallback((width) => {
      view?.setLabelingTableWidth(width);
      window.dispatchEvent(new Event("resize"));
    }, [view]);

    const getInitialWidth = useCallback(() => {
      return view?.labelingTableWidth ?? 180;
    }, [view]);

    return (
      <Block name="label-view" mod={{ loading }}>
        {SDK?.interfaceEnabled("labelingHeader") && (
          <LabelingHeader SDK={SDK} onClick={closeLabeling} isExplorerMode={isExplorerMode} />
        )}

        <Elem name="content">
          {isExplorerMode && (
            <Elem name="table">
              <Elem
                tag={Resizer}
                name="dataview"
                minWidth={50}
                maxWidth={1000}
                type={"quickview"}
                initialWidth={getInitialWidth()}
                onResizeFinished={onResize}
                style={{ display: "flex", flex: 1 }}
              >
                <DataView />
              </Elem>
            </Elem>
          )}

          <Elem name="lsf-wrapper" mod={{ mode: isExplorerMode ? "explorer" : "labeling" }}>
            {loading && <Elem name="waiting" mod={{ animated: true }} />}
            <Elem ref={lsfRef} id="label-studio-dm" name="lsf-container" key="label-studio" />
          </Elem>
        </Elem>
      </Block>
    );
  }),
);

