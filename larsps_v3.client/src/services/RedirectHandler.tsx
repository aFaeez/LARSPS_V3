import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const RedirectHandler = () => {
    const navigate = useNavigate();
    const { page } = useParams(); // Get the page parameter from the URL

    useEffect(() => {
        // Get stored redirect page
        const redirectPage = sessionStorage.getItem("redirectPage") || page;

        if (redirectPage) {
            navigate(`/${redirectPage.replace(/^~\//, "")}`);
        } else {
            navigate("/");
        }
    }, [navigate, page]);

    return <div>Redirecting...</div>;
};

export default RedirectHandler;
