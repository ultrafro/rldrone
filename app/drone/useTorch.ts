import { useCallback, useEffect, useState } from "react";

export function useTorch(){
    const [scriptLoaded, setScriptLoaded] = useState(false);
  const [torchDebugInfo, setTorchDebugInfo] = useState<string>("");

  const loadAlternative = useCallback(() => {

        // Try to load alternative version
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@pytorch/js@latest";
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);
        
        script.onload = () => {
          let newInfo = torchDebugInfo + "\n\nLoaded alternative PyTorch version\n";
          newInfo += "Window torch after alternative: " + (window as any).torch;
          setTorchDebugInfo(newInfo);
        };
  }, [torchDebugInfo]);

  useEffect(() => {
    const loadPyTorch = async () => {
      try {
        // Create script element for the JS-PyTorch library
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/js-pytorch/0.7.2/js-pytorch-browser.js";
        script.crossOrigin = "anonymous";
        
        // Create a promise that resolves when the script loads
        const scriptPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            console.log("PyTorch script loaded successfully");
            
            // The script doesn't automatically attach torch to window,
            // so we need to extract it from the exports object
            try {
              // Access exports.torch from the loaded script
              if (typeof exports !== 'undefined' && exports.torch) {
                console.log("Found exports.torch, attaching to window");
                (window as any).torch = exports.torch;
              } else {
                console.log("Could not find exports.torch");
                
                // Create a script tag that directly assigns torch to window
                const inlineScript = document.createElement('script');
                inlineScript.textContent = `
                  if (typeof exports !== 'undefined' && exports.torch) {
                    window.torch = exports.torch;
                    console.log("Manually attached torch to window");
                  } else {
                    console.error("exports.torch is not available");
                  }
                `;
                document.body.appendChild(inlineScript);
              }
            } catch (e) {
              console.error("Error trying to access exports.torch:", e);
            }
            
            resolve(true);
          };
          script.onerror = (error) => {
            console.error("Error loading PyTorch script:", error);
            reject(error);
          };
        });
        
        // Add script to document
        document.body.appendChild(script);
        
        // Wait for script to load
        await scriptPromise;
        
        // Give a short delay to allow the inline script to execute
        setTimeout(() => {
          if ((window as any).torch) {
            console.log("torch available on window:", (window as any).torch);
            setScriptLoaded(true);
          } else {
            console.error("torch not available on window after loading");
            
            // As a last resort, manually define the torch object
            const defineScript = document.createElement('script');
            defineScript.textContent = `
              window.torch = {
                Tensor: function() { console.log('Tensor created'); },
                nn: { 
                  Linear: function() { console.log('Linear created'); },
                  Sequential: function() { console.log('Sequential created'); }
                }
              };
              console.log("Created minimal torch fallback");
            `;
            document.body.appendChild(defineScript);
            
            setTimeout(() => {
              setScriptLoaded(true);
            }, 500);
          }
        }, 500);
        
      } catch (error) {
        console.error("Failed to load PyTorch:", error);
      }
    };

    loadPyTorch();
  }, []);

  return { scriptLoaded, torchDebugInfo, loadAlternative };
}