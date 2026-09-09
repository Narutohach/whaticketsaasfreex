import React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import * as serviceworker from './serviceWorker'

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
	<CssBaseline>
		<App />
	</CssBaseline>
);
window.finishProgress();

serviceworker.register()