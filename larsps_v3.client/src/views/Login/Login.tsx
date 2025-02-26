import { Col, Card, CardBody, Button, Row, Container, Form, FormGroup, Label, Input } from "reactstrap";
import logo from "../../assets/images/logos/SPYTL.jpg";
import ToastMsg from '../../layouts/ToastMsg';  // Ensure correct import
import { useState } from "react";
import { GetUserRequest, GetUserResponse } from "../../services/apiClient";
import * as API from "../../services/apiService";
import * as globalVariable from "../../services/globalVariable";
import { useSession } from "../../context/SessionContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const { setUserId, setParentSystemName, setCompanyName, setIsITAdmin, setFullName } = useSession();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, type: "error" as "success" | "error", message: "" });
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Show Toast Function
    const showToast = (type: "success" | "error", message: string) => {
        setToast({ visible: true, type, message });
        setTimeout(() => setToast({ visible: false, type, message: "" }), 3000);
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.username || !formData.password) {
                showToast("error", "Username and password are required.");
                return;
            }

            const config = await API.WebConfig();
            if (config) {
                setParentSystemName(config.parentSystemName);
                setCompanyName(config.companyName);
            }

            const requestData = {
                queryType: "USER",
                userID: formData.username,
                menuSystemName: config.parentSystemName
            };

            const userCredential = await API.LoginCred(requestData as GetUserRequest) as GetUserResponse[];

            if (userCredential.length > 0) {
                const user = userCredential[0];
                setUserId(user.userId ?? "");
                setFullName(user.msName ?? "");

                const itAdmin = globalVariable.ITAdminChecker(user.userId ?? "", config.itadmin);
                setIsITAdmin(itAdmin);

                showToast("success", "Login successful! Redirecting...");
                const systemName = config.systemName.replace(/^~\//, ""); 
                const masterPage = config.landingPage.replace(/^~\//, ""); 

                navigate(`/${systemName}/${masterPage}`, { replace: true });

            } else {
                showToast("error", "Invalid username or password. Please try again.");
            }
        } catch (error) {
            console.error("Login failed:", error);
            showToast("error", "Login failed. Please try again.");
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

                            {/* Toast Notification */}
                            <ToastMsg
                                isOpen={toast.visible}
                                type={toast.type}
                                message={toast.message}
                                toggle={() => setToast({ visible: false, type: "error", message: "" })}
                                timeout={3000}
                            />

                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
