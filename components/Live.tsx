import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@liveblocks/react";
import LiveCursors from "./cursor/LiveCursors";
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reaction, setReaction] = useState<Reaction[]>([]);
  const setReactions = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const broadcast = useBroadcastEvent();
  useInterval(() => {
    if (
      cursorState.mode == CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      console.log("flying reactions");

      setReaction((reactions) => {
        return reactions.concat([
          {
            value: cursorState.reaction,
            timestamp: Date.now(),
            point: { x: cursor.x, y: cursor.y },
          },
        ]);
      });
      //broadcast the reaction positions to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);
  //listent other users reaction using the event listener hook
  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;

    setReaction((reactions) => {
      return reactions.concat([
        {
          value: event.value,
          timestamp: Date.now(),
          point: { x: event.x, y: event.y },
        },
      ]);
    });
  });
  //clear the reactions after a while from state for performance reasons
  useInterval(() => {
    setReaction((reaction) =>
      reaction.filter((r) => Date.now() - r.timestamp < 4000)
    );
  }, 2000);
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (cursor == null || cursorState.mode != CursorMode.ReactionSelector) {
      event.preventDefault();
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setCursorState]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setCursorState]
  );

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        console.log("slash");
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      } else if (e.key === "e") {
        console.log("emoji", cursorState.mode);
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);
  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      className=" border-2 border-lime-500 h-screen w-full flex justify-center items-center text-center"
      //   className=" w-4 h-4 bg-red-500"
      // className="bg-red-500 w-full h-screen flex justify-center items-center text-center"
    >
      <h1 className="text-3xl">hello coleagues!</h1>
      {reaction.map((r) => {
        return (
          <FlyingReaction
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        );
      })}
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}
      {cursorState.mode == CursorMode.ReactionSelector && (
        <ReactionSelector setReaction={setReactions} />
      )}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
