import { Col, Card, CardBody, Button, Row, Container, Form, FormGroup, Label, Input } from "reactstrap";
import logo from "../../assets/images/logos/SPYTL.jpg";
import { ROUTES } from "../../routes/Path";
import { useNavigate } from "react-router-dom";
import ToastNotification from '../../layouts/ToastMsg';
import { LoginCred } from "../../services/apiService";
import { useState } from "react";
import { GetUserRequest } from "../../services/apiClient";
import { useSession } from "../../context/SessionContext";

function Login() {
    const navigate = useNavigate();
    const { systemName } = useSession();
    const [loading, setLoading] = useState(false);
    const [errorToastVisible, setErrorToastVisible] = useState(false);
    const [formData, setFormData] = useState({ username: "", password: "" }); 

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.username || !formData.password) {
                setErrorToastVisible(true);
                setTimeout(() => setErrorToastVisible(false), 3000);
                return;
            }

            const requestData = {
                queryType: "USER",
                userID: formData.username,
                menuSystemName: systemName
            };

            const userCredential = await LoginCred(requestData as GetUserRequest);
            if (userCredential) {
                navigate(`${ROUTES.master}`);
                console.log("Checkpoint 1:" + userCredential);
                sessionStorage.setItem("UserId", "");
            } else {
                console.error("Invalid login credentials");
                setErrorToastVisible(true);
                setTimeout(() => setErrorToastVisible(false), 3000);
            }

        } catch (error) {
            console.error("Login failed:", error);
            setErrorToastVisible(true);
            setTimeout(() => setErrorToastVisible(false), 3000);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container className="d-flex vh-100">
            <Row className="align-items-center justify-content-center w-100">
                <Col sm="12">
                    <Card>
                        <CardBody>
                            <Row>
                                <Col sm='6'>
                                    <div className='d-flex flex-row ps-5 pt-5'>
                                        <img src={logo} alt="Logo" />
                                    </div>
                                    <div className='d-flex flex-row ps-5 pt-4'>
                                        <h3 style={{ letterSpacing: '1px' }}>
                                            WELCOME TO LARSPSV3
                                        </h3>
                                    </div>
                                    
                                    <div className='pt-4'>
                                        {/* Form */}
                                        <Form onSubmit={handleSubmit} className="w-100 p-4">
                                            <FormGroup row className="mb-3">
                                                <Label for="username" sm={3} className="text-end fw-semibold">
                                                    Username
                                                </Label>
                                                <Col sm={9}>
                                                    <Input
                                                        type="text"
                                                        id="username"
                                                        name="username"
                                                        placeholder="Enter your username"
                                                        onChange={handleInputChange}
                                                        className="w-100"
                                                    />
                                                </Col>
                                            </FormGroup>

                                            <FormGroup row className="mb-4">
                                                <Label for="password" sm={3} className="text-end fw-semibold">
                                                    Password
                                                </Label>
                                                <Col sm={9}>
                                                    <Input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        placeholder="Enter your password"
                                                        onChange={handleInputChange}
                                                        className="w-100"
                                                    />
                                                </Col>
                                            </FormGroup>

                                            {/* Login Button - Same Width as Inputs */}
                                            <FormGroup row>
                                                <Col sm={{ size: 9, offset: 3 }}>
                                                    <Button type="submit" color="primary" disabled={loading} className="w-100">
                                                        {loading ? "Logging in..." : "Login"}
                                                    </Button>
                                                </Col>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                </Col>

                                <Col sm="6" className="d-flex justify-content-center align-items-start" style={{ paddingTop: "50px" }}>
                                    <img
                                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                                        className="img-fluid"
                                        alt="Login visual"
                                        style={{ maxHeight: "400px", objectFit: "contain" }}
                                    />
                                </Col>
                            </Row>

                            {/* Error Toast */}
                            <ToastNotification
                                isOpen={errorToastVisible}
                                type="error"
                                message="Invalid username or password. Please try again."
                                toggle={() => setErrorToastVisible(false)}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
