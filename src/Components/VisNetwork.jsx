import React, { forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { Network, DataSet } from "vis-network/standalone";

const VisNetwork = forwardRef(({cancelEditModeFunct, 
  enableNodeNameEditModeFunct, 
  enableEdgeLabelEditModeFunct, 
  nodePropertyToChange, 
  edgePropertyToChange,
  setMode,
  mode,
  sender,
  setSender,
  receiver,
  setReceiver,
  options,
  },ref) => {
  
  const networkRef = useRef(null);
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);
  const modeRef = useRef(null);
  const senderRef = useRef(null);
  const receiverRef = useRef(null);
  const visNetworkRef = useRef(null);
 
  //default coloe for the nodes
  const default_color = '#97c2fc';

  //disabled color for the nodes
  const disabled_color = '#ff5b5b';

  //sender color for the nodes
  const sender_color = '#4ee66d';

  //receiver color for the nodes
  const receiver_color = '#faae46';
  
  useImperativeHandle(ref, () => ({
    get_matrix, // Expose the function
    bellmanFord,
    getShortestPath,
    clearNodes,
    clearEdges,
    setNodes,
    setEdges,
    getNodes,
    getEdges,
    redrawVisNetwork,
  }));

  useEffect(() => {
    var nodes = new DataSet([
      {id: 1, label: 'Node 1',active: true, color: default_color},
      {id: 2, label: 'Node 2',active: true, color: default_color},
      {id: 3, label: 'Node 3',active: true, color: default_color},
      {id: 5, label: 'Node 5',active: true, color: default_color},
    ]);

    // create an array with edges
    var edges = new DataSet([
      {from: 1, to: 3, label: '14'},
      {from: 3, to: 2, label: '5'},
      {from: 2, to: 5, label: '-4'},
    ]);

    nodesRef.current = nodes;
    edgesRef.current = edges;

    const container = networkRef.current;
    const data = { nodes, edges };
    
    const network = new Network(container, data, options);
    visNetworkRef.current = network;
    network.on("click", function (params) {
        setMode(0);
        cancelEditModeFunct();
        if (params.nodes.length > 0) {
          if (modeRef.current===0){
            console.log(mode);
            enableNodeNameEditModeFunct(params.nodes[0],nodes.get(params.nodes[0]).label);
            // showSideBarfunc("heloooo");
          }
          if (modeRef.current===1) {
            nodes.update({id: params.nodes[0], color: default_color, active: true});
            if (senderRef.current===params.nodes[0]) {
              setSender(-1);
            }
            if (receiverRef.current===params.nodes[0]) {
              setReceiver(-1);
            }
          }
          else if (modeRef.current===2) {
            nodes.update({id: params.nodes[0], color: disabled_color, active: false});
            if (senderRef.current===params.nodes[0]) {
              setSender(-1);
            }
            if (receiverRef.current===params.nodes[0]) {
              setReceiver(-1);
            }
          }
          else if (modeRef.current===3) {
            if(senderRef.current!==-1) {
              nodes.update({id: senderRef.current, color: default_color});
            }
            if(receiverRef.current===params.nodes[0]) {
              setReceiver(-1);
            }

            setSender(params.nodes[0]);
            nodes.update({id: params.nodes[0], color: sender_color, active: true});
          }
          else if (modeRef.current===4) {
            if(receiverRef.current!==-1) {
              nodes.update({id: receiverRef.current, color: default_color});
            }
            if(senderRef.current===params.nodes[0]) {
              setSender(-1);
            }
            setReceiver(params.nodes[0]);
            nodes.update({id: params.nodes[0], color: receiver_color ,active: true});
          }
        }
        else if (params.edges.length > 0) {
          if (modeRef.current===0){
            enableEdgeLabelEditModeFunct(params.edges[0],edges.get(params.edges[0]).label);
            // showSideBarfunc("heloooo");
          }
        }
      
      });
    
    
  }, []);

  const clearNodes = () => {
    nodesRef.current.clear();
  }
  const clearEdges = () => {
    edgesRef.current.clear();
  } 
  const setNodes = (nodes) => {
    clearNodes();
    nodes.forEach(node => {
      nodesRef.current.add(node);
    });
  };
  const setEdges = (edges) => {
    clearEdges();
    edges.forEach(edge => {
      edgesRef.current.add(edge);
    });
  };
  const getNodes = () => {
    return nodesRef.current.get();
  };
  const getEdges = () => {
    return edgesRef.current.get();
  };
  const redrawVisNetwork = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("redraw");
    visNetworkRef.current.redraw();
    visNetworkRef.current.fit();
  };
  // Function to generate and display the adjacency matrix
  function get_matrix() {
    // Get only active nodes
    var activeNodes = nodesRef.current.get().filter(node => node.active !== false);
    var nodeIds = activeNodes.map(node => node.id);

    // Initialize adjacency matrix as a 2D array
    var adjacencyMatrix = Array(nodeIds.length).fill(0).map(() => Array(nodeIds.length).fill(0));

    // Fill the adjacency matrix with edge weights
    edgesRef.current.get().forEach(edge => {
        let fromIndex = nodeIds.indexOf(edge.from);
        let toIndex = nodeIds.indexOf(edge.to);
        if (fromIndex !== -1 && toIndex !== -1) {
            adjacencyMatrix[fromIndex][toIndex] = parseInt(edge.label) || 0; // Convert label to number
        }
    });

  // Display the matrix in the HTML
  var output_matrix = adjacencyMatrix.map(row => row.join(" ")).join("\n");
  console.log(adjacencyMatrix);
  console.log(output_matrix);
  return adjacencyMatrix;
  }


  function bellmanFord(adjacencyMatrix, source, destination) {
    const numNodes = adjacencyMatrix.length;
    let dist = Array(numNodes).fill(Infinity); // Distance array
    let prev = Array(numNodes).fill(null); // To store the shortest path
    dist[source] = 0; // Distance to source is zero

    // Relax all edges (numNodes - 1) times
    for (let i = 0; i < numNodes - 1; i++) {
        for (let u = 0; u < numNodes; u++) {
            for (let v = 0; v < numNodes; v++) {
                if (adjacencyMatrix[u][v] !== 0 && dist[u] !== Infinity) { // Check for a valid edge
                    let newDist = dist[u] + adjacencyMatrix[u][v];
                    if (newDist < dist[v]) {
                        dist[v] = newDist;
                        prev[v] = u;
                    }
                }
            }
        }
    }

    // Check for negative weight cycles
    for (let u = 0; u < numNodes; u++) {
        for (let v = 0; v < numNodes; v++) {
            if (adjacencyMatrix[u][v] !== 0 && dist[u] !== Infinity) {
                let newDist = dist[u] + adjacencyMatrix[u][v];
                if (newDist < dist[v]) {
                    console.log("Negative weight cycle detected!");
                    return { cycleDetected: true, dist, prev };
                }
            }
        }
    }

    // If no cycle is detected, return the distance and path to the specific destination
    if (dist[destination] === Infinity) {
        console.log("No path to destination exists.");
        return { cycleDetected: false, dist, prev, path: [] };
    }

    // Return the shortest path to the destination if no negative cycle
    return { cycleDetected: false, dist, prev, path: getShortestPath(prev, destination) };
}

// Function to retrieve the shortest path from source to destination
  function getShortestPath(prev, destination) {
      let path = [];
      for (let at = destination; at !== null; at = prev[at]) {
          path.push(at);
      }
      path.reverse(); // Reverse the path to get the correct order
      return path;
  }





  useEffect(() => {
      modeRef.current = mode; // Update modeRef whenever mode changes
    }, [mode]);
  
    useEffect(() => {
    if (nodePropertyToChange && nodesRef.current) {
      nodesRef.current.update(nodePropertyToChange);
    }
  }, [nodePropertyToChange]);

  useEffect(() => {
    if (edgePropertyToChange && edgesRef.current) {
      edgesRef.current.update(edgePropertyToChange);
    }
  }, [edgePropertyToChange]);

  useEffect(() => {
    senderRef.current = sender; // Update modeRef whenever mode changes
  }, [sender]);

  useEffect(() => {
    receiverRef.current = receiver; // Update modeRef whenever mode changes
  }, [receiver]);

  return <div className="w-full h-full" ref={networkRef}  />;
});

export default VisNetwork;
    
