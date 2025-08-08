import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconChevronDown, IconChevronLeft, IconGearNewUI, IconClose } from "@humansignal/icons";
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
        {SDK.interfaceEnabled("backButton") && (
          <Button
            icon={<IconChevronLeft style={{ marginRight: 4, fontSize: 16 }} />}
            type="link"
            onClick={onClick}
            style={{ fontSize: 18, padding: 0, color: "black" }}
            className="desktop-only"
          >
            Back
          </Button>
        )}

        {isExplorerMode ? (
          <FieldsButton
            wrapper={FieldsButton.Checkbox}
            icon={<Icon icon={IconGearNewUI} />}
            trailingIcon={<Icon icon={IconChevronDown} />}
            title={"Fields"}
            className="desktop-only"
          />
        ) : null}

        <Button
          icon={<IconClose style={{ fontSize: 20 }} />}
          type="link"
          onClick={onClick}
          className="mobile-only"
          style={{
            fontSize: 20,
            padding: 8,
            color: "black",
            marginLeft: "auto"
          }}
        >
          Close
        </Button>
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
    const [isMobile, setIsMobile] = useState(false);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        if (typeof window !== 'undefined') {
          setIsMobile(window.innerWidth <= 768);
        }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    useEffect(() => {
      if (isMobile && isExplorerMode) {
        setIsMobilePanelOpen(true);
      }
    }, [isMobile, isExplorerMode]);

    const onResize = useCallback((width) => {
      view?.setLabelingTableWidth(width);
      window.dispatchEvent(new Event("resize"));
    }, [view]);

    const getInitialWidth = useCallback(() => {
      return isMobile ? window.innerWidth : view?.labelingTableWidth ?? 200;
    }, [isMobile, view]);

    return (
      <Block name="label-view" mod={{ loading, mobile: isMobile }}>
        {SDK?.interfaceEnabled("labelingHeader") && (
          <LabelingHeader SDK={SDK} onClick={closeLabeling} isExplorerMode={isExplorerMode} />
        )}

        <Elem name="content">
          {isExplorerMode && (
            <Elem name="table" mod={{ mobile: isMobile, open: isMobilePanelOpen }}>
              {isMobile ? (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1001,
                    backgroundColor: 'white',
                    transform: isMobilePanelOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    overflowY: 'auto',
                    paddingTop: '60px',
                  }}
                >
                  <Button
                    icon={<IconClose style={{ fontSize: 20 }} />}
                    type="text"
                    onClick={() => setIsMobilePanelOpen(false)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 1002,
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-neutral-border)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <DataView />
                </div>
              ) : (
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
              )}
            </Elem>
          )}

          <Elem name="lsf-wrapper" mod={{ mode: isExplorerMode ? "explorer" : "labeling", mobile: isMobile }}>
            {loading && <Elem name="waiting" mod={{ animated: true }} />}
            <Elem ref={lsfRef} id="label-studio-dm" name="lsf-container" key="label-studio" />
          </Elem>
        </Elem>
      </Block>
    );
  }),
);
