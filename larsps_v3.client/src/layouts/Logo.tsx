import { Link } from "react-router-dom";

const Logo = () => {
    return (
        <Link
            to="/"
            className="nav-link"
            style={{
                color: "white",
                fontSize: "24px", // Adjust size here
                fontWeight: "bold", // Optional: Makes the text bold
                textDecoration: "none", // Removes underline
            }}
        >
            LARSPS
        </Link>
    );
};

export default Logo;
