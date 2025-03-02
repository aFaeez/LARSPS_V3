import { Container, Button, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <Container className="vh-100 d-flex flex-column justify-content-center align-items-center text-center">
            <Row>
                <Col md={12}>
                    <h1 className="display-1 fw-bold text-danger">404</h1>
                    <h2 className="display-6 fw-semibold text-dark">Oops! Page Not Found</h2>
                    <p className="text-muted mt-3">
                        The page you are looking for might have been removed or is temporarily unavailable.
                    </p>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
                        alt="404 Not Found"
                        className="img-fluid my-4"
                        style={{ maxWidth: "250px" }}
                    />
                    <div>
                        <Button color="primary" tag={Link} to="LARSPSv3/MainPage" className="me-2">
                            Go to Home
                        </Button>
                        <Button color="secondary" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;
