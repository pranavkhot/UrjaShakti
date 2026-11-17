// src/components/TidioChatbot.tsx
import React, { useEffect } from 'react';

/* The widget's own colour is set through Tidio's API once it is ready, so the
   bubble matches the palette instead of arriving in Tidio's default blue.
   Its position is set in tokens.css. Presentation only: the chat itself is
   untouched. */
declare global {
  interface Window {
    tidioChatApi?: { setColorPalette: (colour: string) => void };
  }
}

const BRAND = '#15171c'; // --ink-900

const TidioChatbot: React.FC = () => {
  useEffect(() => {
    const paint = () => {
      try {
        window.tidioChatApi?.setColorPalette(BRAND);
      } catch {
        /* the widget is optional; never let it break the page */
      }
    };

    if (window.tidioChatApi) {
      paint();
    } else {
      document.addEventListener('tidioChat-ready', paint);
    }

    // Check if the Tidio script is already present
    if (!document.getElementById('tidio-chatbot-script')) {
      const script = document.createElement('script');
      script.id = 'tidio-chatbot-script';
      script.src = '//code.tidio.co/jj4gv40mldmxtoyxmblxajt8z0fmnxfg.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => document.removeEventListener('tidioChat-ready', paint);
  }, []);

  return null; // This component doesn't render anything visible
};

export default TidioChatbot;
