import { useState, useEffect } from "react";
import { Col, CardBody, Button, Card, Form, FormGroup, Label, Input, FormText,CardTitle } from "reactstrap";
import { APB, APBTemplateProps } from "../../dto/dtos";
import LoadingModal from '../../layouts/LoadingModal';
import ToastMsg from '../../layouts/ToastMsg';
import * as globalVariable from "../../services/globalVariable";
import * as API from "../../services/apiService";
import Uploader from "./Uploader";
import { useSession } from "../../context/SessionContext";
import { SubmitAPBRequest } from "../../services/apiClient";

interface FormErrors {
    [key: string]: string;
}

const APBTemplate: React.FC<APBTemplateProps> = ({ strProjId,strLA }) => {
    const { companyName, userId } = useSession();
    const [apb, setAPB] = useState<APB[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessages, setErrorMessages] = useState<FormErrors>({}); 
    const [formData, setFormData] = useState<APB[]>([]); 

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"APB">();
    const [laNo, setLaNo] = useState<string | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);

    // Show Toast Function
    const showToast = (type: "success" | "error", message: string) => {
        setToast({ visible: true, type, message });
        setTimeout(() => setToast({ visible: false, type, message: "" }), 3000);
    };
    const [toast, setToast] = useState({ visible: false, type: "error" as "success" | "error", message: "" });

    const openModal = (type: "APB", laNo: string, projectId: string) => {
        setModalType(type);
        setLaNo(laNo);
        setProjectId(projectId);
        setModalOpen(true);
    };

    // Fetch data from API
    const fetchAPB = async () => {
        setLoading(true);

        try {
            if (companyName) {
                const APB = await API.FetchAPB(strProjId, strLA, companyName);
                setAPB(APB);
                setFormData(APB);
            }
        } catch (err) {
            console.error("Something went wrong:", err);
            showToast("error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, APBLaNo: string | number) => {
        e.preventDefault();
        setLoading(true);

        try {
        if (validateForm()) {
            if (userId && companyName) {
                const ipAddress = await globalVariable.GetUserIPAddress();
                const currentDate = globalVariable.GetCurrentDateTime();

                // Find the specific item to update
                const targetItemIndex = formData.findIndex((item) => item.APBLaNo === APBLaNo);


                if (targetItemIndex !== -1) {
                    const targetItem = formData[targetItemIndex];

                    //const updatedItem: SubmitAPBRequest = {
                    //    apbLaNo: targetItem.APBLaNo,
                    //    apbAmount: targetItem.APBAmount,
                    //    apbDate: globalVariable.validateAndISOFormatDate(targetItem.APBDate),
                    //    apbExpiryDate: globalVariable.validateAndISOFormatDate(targetItem.APBExpiryDate),
                    //    apbExtDate: globalVariable.validateAndISOFormatDate(targetItem.APBExtDate),
                    //    apbProvidedDate: globalVariable.validateAndISOFormatDate(targetItem.APBProvidedDate),
                    //    apbRefNo: targetItem.APBRefNo,
                    //    apbBank: targetItem.APBBank,
                    //    apbUserId: userId,
                    //    apbRecDate: globalVariable.validateAndISOFormatDate(currentDate),
                    //    apbRecId: targetItem.APBRecId,
                    //    apbUserIPAddr: ipAddress,
                    //    apbCompId: companyName,
                    //};

                    const updatedItem = new SubmitAPBRequest();

                    updatedItem.apbLaNo = targetItem.APBLaNo;
                    updatedItem.apbAmount = targetItem.APBAmount;
                    updatedItem.apbDate = globalVariable.validateAndISOFormatDate(targetItem.APBDate);
                    updatedItem.apbExpiryDate = globalVariable.validateAndISOFormatDate(targetItem.APBExpiryDate);
                    updatedItem.apbExtDate = globalVariable.validateAndISOFormatDate(targetItem.APBExtDate);
                    updatedItem.apbProvidedDate = globalVariable.validateAndISOFormatDate(targetItem.APBProvidedDate);
                    updatedItem.apbRefNo = targetItem.APBRefNo ?? undefined;
                    updatedItem.apbBank = targetItem.APBBank ?? undefined;
                    updatedItem.apbUserId = userId;
                    updatedItem.apbRecDate = globalVariable.validateAndISOFormatDate(currentDate);
                    updatedItem.apbUserIPAddr = ipAddress;
                    updatedItem.apbCompId = companyName;

                    const response = await API.SubmitAPB(updatedItem);

                    if (response.success) {
                        showToast("success", "Advance Payment Bond submitted successfully!");
                    } else {
                        showToast("error", `Failed: ${response.message}`);
                    }
                } else {
                    console.error(`Item with APBLaNo "${APBLaNo}" not found.`);
                    showToast("error", "Something went wrong. Please try again.");
                }

                //if (targetItemIndex !== -1) {
                //    const updatedItem = {
                //        ...formData[targetItemIndex],
                //        APBQSAppUserId: userId,
                //        APBQSAppUserIPAddr: ipAddress,
                //        APBQSAppDate: currentDate,
                //    };

                //    try {

                //        if (companyName) {
                //            await API.SubmitAPB([updatedItem], companyName);
                //        }
                         
                //        setFormData((prevFormData) => {
                //            const newFormData = [...prevFormData];
                //            newFormData[targetItemIndex] = updatedItem;
                //            return newFormData;
                //        });
                //        showToast("success", "Successfully update form !");
                //    } catch (error) {
                //        console.error("Error submitting data:", error);
                //        showToast("error", "Something went wrong. Please try again.");
                //    }
                //} else {
                //    console.error(`Item with APBLaNo "${APBLaNo}" not found.`);
                //    showToast("error", "Something went wrong. Please try again.");
                //}
            }
        } else {
            showToast("error", "Form is not complete. Please try again.");
        }
        } catch (err) {
            console.error("Failed to update status:", err);
            showToast("error", "Something went wrong. Please try again.");
        }
        setLoading(false); // Hide loading indicator
    };

    const validateForm = () => {
        const errors: FormErrors = {}; 
        let isValid = true;

        formData.forEach((item, index) => {
            // Check if APBAmount is filled and is a valid number
            if (!item.APBAmount) {
                errors[`APBAmount-${index}`] = "APB Amount is required and must be a valid number";
                isValid = false;
            }

            // Check if APBRefNo is filled
            if (!item.APBRefNo) {
                errors[`APBRefNo-${index}`] = "Reference Number is required";
                isValid = false;
            }

            // Check if APBDate and APBExpiryDate are valid dates
            if (!item.APBDate) {
                errors[`APBDate-${index}`] = "APB Date is required";
                isValid = false;
            }

            if (!item.APBExpiryDate) {
                errors[`APBExpiryDate-${index}`] = "APB Expiry Date is required";
                isValid = false;
            }
        });

        setErrorMessages(errors); // Set the error messages state to show in the UI
        return isValid;
    };

    // Handle input changes
    const handleInputChange = <K extends keyof APB>(
        index: number,
        field: K,
        value: APB[K] // Ensure value matches the correct type from APB
    ) => {
        const updatedAPB = [...apb];
        updatedAPB[index][field] = value;

        setAPB(updatedAPB);

        const updatedFormData = [...formData];
        updatedFormData[index][field] = value;
        setFormData(updatedFormData);
    };


    useEffect(() => {
        fetchAPB();
    }, []);

    return (
        <Card>
            <CardTitle tag="h6" className="border-bottom p-3 mb-0">
                <i className="bi bi-card-text me-2"> </i>
                Advance Payment Bond Info
            </CardTitle>
            <CardBody>
                {loading && <p>Loading...</p>}
                {!loading  && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {apb.map((item, index) => (

                            <Form key={index}>
                                <FormGroup row>
                                    <Label for={`APBAmount-${index}`} sm={2}>APB Amount</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="text"
                                            name="amount"
                                            id={`APBAmount-${index}`}
                                            placeholder="APB Amount"
                                            value={globalVariable.SafeRender(item.APBAmount)}
                                            onChange={(e) => handleInputChange(index, "APBAmount", parseFloat(e.target.value) || 0)}
                                        />
                                        {errorMessages.APBAmount && <FormText color="danger">{errorMessages.APBAmount}</FormText>}
                                    </Col>
                                    <Label for={`APBRefNo-${index}`} sm={2}>APB Reference Number</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="text"
                                            name="refno"
                                            id={`APBRefNo-${index}`}
                                            placeholder="APB Reference No"
                                            value={globalVariable.SafeRender(item.APBRefNo)}
                                            onChange={(e) => handleInputChange(index, "APBRefNo", e.target.value)}
                                        />
                                    </Col>
                                </FormGroup>

                                <FormGroup row>
                                    <Label for={`apbBank-${index}`} sm={2}>APB from Bank</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="text"
                                            name="bank"
                                            id={`apbBank-${index}`}
                                            placeholder="Bank Name"
                                            value={globalVariable.SafeRender(item.APBBank)}
                                            onChange={(e) => handleInputChange(index, "APBBank", e.target.value)}
                                        />
                                    </Col>
                                    <Label for={`APBDate-${index}`} sm={2}>APB Date</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="date"
                                            name="date"
                                            id={`APBDate-${index}`}
                                            value={globalVariable.SafeRenderDate(item.APBDate)}
                                            onChange={(e) => handleInputChange(index, "APBDate", e.target.value)}
                                        />
                                    </Col>
                                </FormGroup>

                                <FormGroup row>
                                    <Label for={`APBExpiryDate-${index}`} sm={2}>APB Expiry Date</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="date"
                                            name="dateexpiry"
                                            id={`APBExpiryDate-${index}`}
                                            value={globalVariable.SafeRenderDate(item.APBExpiryDate)}
                                            onChange={(e) => handleInputChange(index, "APBExpiryDate", e.target.value)}
                                        />
                                    </Col>
                                    <Label for={`APBExtDate-${index}`} sm={2}>APB Extention Date</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="date"
                                            name="dateexp"
                                            id={`APBExtDate-${index}`}
                                            value={globalVariable.SafeRenderDate(item.APBExtDate)}
                                            onChange={(e) => handleInputChange(index, "APBExtDate", e.target.value)}
                                        />
                                    </Col>
                                </FormGroup>

                                <FormGroup row>
                                    <Label for="APBProvidedDate" sm={2}>APB Provided Date</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="date"
                                            name="dateprovided"
                                            id={`APBProvidedDate-${index}`}
                                            value={globalVariable.SafeRenderDate(item.APBProvidedDate)}
                                            onChange={(e) => handleInputChange(index, "APBProvidedDate", e.target.value)}
                                        />
                                    </Col>
                                    <Label for={`attachment-${index}`} sm={2}>Attachment</Label>
                                    <Col sm={4}>
                                        <Button
                                            style={{
                                                backgroundColor: "#f8f9fa",
                                                color: "#212529",
                                                border: "1px solid #ced4da",
                                                padding: "6px 120px",
                                                borderRadius: "12px",
                                                fontSize: "14px",
                                            }}
                                            onClick={() => openModal("APB", item.APBLaNo, item.HawProjId)}
                                        >
                                            Attach APB
                                        </Button>
                                    </Col>
                                </FormGroup>

                                <FormGroup row>
                                    <Col sm={{ size: 2, offset: 2 }}>
                                        <Button type="submit" color="success" onClick={(e) => handleSubmit(e, item.APBLaNo)} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                                    </Col>
                                </FormGroup>
                            </Form>
                        ))}

                        {/* Loading Modal */}
                        <LoadingModal isOpen={loading} />

                        {/* Toast Notification */}
                        <ToastMsg
                            isOpen={toast.visible}
                            type={toast.type}
                            message={toast.message}
                            toggle={() => setToast({ visible: false, type: "error", message: "" })}
                            timeout={3000}
                        />
                    </div>
                )}
            </CardBody>

            {modalOpen && modalType && laNo && projectId && (
                <Uploader
                    type={modalType}
                    laNo={laNo}
                    projectId={projectId}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </Card>
    );
};

export default APBTemplate;
