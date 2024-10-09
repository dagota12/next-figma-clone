"use client";

import { Room } from "./Room";
import * as fabric from "fabric"; // v6

import { CollaborativeApp } from "./CollaborativeApp";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import { useMutation, useStorage } from "@liveblocks/react";

export default function Page() {
  //canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const canvasObjects = useStorage((root) => root.canvasObjects);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");

    canvasObjects.set(objectId, shapeData);
  }, []);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });
  const handleActiveElemet = (elem: ActiveElement) => {
    setActiveElement(elem);
    selectedShapeRef.current = elem?.value as string;
  };
  useEffect(() => {
    const canvas = initializeFabric({ fabricRef, canvasRef });
    canvas.on("mouse:down", (options: any) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    });
    canvas.on("mouse:move", (options: any) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });
    canvas.on("mouse:up", (options: any) => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });
    canvas.on("object:modified", (options: any) => {
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });
    const resizeListener = window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });
    return () => {
      canvas.dispose();
    };
  }, []);
  useEffect(() => {
    if (!canvasObjects) return;
    // console.log("canvasObjects", canvasObjects);

    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);
  return (
    <div className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElemet}
      />
      <section className="h-full flex">
        <LeftSidebar />
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
    </div>
  );
}
