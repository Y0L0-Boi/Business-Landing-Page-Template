// Import the createRoot function from the react-dom/client package
import { createRoot } from "react-dom/client";

// Import the main App component from the App.tsx file
import App from "./App";

// Import the main CSS file for the application
import "./index.css";

// Create a root element using the element with id "root" in the HTML document
// The exclamation mark (!) is a TypeScript non-null assertion operator, indicating that the element is not null
createRoot(document.getElementById("root")!).render(<App />); // Render the App component inside the root element
