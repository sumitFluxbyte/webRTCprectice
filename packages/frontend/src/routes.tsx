import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import WebRTCChat from "./page/webRTC";



export const router = createBrowserRouter([
 
  {
    path: "/",
    element: (
        <WebRTCChat />
    ),
      
  },{
    path:"*",
    element: <div >404 ¯\_(ツ)_/¯</div>,
  },
]);
