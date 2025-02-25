import { createBrowserRouter } from "react-router-dom";
import WebRTCChat from "./page/webRTC";
import WebRTCFile from "./page/webRTCFilesharing";



export const router = createBrowserRouter([
  {
    path: "/",
    element: (
        <WebRTCChat />
    ),
      
  },
  {
    path: "/file",
    element: (
        <WebRTCFile />
    ),
      
  },
  {
    path:"*",
    element: <div >404 ¯\_(ツ)_/¯</div>,
  },
]);
