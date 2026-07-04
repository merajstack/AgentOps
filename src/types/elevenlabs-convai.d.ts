// Allow the custom element tag used by the ElevenLabs Convai widget
import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'agent-id'?: string;
      };
    }
  }
}

export {};


