import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VisNetwork from './Components/VisNetwork'
import { Network, DataSet } from "vis-network/standalone";
import { ArrowBigLeft, ArrowBigRight,HardDriveDownload,HardDriveUpload,CircleX,CircleCheck} from 'lucide-react';
import { Tooltip } from "react-tooltip";


function App() {
  const [showSideBar, setShowSideBar] = useState(-1);
  const [editNodeNameMode, setEditNodeNameMode] = useState(false);
  const [editEdgeLabelMode, setEditEdgeLabelMode] = useState(false);
  const [nodePropertyToChange, setNodePropertyToChange] = useState(null);
  const [edgePropertyToChange, setEdgePropertyToChange] = useState(null);
  const [mode, setMode] = useState(0);
  const [sender, setSender] = useState(-1);
  const [receiver, setReceiver] = useState(-1);
  const nodeNameInput = useRef(null);
  const edgeNameInput = useRef(null);
  const nodeIdInput = useRef(null);
  const edgeIdInput = useRef(null);
  const visNetworkRef = useRef();
  const outputVisNetworkRef = useRef();
  const iconSize = 30;
  const [mainGraphImg, setMainGraphImg] = useState(null);
  const [shortWayGraphImg, setShortWayGraphImg] = useState(null);
  

  //default coloe for the nodes
  const default_color = '#97c2fc';
  var nodes = new DataSet([
        {id: 1, label: 'Node 1',active: true, color: default_color},
        {id: 2, label: 'Node 2',active: true, color: default_color},
        {id: 3, label: 'Node 3',active: true, color: default_color},
        {id: 5, label: 'Node 5',active: true, color: default_color},
      ]);
  
  const cancelEditModeFunct = () => {
    setEditNodeNameMode(false);
    setEditEdgeLabelMode(false);
    
  };

  const enableNodeNameEditModeFunct = (node_id, node_name) => {
    setEditNodeNameMode(true);
    setEditEdgeLabelMode(false);
    nodeNameInput.current.value = node_name;
    nodeIdInput.current.value = node_id;
  };
  const enableEdgeLabelEditModeFunct = (edge_id, edge_label) => {
    setEditNodeNameMode(false);
    setEditEdgeLabelMode(true);
    edgeNameInput.current.value = edge_label;
    edgeIdInput.current.value = edge_id;
  }
  
  const updateNodeNameFunct = () => {
    const node_id = nodeIdInput.current.value;
    const node_name = nodeNameInput.current.value;
    
    console.log("updateNodeNameEditModeFunct nodeid : "+node_id);
    setNodePropertyToChange({id: node_id, label : node_name});
    nodeIdInput.current.value = '';
    nodeNameInput.current.value = '';
    cancelEditModeFunct();
  };
  const updateEdgeLabelFunct = () => {
    const edge_id = edgeIdInput.current.value;
    const edge_label = edgeNameInput.current.value;
    setEdgePropertyToChange({id : edge_id, label : edge_label});
    edgeIdInput.current.value = '';
    edgeNameInput.current.value = '';
    cancelEditModeFunct();
  };

  const changeMode = (mode) => {
    setMode(mode);
  };

  const handleShowMatrix = () => {
    if (sender===-1 || receiver===-1) {
      console.log("Please select sender and receiver nodes.");
      return;
    }
    if (visNetworkRef.current) {
       // Calling the function
      // Run Bellman-Ford to find shortest path and detect negative cycles
      let sender_index = visNetworkRef.current.getNodes().findIndex(node => node.id === sender);
      let receiver_index = visNetworkRef.current.getNodes().findIndex(node => node.id === receiver);
      let result = visNetworkRef.current.bellmanFord(visNetworkRef.current.get_matrix(), sender_index, receiver_index);
      outputVisNetworkRef.current.clearNodes();
      outputVisNetworkRef.current.clearEdges();
      if (result.cycleDetected) {
        alert("Cycle exists, no shortest path calculation.");
      } else {
          console.log("Shortest distances from source:", result.dist);
          let destinationNode = receiver_index; // Example destination index
          console.log("Destination node:", destinationNode);
          let path = visNetworkRef.current.getShortestPath(result.prev, destinationNode);
          console.log("path length:", path.length);
          if (path.length === 1) {
              console.log("No path to destination existing hhhhhhhhhhhh.");
              return;
          }
          console.log("heloooooooooooooo");
          let outputNodes = new DataSet();
          let outputEdges = new DataSet();
          let mainvisnetworknodes = visNetworkRef.current.getNodes();
          let mainvisnetworkedges = visNetworkRef.current.getEdges();
          path.forEach(nodeId => {
            outputNodes.add({id: mainvisnetworknodes[nodeId].id, label: mainvisnetworknodes[nodeId].label, active:true, color: mainvisnetworknodes[nodeId].color});
          });
          outputVisNetworkRef.current.setNodes(outputNodes.get())
          for (let i = 0; i < path.length - 1; i++) {
            let fromId = mainvisnetworknodes[path[i]].id;
            let toId = mainvisnetworknodes[path[i + 1]].id;
            let edge = mainvisnetworkedges.find(edge => edge.from === fromId && edge.to === toId);
            outputEdges.add({id: edge.id, from: fromId, to: toId, label: edge.label});
          }
          outputVisNetworkRef.current.setEdges(outputEdges.get());

          console.log("Shortest path to destination:", path);
      }
    }
  };
  useEffect(() => {
    console.log('the new sender is : ', sender);
    console.log('sender : ', sender," receiver : ", receiver);
  }, [sender]);
  useEffect(() => {
    console.log('the new receiver is : ', receiver);
    console.log('sender : ', sender," receiver : ", receiver);

  }, [receiver]);

  useEffect(() => {
    outputVisNetworkRef.current.redrawVisNetwork();
  }, [showSideBar]);

  const mainNetworkOptions = {
        "height": "100%",
        "width": "100%",/*
        "configure": {
          "enabled": true,
          "filter": true, // Allows user to select what to configure
          "container": document.getElementById(optionContainer)
        },*/
        "nodes": {
          "opacity": 1,
          "font": {
            "size": 15
          },
          
          "shadow": {
            "enabled": true
          },
          "shape": "circle",
          "shapeProperties": {
            "borderRadius": 3
          }
        },
        "edges": {
          "arrows": {
            "to": {
              "enabled": true,
              "scaleFactor": 1.05
            }
          },
          "selfReference": {
            "angle": 0.7853981633974483
          },
          "shadow": {
            "enabled": true
          },
          "smooth": {
            "forceDirection": "none",
            "roundness": 0.3
          }
        },
        "manipulation": {
          "enabled": true,
        },
        "physics": {
          "enabled": true,
          "solver": 'forceAtlas2Based', // Adjust layout solver
        }
        };

  const outputNetworkOptions = {
    "height": "100%",
    "width": "100%",/*
    "configure": {
      "enabled": true,
      "filter": true, // Allows user to select what to configure
      "container": document.getElementById(optionContainer)
    },*/
    "nodes": {
      "opacity": 1,
      "font": {
        "size": 15
      },
      "shape": "circle",
      "shapeProperties": {
        "borderRadius": 3
      }
    },
    "edges": {
      "arrows": {
        "to": {
          "enabled": true,
          "scaleFactor": 1.05
        }
      },
      "selfReference": {
        "angle": 0.7853981633974483
      },
      "smooth": {
        "forceDirection": "none",
        "roundness": 0.3
      }
    },
    "physics": {
      "enabled": true,
      "solver": 'forceAtlas2Based', // Adjust layout solver
    }
  };    
  return (
  <div className='flex flex-col w-screen h-dvh bg-gray-800 overflow-hidden'> 
    <header className='flex-1 h-[10dvh] min-h-13 w-full bg-sky-500 flex flex-row items-center justify-center'>
      {/* <div id="role_controls_buttons" className='flex flex-row justify-around items-center w-full h-full'>
        <button onClick={() => changeMode(1)} id="enable_btn" className={` ${mode===1 ? "bg-green-300" : "bg-sky-200"} rounded-lg relative h-5/10 w-20 before:absolute before:top-0 before:-left-10 before:w-7.5 before:h-7.5 before:bg-[#38a4bd] before:rounded-full before:mr-1.25`}>Enable</button>
        <button onClick={() => changeMode(2)} id="disable_btn" className={` ${mode===2 ? "bg-green-300" : "bg-sky-200"} rounded-lg relative h-5/10 w-20 before:absolute before:top-0 before:-left-10 before:w-7.5 before:h-7.5 before:bg-[#ff5b5b] before:rounded-full before:mr-1.25`}>Disable</button>
        <button onClick={() => changeMode(3)} id="sender_btn" className={` ${mode===3 ? "bg-green-300" : "bg-sky-200"} rounded-lg relative h-5/10 w-20 before:absolute before:top-0 before:-left-10 before:w-7.5 before:h-7.5 before:bg-[#4ee66d] before:rounded-full before:mr-1.25`}>Sender</button>
        <button onClick={() => changeMode(4)} id="receiver_btn" className={` ${mode===4 ? "bg-green-300" : "bg-sky-200"} rounded-lg relative h-5/10 w-20 before:absolute before:top-0 before:-left-10 before:w-7.5 before:h-7.5 before:bg-[#faae46] before:rounded-full before:mr-1.25`}>Receiver</button>
      </div> */}
      <div id="role_controls_buttons" className='py-10 my-10 w-9/10 sm:w-3/10 flex flex-row flex-wrap justify-around items-center h-auto border-x-1 border-gray-300 my-10 transition-all duration-600'>
        <button data-tooltip-id='tooltip' data-tooltip-content="Enable Node" onClick={() => changeMode(1)} id="enable_btn" className={`${(mode===1)?"text-gray-300":"text-black"}`}><CircleCheck /></button>
        <button data-tooltip-id='tooltip' data-tooltip-content="Disable Node" onClick={() => changeMode(2)} id="disable_btn" className={`${(mode===2)?"text-gray-300":"text-black"}`}><CircleX /></button>
        <button data-tooltip-id='tooltip' data-tooltip-content="Set Sender" onClick={() => changeMode(3)} id="sender_btn" className={`${(mode===3)?"text-gray-300":"text-black"}`}><HardDriveUpload /></button>
        <button data-tooltip-id='tooltip' data-tooltip-content="Set Receiver" onClick={() => changeMode(4)} id="receiver_btn" className={`${(mode===4)?"text-gray-300":"text-black"}`}><HardDriveDownload /></button>
        
      </div>
    
    </header>
    <div className='relative h-[90dvh] w-full flex flex-row items-center justify-center text-black'>
      <div className='relative flex-3 bg-gray-50 flex flex-col w-full h-full text-black overflow-hidden'>
        <VisNetwork
        ref={visNetworkRef}
        cancelEditModeFunct={cancelEditModeFunct} 
        enableNodeNameEditModeFunct={enableNodeNameEditModeFunct}
        enableEdgeLabelEditModeFunct={enableEdgeLabelEditModeFunct}
        nodePropertyToChange={nodePropertyToChange}
        edgePropertyToChange={edgePropertyToChange}
        setMode={setMode}
        mode={mode}
        sender={sender}
        receiver={receiver}
        setSender={setSender}
        setReceiver={setReceiver}
        options={mainNetworkOptions}
        setGraphImg={setMainGraphImg}
        />
        <div className={`absolute right-1/2 translate-x-1/2 h-14 w-3/10 bg-white flex rounded-xl flex flex-row items-center justify-center transition-all duration-600 overflow-hidden ${(editNodeNameMode || editEdgeLabelMode ) ? 'top-8/10' : 'top-3/2'}`}>
          <input ref={nodeNameInput} type="text" id="node_name_input" className={`flex-10 block w-full h-full rounded-l-md bg-white pl-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${editNodeNameMode ? "block" : "hidden"}`} placeholder='  Node Name :'/>
          <input ref={nodeIdInput} type='hidden' id='node_id_input'/>
          <button onClick={updateNodeNameFunct} className={`h-full flex-3 text-white bg-sky-600 ${editNodeNameMode ? "block" : "hidden"}`}>Update</button>
          
          <input ref={edgeNameInput} type="text" id="edge_name_input" className={`flex-10 block w-full h-full rounded-l-md bg-white pl-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${editEdgeLabelMode ? "block" : "hidden"}`} placeholder='  Edge Name :'/>
          <input ref={edgeIdInput} type='hidden' id='edge_id_input'/>
          <button onClick={updateEdgeLabelFunct} className={`h-full flex-3 text-white bg-sky-600 ${editEdgeLabelMode ? "block" : "hidden"}`}>Update</button>
          
        </div>
      </div>
      {/* <div id='sidebar' className={`${showSideBar === 1 ? 'flex-10 sm:flex-2 md:flex-1 w-full  ' : 'flex-0 w-0'} h-full bg-sky-500 transition-all duration-500 overflow-hidden`}>
        <div className='h-45/100 w-full bg-gray-500 flex flex-row items-center justify-center'>
          <button className='text:black h-15/100 w-4/10 bg-sky-600 rounded-lg text-white text-nowrap overflow-hidden' onClick={handleShowMatrix}>show Matrix</button>
        </div>
        <div className='h-45/100 w-full bg-gray-200'>
          <VisNetwork ref={outputVisNetworkRef} options={outputNetworkOptions}/>
        </div>
        <div className='h-1/10 w-full bg-sky-800 flex flex-row items-center justify-center'>
          <button onClick={() =>{}} className='h-3/4 w-4/10 bg-sky-600 rounded-lg text-white text-nowrap overflow-hidden'>Shortest Way</button>
        </div>

        
      </div> */}
      <div id='sidebar' className={`${showSideBar === 1 ? '-translate-x-1/1 ' : ''}sm:w-35/100 top-0 left-full absolute w-full  h-full bg-sky-500 transition-all duration-500 `}>
        <button className='sm:hidden absolute left-4 top-4 hover:bg-sky-600 rounded-full text-black transition-all duration-600' onClick={() => setShowSideBar(showSideBar * -1)}>{showSideBar!==1 ? <ArrowBigLeft color="#000000" size={iconSize} style={{margin:"10px"}}/> : <ArrowBigRight color="#000000" size={iconSize} style={{margin:"10px"}}/>}</button>
        <button className='absolute -left-15 top-4 hover:bg-sky-600 rounded-full text-black transition-all duration-600' onClick={() => setShowSideBar(showSideBar * -1)}>{showSideBar!==1 ? <ArrowBigLeft color="#000000" size={iconSize} style={{margin:"10px"}}/> : <ArrowBigRight color="#000000" size={iconSize} style={{margin:"10px"}}/>}</button>
          
        <div className='h-45/100 w-full bg-gray-500 flex flex-row items-center justify-center'>
        <button className='text:black h-15/100 w-4/10 bg-sky-600 rounded-lg text-white text-nowrap overflow-hidden' >show Matrix</button>
        <br />
        <button className='text:black h-15/100 w-4/10 bg-sky-600 rounded-lg text-white text-nowrap overflow-hidden'><a id="graph_img" href={mainGraphImg} download>Download</a></button>
        <br />
        <button className='text:black h-15/100 w-4/10 bg-sky-600 rounded-lg text-white text-nowrap overflow-hidden' onClick={()=>{
          visNetworkRef.current.clearNodes();
          visNetworkRef.current.clearEdges();
          }} >reset</button>
        </div>
        <div className='h-45/100 w-full bg-gray-200'>
          <VisNetwork id="mainvis" ref={outputVisNetworkRef} options={outputNetworkOptions} setGraphImg={setShortWayGraphImg}/>
        </div>
        <div className='h-1/10 w-full bg-sky-800 flex flex-row items-center justify-center'>
          <button className='h-3/4 w-4/10 bg-sky-600 rounded-lg text-white text-nowrap overflow-hidden' onClick={handleShowMatrix}>Shortest Way</button>
        </div>

        
      </div>
    </div>
    <Tooltip id='tooltip' effect='solid' place='bottom' type='dark' />
  </div>
    
  )
}

export default App
