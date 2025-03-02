import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const redirectToExternalSystem = async () => {
            // Extract session data
            const UserId = sessionStorage.getItem("UserId");
            const Login = sessionStorage.getItem("UserId"); // Assuming Login is the same as UserId
            const page = sessionStorage.getItem("Page");
            const project = sessionStorage.getItem("Project");

            // Base URLs
            const externalBaseURL = "http://10.2.80.239";
            const localLandingURL = "http://localhost/LARSPSv2/Landing";

            if (location.pathname.startsWith("/LARSPS/")) {
                // Replace localhost with the external system's host dynamically
                const targetURL = location.pathname.replace(/^\/LARSPS\//, `${externalBaseURL}/LARSPS/`);

                // Set cookies for authentication in the external system
                document.cookie = `UserId=${UserId || ""}; path=/; domain=10.2.80.239;`;
                document.cookie = `Login=${Login || ""}; path=/; domain=10.2.80.239;`;

                // Redirect
                window.location.href = targetURL;
            } else if (location.pathname.startsWith("/LARSPSv2/")) {
                // Create a form for secure POST request
                const form = document.createElement("form");
                form.method = "POST";
                form.action = localLandingURL;

                // Hidden fields to pass data
                const userIdField = document.createElement("input");
                userIdField.type = "hidden";
                userIdField.name = "UserId";
                userIdField.value = UserId || "";

                const loginField = document.createElement("input");
                loginField.type = "hidden";
                loginField.name = "Login";
                loginField.value = Login || "";

                const pageField = document.createElement("input");
                pageField.type = "hidden";
                pageField.name = "page";
                pageField.value = page || "";

                const projectField = document.createElement("input");
                projectField.type = "hidden";
                projectField.name = "project";
                projectField.value = project || "";

                // Append fields to form
                form.appendChild(userIdField);
                form.appendChild(loginField);
                form.appendChild(pageField);
                form.appendChild(projectField);

                document.body.appendChild(form);
                form.submit();
            } else {
                navigate("*");
            }
        };

        redirectToExternalSystem();
    }, [location, navigate]);

    return <p>Redirecting...</p>;
};

export default RedirectHandler;
