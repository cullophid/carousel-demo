import React, { useState, useCallback } from "react";
import { TOTAL_IMAGES, DRAG_UNIT, IMG_URL } from "./utils/constants";
import "./App.css";

const App = () => {
  const [uiClick, setUiClick] = useState(true);
  const [uiZoom, setUiZoom] = useState(false);
  const [uiLoading, setUiLoading] = useState(false);
  const [dragState, setDragState] = useState({
    index: 1,
    lastIndex: 1,
    dragStart: 0,
    isDragging: false,
  });
  const [panState, setPanState] = useState({
    isPanning: false,
    prevScreen: { x: 0, y: 0 },
    screen: { x: 0, y: 0 },
  });

  const handleMouseDown = (event) => {
    if (!uiZoom) {
      setDragState({
        ...dragState,
        isDragging: true,
        dragStart: event.screenX,
      });
    }
    if (uiZoom) {
      setPanState({
        ...panState,
        isPanning: true,
        prevScreen: {
          x: event.screenX,
          y: event.screenY,
        },
      });
    }
  };

  const handleMouseMove = (event) => {
    if (dragState.isDragging) {
      setUiClick(false);
      const { length: totalImgs } = TOTAL_IMAGES;
      const position = event.screenX - dragState.dragStart;
      const unitsDrag = Math.floor(position / DRAG_UNIT) + dragState.lastIndex;
      if (unitsDrag < 0) {
        setDragState({
          ...dragState,
          index: TOTAL_IMAGES[totalImgs + unitsDrag],
        });
      }
      if (unitsDrag >= 0 && unitsDrag < totalImgs) {
        setDragState({ ...dragState, index: TOTAL_IMAGES[unitsDrag] });
      }
      if (unitsDrag >= totalImgs) {
        setDragState({
          ...dragState,
          index: TOTAL_IMAGES[unitsDrag - totalImgs],
        });
      }
    }
    if (panState.isPanning) {
      if (uiClick) {
        setUiClick(false);
      }
      setPanState({
        ...panState,
        screen: {
          x: panState.screen.x + event.screenX - panState.prevScreen.x,
          y: panState.screen.y + event.screenY - panState.prevScreen.y,
        },
        prevScreen: { x: event.screenX, y: event.screenY },
      });
    }
  };

  const handleMouseUp = useCallback(() => {
    setDragState({
      ...dragState,
      isDragging: false,
      lastIndex: dragState.index,
    });
    setPanState({ ...panState, isPanning: false });
    let mouseDownTimer = setTimeout(() => setUiClick(true), 200);
    return () => {
      clearTimeout(mouseDownTimer);
    };
  }, [dragState, panState]);

  const handleClick = () => {
    if (uiClick) {
      setUiZoom(!uiZoom);
      setDragState({ ...dragState, isDragging: false });
      if (!uiZoom) {
        setUiLoading(true);
      }
      if (uiZoom) {
        setUiLoading(false);
        setPanState({
          ...panState,
          prevScreen: { x: 0, y: 0 },
          screen: { x: 0, y: 0 },
        });
      }
    }
  };

  return (
    <div>
      <h1 className="mainHeading">Carousel demo</h1>
      <ul
        className="carousel"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: dragState.isDragging ? "grabbing" : "grab" }}
      >
        {TOTAL_IMAGES.map((imgIndex) => (
          <li
            className="carousel__item"
            key={imgIndex}
            onClick={handleClick}
            style={{
              opacity: imgIndex === dragState.index ? "1" : "0",
              backgroundImage: uiZoom
                ? "none"
                : "url(" + IMG_URL + imgIndex + ")",
            }}
          />
        ))}
        {uiZoom && (
          <img
            alt="product"
            src={`${IMG_URL}${dragState.index}/?size=(${4096})`}
            draggable="false"
            style={{
              transform:
                "translate(" +
                (panState.screen.x - 4096 / 2) +
                "px," +
                (panState.screen.y - 4096 / 2) +
                "px)",
              cursor: "move",
            }}
            onClick={handleClick}
            onLoad={() => setUiLoading(false)}
          />
        )}
        {uiLoading && (
          <div className="loading">
            <h2 className="loading__message">loading....</h2>
          </div>
        )}
      </ul>
    </div>
  );
};

export default App;
