import { Col, CardBody, Button, Card, Form, FormGroup, Label, Input, FormText, CardTitle } from "reactstrap";
import { useState, useEffect } from "react";
import { useSession } from "../../context/SessionContext";
import * as API from "../../services/apiService";
import { SafeRender, SafeRenderDate, GetCurrentDateTime, GetUserIPAddress, SafeRenderDatewithTime } from "../../services/globalVariable";
import { SubmitBGRequest } from "../../services/apiClient";
import * as globalVariable from "../../services/globalVariable";
import { BGSub, SubBGTemplateProps } from "../../dto/dtos";
import LoadingModal from '../../layouts/LoadingModal';
import ToastMsg from '../../layouts/ToastMsg';
import Uploader from "./Uploader";

interface FormErrors {
    [key: string]: string;
}

const SubBGTemplate: React.FC<SubBGTemplateProps> = ({ strLA }) => {
    const { companyName, userId } = useSession();
    const [bgSub, setBGSub] = useState<BGSub[]>([]); // State to hold fetched data
    const [loading, setLoading] = useState(false); // State for loading indicator

    const [errorMessages, setErrorMessages] = useState<FormErrors>({});
    const [formData, setFormData] = useState<BGSub[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"BG" | "PBRL" | null>(null);
    const [laNo, setLaNo] = useState<string | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);

    // Show Toast Function
    const showToast = (type: "success" | "error", message: string) => {
        setToast({ visible: true, type, message });
        setTimeout(() => setToast({ visible: false, type, message: "" }), 3000);
    };
    const [toast, setToast] = useState({ visible: false, type: "error" as "success" | "error", message: "" });

    // Function to open modal and store parameters
    const openModal = (type: "BG" | "PBRL", laNo: string, projectId: string) => {
        setModalType(type);
        setLaNo(laNo);
        setProjectId(projectId);
        setModalOpen(true);
    };

    // Fetch data from API
    const fetchBGSub = async () => {
        setLoading(true);
        try {
            const BG = await API.FetchBGSub(strLA);
            setBGSub(BG);
            setFormData(BG);
        } catch (err) {
            console.error("Something went wrong:", err);
            showToast("error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = <K extends keyof BGSub>(
        index: number,
        field: K,
        value: BGSub[K] // Ensure value matches the correct type from BGSub
    ) => {
        const updatedBgSub = [...bgSub];
        updatedBgSub[index][field] = value; // Type-safe assignment

        setBGSub(updatedBgSub);

        const updatedFormData = [...formData];
        updatedFormData[index][field] = value; // Type-safe update
        setFormData(updatedFormData);
    };

    const handleSubmit = async (e: React.FormEvent, BGLaNo: string | number) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true); // Show loading indicator

        try {
            if (validateForm()) {
                if (userId && companyName) {
                    const ipAddress = await GetUserIPAddress();
                    const currentDate = GetCurrentDateTime();

                    // Find the specific item to update
                    const targetItemIndex = formData.findIndex((item) => item.BGLaNo === BGLaNo);

                    if (targetItemIndex !== -1) {
                        const targetItem = formData[targetItemIndex];

                        //const updatedItem: SubmitBGRequest = {
                        //    bgLaNo: targetItem.BGLaNo,
                        //    bgAmount: targetItem.BGAmount,
                        //    bgDate: globalVariable.validateAndISOFormatDate(targetItem.BGDate),
                        //    bgExpiryDate: globalVariable.validateAndISOFormatDate(targetItem.BGExpiryDate),
                        //    bgToExtend: targetItem.BGToExtend === "Yes" ? "1" : "0",
                        //    bgExtDate: globalVariable.validateAndISOFormatDate(targetItem.BGExtDate),
                        //    bgProvidedDate: globalVariable.validateAndISOFormatDate(targetItem.BGProvidedDate),
                        //    bgRefNo: targetItem.BGRefNo,
                        //    bgBank: targetItem.BGBank,
                        //    hawDateExt: globalVariable.validateAndISOFormatDate(targetItem.HawDateExt),
                        //    attachment: targetItem.Attachment,
                        //    hawProjId: targetItem.HawProjId,
                        //    hawRecId: targetItem.HawRecId,
                        //    pbReplacementLetter: targetItem.PBReplacementLetter,
                        //    pbReplacementLetterOption: targetItem.PBReplacementLetterOption,
                        //    bgUserId: userId,
                        //    bgRecDate: globalVariable.validateAndISOFormatDate(currentDate),
                        //    bgRecId: targetItem.BGRecId,
                        //    bgUserIPAddr: ipAddress,
                        //    bgCompId : companyName,
                        //};

                        const updatedItem = new SubmitBGRequest();

                        updatedItem.bgLaNo = targetItem.BGLaNo;
                        updatedItem.bgDate = globalVariable.validateAndISOFormatDate(targetItem.BGDate);
                        updatedItem.bgExpiryDate = globalVariable.validateAndISOFormatDate(targetItem.BGExpiryDate);
                        updatedItem.bgToExtend = targetItem.BGToExtend === "Yes" ? "1" : "0";
                        updatedItem.bgExtDate = globalVariable.validateAndISOFormatDate(targetItem.BGExtDate);
                        updatedItem.bgRefNo = targetItem.BGRefNo ?? undefined;
                        updatedItem.bgBank = targetItem.BGBank ?? undefined;
                        updatedItem.bgUserId = userId;
                        updatedItem.bgRecDate = globalVariable.validateAndISOFormatDate(currentDate);
                        updatedItem.bgUserIPAddr = ipAddress;
                        updatedItem.bgCompId = companyName;

                        const response = await API.SubmitBG(updatedItem);

                        if (response.success) {
                            showToast("success", "Bank Guarantee submitted successfully!");
                        } else {
                            showToast("error", `Failed: ${response.message}`);
                        }
                    } else {
                        console.error(`Item with BGLaNo "${BGLaNo}" not found.`);
                        showToast("error", "Something went wrong. Please try again.");
                    }
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
        const errors: FormErrors = {}; // Object to hold error messages
        let isValid = true;

        // Iterate through each item in the formData (array)
        formData.forEach((item, index) => {
            // Check if BGRefNo is filled
            if (!item.BGRefNo) {
                errors[`BGRefNo-${index}`] = "Reference Number is required";
                isValid = false;
            }

            // Check if BGDate and BGExpiryDate are valid dates
            if (!item.BGDate) {
                errors[`BGDate-${index}`] = "BG Date is required";
                isValid = false;
            }

            if (!item.BGExpiryDate) {
                errors[`BGExpiryDate-${index}`] = "BG Expiry Date is required";
                isValid = false;
            }
        });
        setErrorMessages(errors);
        return isValid;
    };

    useEffect(() => {
        fetchBGSub();
    }, []);

    return (
        <Card>
            <CardTitle tag="h6" className="border-bottom p-3 mb-0">
                <i className="bi bi-card-text me-2"> </i>
                Bank Guarantee Info
            </CardTitle>
            <CardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {bgSub.map((item, index) => (

                        <Form key={index} >
                            <FormGroup row>
                                <Label for={`BGAmount-${index}`} sm={2}>BG Amount</Label>
                                <Col sm={4}>
                                    <Input
                                        type="text"
                                        name="amount"
                                        id={`BGAmount-${index}`}
                                        placeholder="BG Amount"
                                        value={SafeRender(item.BGAmount)}
                                        onChange={(e) => handleInputChange(index, "BGAmount", parseFloat(e.target.value) || 0)}
                                    />
                                </Col>

                                <Label for={`BGRefNo-${index}`} sm={2}>Reference Number</Label>
                                <Col sm={4}>
                                    <Input
                                        type="text"
                                        name="refno"
                                        id={`BGRefNo-${index}`}
                                        placeholder="BG Reference No"
                                        value={SafeRender(item.BGRefNo)}
                                        onChange={(e) => handleInputChange(index, "BGRefNo", e.target.value)}
                                    />
                                    {errorMessages[`BGRefNo-${index}`] && (
                                        <FormText color="danger">{errorMessages[`BGRefNo-${index}`]}</FormText>
                                    )}
                                </Col>
                            </FormGroup>

                            <FormGroup row>
                                <Label for={`BGBank-${index}`} sm={2}>Issuing Bank</Label>
                                <Col sm={10}>
                                    <Input
                                        type="text"
                                        name="bank"
                                        id={`BGBank-${index}`}
                                        placeholder="Bank Name"
                                        value={SafeRender(item.BGBank)}
                                        onChange={(e) => handleInputChange(index, "BGBank", e.target.value)}
                                    />
                                    {errorMessages[`BGBank-${index}`] && (
                                        <FormText color="danger">{errorMessages[`BGBank-${index}`]}</FormText>
                                    )}
                                </Col>
                            </FormGroup>

                            <FormGroup row>
                                <Label for={`BGDate-${index}`} sm={2}>BG Date</Label>
                                <Col sm={4}>
                                    <Input
                                        type="date"
                                        name="date"
                                        id={`BGDate-${index}`}
                                        placeholder="BG Date"
                                        value={SafeRenderDate(item.BGDate)}
                                        onChange={(e) => handleInputChange(index, "BGDate", e.target.value)}
                                    />
                                </Col>
                                <Label for={`BGExpiryDate-${index}`} sm={2}>BG Expiry Date</Label>
                                <Col sm={4}>
                                    <Input
                                        type="date"
                                        name="dateexp"
                                        id={`BGExpiryDate-${index}`}
                                        placeholder="BG Expiry Date"
                                        value={SafeRenderDate(item.BGExpiryDate)}
                                        onChange={(e) => handleInputChange(index, "BGExpiryDate", e.target.value)}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup tag="fieldset" row>
                                <legend className="col-form-label col-sm-2">Require to Extend</legend>
                                <Col sm={4}>
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="radio"
                                                name={`BGToExtend-${index}`}
                                                value="Yes"
                                                checked={item.BGToExtend?.toLowerCase() === "yes"}
                                                onChange={() => handleInputChange(index, "BGToExtend", "Yes")}
                                            />
                                            {'Yes'}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="radio"
                                                name={`BGToExtend-${index}`}
                                                value="No"
                                                checked={item.BGToExtend?.toLowerCase() === "no"}
                                                onChange={() => handleInputChange(index, "BGToExtend", "No")}
                                            />
                                            {'No'}
                                        </Label>
                                    </FormGroup>
                                </Col>
                                <Label for={`BGExtDate-${index}`} sm={2}>BG Extention Date</Label>
                                <Col sm={4}>
                                    <Input
                                        type="date"
                                        name="dateexp"
                                        id={`BGExtDate-${index}`}
                                        placeholder="BG Extension Date"
                                        value={SafeRenderDate(item.BGExtDate)}
                                        onChange={(e) => handleInputChange(index, "BGExtDate", e.target.value)}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup row>
                                <Label for={`attachment-${index}`} sm={2}>Attachment</Label>
                                <Col sm={4}>

                                    <Button
                                        style={{
                                            backgroundColor: "#f8f9fa",
                                            color: "#212529",
                                            border: "1px solid #ced4da",
                                            padding: "6px 125px",
                                            borderRadius: "12px",
                                            fontSize: "14px",
                                        }}
                                        onClick={() => openModal("BG", item.BGLaNo, item.HawProjId)}
                                    >
                                        Attach BG
                                    </Button>
                                </Col>

                                <Label for="BGExpDate" sm={2}>LA Extension Date</Label>
                                <Col sm={4}>
                                    <Input
                                        type="date"
                                        name="extDate"
                                        id={`extDate-${index}`}
                                        placeholder="LA Extension Date"
                                        value={SafeRenderDate(item.HawDateExt)}
                                        readOnly />
                                </Col>
                            </FormGroup>

                            <FormGroup row>
                                <Label for={`pbrl-${index}`} sm={2}>PB Replacement Letter</Label>
                                <Col sm={4}>

                                    <Button
                                        style={{
                                            backgroundColor: "#f8f9fa",
                                            color: "#212529",
                                            border: "1px solid #ced4da",
                                            padding: "6px 117px",
                                            borderRadius: "12px",
                                            fontSize: "14px",
                                        }}
                                        onClick={() => openModal("PBRL", item.BGLaNo, item.HawProjId)}
                                    >
                                        Attach PBRL
                                    </Button>
                                    {/*<Input type="file" name="attach" id="attachment" />*/}
                                    {/*<FormText color="muted">*/}
                                    {/*    Max 2mb*/}
                                    {/*</FormText>*/}
                                </Col>
                                <Label for={`pbrlOpt-${index}`} sm={2}>PB Replacement Option</Label>
                                <Col sm={4}>
                                    <Input
                                        type="text"
                                        name="pbrl"
                                        id={`pbrlOpt-${index}`}
                                        placeholder="PB Replacement Option"
                                        value={SafeRender(item.PBReplacementLetterOption)}
                                        readOnly
                                    />
                                </Col>
                            </FormGroup>


                            <FormGroup row className="align-items-center">
                                <Label sm={2} className="fw-bold">Remarks</Label>
                                <Col sm={10}>
                                    <div className="p-2 rounded border">
                                        <FormText className="d-block">
                                            {SafeRender(item.BGUserId) ? (
                                                <>
                                                    <span className="fw-semibold">
                                                        Edited by {SafeRender(item.BGUserId)}
                                                    </span>{" "}
                                                    on {SafeRenderDatewithTime(item.BGRecDate)}
                                                </>
                                            ) : (
                                                <span>No remarks available</span>
                                            )}
                                        </FormText>
                                    </div>
                                </Col>
                            </FormGroup>


                            <FormGroup row>
                                <Col sm={{ size: 2, offset: 2 }}>
                                    <Button type="submit" color="success" onClick={(e) => handleSubmit(e, item.BGLaNo)} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
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

export default SubBGTemplate;
