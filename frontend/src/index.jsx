import React from "react";
import { createRoot } from "react-dom/client";
import * as serviceworker from './serviceWorker'

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
window.finishProgress();

serviceworker.register()