import { useEffect, useRef } from 'react';
import { FormRunner } from '@/form/renderer/viewRenderer/FormRunner';

export default function EmbedForm() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const sendHeight = () => {
      if (!containerRef.current) return;
      
      // offsetHeight gets true physical pixels. Add a 32px buffer to prevent scrollbars.
      const height = containerRef.current.offsetHeight + 32;

      // PERFORMANCE: Throttle the postMessage to prevent browser freezing 
      // if ResizeObserver fires rapidly during animations.
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        // We use '*' here because the iframe doesn't know where it was embedded.
        // This is safe because we secured the receiver in the HTML script above.
        window.parent.postMessage({ type: 'FRAME_RESIZE', height }, '*');
      });
    };

    // Initial triggers for slow network loads
    sendHeight();
    setTimeout(sendHeight, 500);

    // RELIABILITY: Observe the specific DOM node, not the whole window body
    const resizeObserver = new ResizeObserver(() => sendHeight());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // RELIABILITY: Catch React state changes (like error messages appearing)
    const mutationObserver = new MutationObserver(() => sendHeight());
    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    // RELIABILITY: 
    // 1. Removed min-h-screen so the iframe dictates its own height.
    // 2. Added flex flex-col to trap CSS margins so they are measured correctly.
    <div 
      ref={containerRef} 
      className="flex w-full flex-col overflow-x-hidden bg-background p-4 md:p-0"
    >
      <FormRunner />
    </div>
  );
}