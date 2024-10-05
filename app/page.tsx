"use client";

import { Room } from "./Room";
import { CollaborativeApp } from "./CollaborativeApp";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <div className="h-screen overflow-hidden">
      <Navbar />
      <section className="h-full flex">
        <Live />
      </section>
    </div>
  );
}
