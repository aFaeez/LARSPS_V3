import { MDBInput, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { Col, Card, CardBody, Button, Row, Container, Form, FormGroup, Label } from "reactstrap";
import logo from "../../assets/images/logos/SPYTL.jpg";
import { ROUTES } from "../../routes/Path";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ToastNotification from '../../layouts/ToastMsg';
import { LoginCred } from "../../services/apiService";


function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorToastVisible, setErrorToastVisible] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" }); 

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.email || !formData.password) {
                setErrorToastVisible(true);
                setTimeout(() => setErrorToastVisible(false), 3000);
                return;
            }

            const userCredential = await LoginCred(formData);
            if (userCredential) {
                navigate(`${ROUTES.master}`);
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
                            <MDBContainer fluid>
                                <MDBRow>
                                    <MDBCol sm='6'>
                                        <div className='d-flex flex-row ps-5 pt-5'>
                                            <img src={logo} alt="Logo" />
                                        </div>

                                        <div className='d-flex flex-column justify-content-center h-custom-2 w-75 pt-4'>
                                            <h3 className="fw-normal mb-3 ps-5 pb-3" style={{ letterSpacing: '1px' }}>Log in</h3>

                                            {/* Form */}
                                            <Form onSubmit={handleSubmit}>
                                                <FormGroup>
                                                    <Label for="email">Email Address</Label>
                                                    <MDBInput
                                                        wrapperClass='mb-4 mx-5 w-100'
                                                        label='Email address'
                                                        id='email'
                                                        type='email'
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        size="lg"
                                                    />
                                                </FormGroup>

                                                <FormGroup>
                                                    <Label for="password">Password</Label>
                                                    <MDBInput
                                                        wrapperClass='mb-4 mx-5 w-100'
                                                        label='Password'
                                                        id='password'
                                                        type='password'
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        size="lg"
                                                    />
                                                </FormGroup>

                                                <Button className="mb-4 px-5 mx-5 w-100" type="submit" color="primary" disabled={loading}>
                                                    {loading ? "Logging in..." : "Login"}
                                                </Button>
                                            </Form>
                                        </div>
                                    </MDBCol>

                                    <MDBCol sm="6" className="d-flex justify-content-center align-items-start" style={{ paddingTop: "50px" }}>
                                        <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                                            className="img-fluid"
                                            alt="Login visual"
                                            style={{ maxHeight: "400px", objectFit: "contain" }}
                                        />
                                    </MDBCol>
                                </MDBRow>
                            </MDBContainer>

                            {/* Error Toast */}
                            <ToastNotification
                                isOpen={errorToastVisible}
                                type="error"
                                message="Invalid email or password. Please try again."
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
