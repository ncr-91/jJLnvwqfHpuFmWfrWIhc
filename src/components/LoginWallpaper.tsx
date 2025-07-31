import React, { useEffect, useRef } from 'react';

const DataTextureWallpaper = () => {
  const nodesRef = useRef(null);
  const connectionsRef = useRef(null);
  const streamsRef = useRef(null);
  const shapesRef = useRef(null);

  useEffect(() => {
    // Generate random data nodes
    const createNodes = () => {
      const nodesContainer = nodesRef.current;
      if (!nodesContainer) return;
      
      const nodeCount = 50;
      
      for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'absolute w-1 h-1 bg-[#00a89e] rounded-full opacity-60 animate-pulse';
        node.style.left = Math.random() * 100 + '%';
        node.style.top = Math.random() * 100 + '%';
        node.style.animationDelay = Math.random() * 4 + 's';
        node.style.animationDuration = '4s';
        nodesContainer.appendChild(node);
      }
    };
    
    // Generate connection lines
    const createConnections = () => {
      const connectionsContainer = connectionsRef.current;
      if (!connectionsContainer) return;
      
      const connectionCount = 20;
      
      for (let i = 0; i < connectionCount; i++) {
        const connection = document.createElement('div');
        connection.className = 'absolute h-px opacity-30';
        connection.style.left = Math.random() * 80 + '%';
        connection.style.top = Math.random() * 100 + '%';
        connection.style.width = Math.random() * 200 + 100 + 'px';
        connection.style.transform = `rotate(${Math.random() * 360}deg)`;
        connection.style.background = 'linear-gradient(90deg, transparent, #00a89e, transparent)';
        connection.style.animation = `connectionFlow 6s linear infinite ${Math.random() * 6}s`;
        connectionsContainer.appendChild(connection);
      }
    };
    
    // Generate data streams
    const createDataStreams = () => {
      const streamsContainer = streamsRef.current;
      if (!streamsContainer) return;
      
      const streamData = [
        '01100011 01100001 01101110 01100100 01100001',
        'savvy intelligence',
        'canda_mi_v2025',
        'GET /canda/data',
        'SELECT * FROM canda_data;',
        '@-33.8851899,151.1545267',
        'HTTP/fast, independent, insightful',
        'hello canda',
        'git commit -m "update"'
      ];
      
      streamData.forEach((text, index) => {
        const stream = document.createElement('div');
        stream.className = 'absolute text-xs text-[#00a89e] opacity-40 whitespace-nowrap font-mono';
        stream.textContent = text;
        stream.style.top = Math.random() * 90 + '%';
        stream.style.left = '-250px';
        stream.style.animation = `streamFlow 20s linear infinite ${index * 2}s`;
        streamsContainer.appendChild(stream);
      });
    };
    
    // Generate accent shapes
    const createAccentShapes = () => {
      const shapesContainer = shapesRef.current;
      if (!shapesContainer) return;
      
      const shapeCount = 8;
      
      for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        const isCircle = Math.random() > 0.5;
        shape.className = `absolute border-2 border-[#00a89e] opacity-20 ${isCircle ? 'rounded-full' : 'rounded'}`;
        
        const size = Math.random() * 60 + 20;
        shape.style.width = size + 'px';
        shape.style.height = size + 'px';
        shape.style.left = Math.random() * 90 + '%';
        shape.style.top = Math.random() * 90 + '%';
        shape.style.animation = `shapeRotate 15s linear infinite ${Math.random() * 15}s`;
        
        shapesContainer.appendChild(shape);
      }
    };
    
    // Initialize all elements
    createNodes();
    createConnections();
    createDataStreams();
    createAccentShapes();
    
    // Cleanup function (no mouse tracking)
    return () => {
      // No cleanup needed since we removed mouse tracking
    };
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes connectionFlow {
          0% { opacity: 0; transform: scaleX(0); }
          50% { opacity: 0.3; transform: scaleX(1); }
          100% { opacity: 0; transform: scaleX(0); }
        }
        
        @keyframes streamFlow {
          0% { transform: translateX(-100px); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateX(calc(100vw + 100px)); opacity: 0; }
        }
        
        @keyframes shapeRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="w-full h-screen relative bg-gradient-to-br from-gray-50 to-gray-200 overflow-hidden">
        {/* Data Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #00a89e 1px, transparent 1px),
              linear-gradient(180deg, #00a89e 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridPulse 8s ease-in-out infinite'
          }}
        />
        
        {/* Data Nodes */}
        <div ref={nodesRef} className="absolute inset-0" />
        
        {/* Connections */}
        <div ref={connectionsRef} className="absolute inset-0" />
        
        {/* Data Streams */}
        <div ref={streamsRef} className="absolute inset-0" />
        
        {/* Accent Shapes */}
        <div ref={shapesRef} className="absolute inset-0" />
      </div>
    </>
  );
};

export default DataTextureWallpaper;