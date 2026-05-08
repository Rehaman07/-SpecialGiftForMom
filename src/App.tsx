/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SceneManager } from './components/SceneManager';

export default function App() {
  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden">
      <SceneManager />
      
      {/* Scanline Effect for cinematic feel */}
      <div className="fixed inset-0 pointer-events-none z-[150] scanline opacity-20" />
    </div>
  );
}
