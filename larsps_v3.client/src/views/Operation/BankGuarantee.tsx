import { Row, Col, Card, CardBody, CardTitle, CardText, Badge, Form, FormGroup, Input, Button } from "reactstrap";
import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { useSession } from "../../context/SessionContext";
import { FetchGetBG, GetTotLA, GetApproved, GetPending, Activator } from "../../services/apiService";
import { SafeRender, GetCurrentDateTime, SafeRenderDatewithTime, GetUserIPAddress } from "../../services/globalVariable";
import { BGDTO } from "../../dto/dtos";
import BGSubTemplate from "./BGSubTemplate";
import APBTemplate from "./APBTemplate";
import ListProjModal from "./ListProjModal";
import ToastNotification from '../../layouts/ToastMsg';

const BankGuarantee: React.FC = () => {
    const { companyName } = useSession();
    const [data, setBG] = useState<BGDTO[]>([]); // State to hold fetched data
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [search, setSearch] = useState(""); // State for filtering
    const [filteredData, setFilteredData] = useState<BGDTO[]>([]);
   
    const [totalLA, setTotLA] = useState<number>(0); // Default to 0
    const [totalApproved, setApproved] = useState<number>(0); // Default to 0
    const [totalPending, setPending] = useState<number>(0); // Default to 0

    const [bgSubLoading, setBgSubLoading] = useState(false); // Loading indicator for BGSub data
    const [showBGSubForm, setShowBGSubForm] = useState(false); // Toggle for showing BG Sub form
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0); // Default to first item

    const [apbLoading, setapbLoading] = useState(false);
    const [showAPBForm, setshowAPBForm] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [toastVisible, setToastVisible] = useState(false); // Success toast visibility state
    const [errorToastVisible, setErrorToastVisible] = useState(false); // Error toast visibility state
    const [toastMessage, setToastMessage] = useState("");
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const [selectedFilter, setSelectedFilter] = useState<string>("");

    // Fetch data from API
    const fetchData = async (UPProjectId: string) => {
        setLoading(true);
        try {
            if (companyName) {
                const BG = await FetchGetBG(UPProjectId, companyName);
                setBG(BG);
                setFilteredData(BG);

                const totalLA = await GetTotLA(UPProjectId, companyName);
                const Count = totalLA[0]?.TotalCount;
                setTotLA(Count);

                const totalAppr = await GetApproved(UPProjectId, companyName);
                const Appr = totalAppr[0]?.TotalCount;
                setApproved(Appr);


                const totalPending = await GetPending(UPProjectId, companyName);
                const Pend = totalPending[0]?.TotalCount;
                setPending(Pend);
            }

        } catch (err) {
            console.error("Error fetching BG:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleBGBtn = async (index: number) => {
        setshowAPBForm(false); // Ensure the APB form is closed
        setSelectedIndex(index); // Set the selected index
        setShowBGSubForm((prev) => !prev); // Toggle the visibility of the BGSub form

        if (!showBGSubForm) { // Only fetch when opening the form
            setBgSubLoading(true); // Set loading to true
            try {
                // Simulate fetching data or add API call here
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Replace with actual API call
            } catch (error) {
                console.error("Error fetching BG Sub data:", error);
            } finally {
                setBgSubLoading(false); // Set loading to false
            }
        }
    };


    const handleAPBBtn = async (index: number) => {
        setShowBGSubForm(false); // Ensure the BGSub form is closed
        setSelectedIndex(index); // Set the selected index
        setshowAPBForm((prev) => !prev); // Toggle the visibility of the APB form

        if (!showAPBForm) { // Only fetch when opening the form
            setapbLoading(true); // Set loading to true
            try {
                // Simulate fetching data or add API call here
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Replace with actual API call
            } catch (error) {
                console.error("Error fetching APB data:", error);
            } finally {
                setapbLoading(false); // Set loading to false
            }
        }
    };


    // Columns for the table
    const columns = useMemo<MRT_ColumnDef<BGDTO>[]>(() => [
        {
            accessorKey: "HawLaNo",
            header: "LA No.",
        },
        {
            accessorKey: "ComName",
            header: "Subcontractor",
        },
        {
            accessorKey: "SupLaAmt",
            header: "LA Amount",
        },
        {
            accessorKey: "BGQSAppStat",
            header: "Approval Status",
            Cell: ({ cell }) => {
                const value = cell.getValue();
                const isApproved =
                    value === "Yes" || value === "PBRL Retention" || value === "PBRL ContSum";

                return (
                    <Badge color={isApproved ? "success" : "danger"}>
                        {isApproved ? "Approved" : "Pending"}
                    </Badge>
                );
            },
        },
    ], []);



    const ProjectName = sessionStorage.getItem("ProjectName");
    const displayProjectName = () => {
        const upProjectId = sessionStorage.getItem("Project");
        let name = "";

        if (upProjectId != null && upProjectId !== "?") {
            name = `${ProjectName} (${upProjectId})`; // If upProjectId is available
        } else {
            name = `Choose project first`;
        }
        return name;
    };


    const toggleStatus = async (index: number, type: string, LANo: string) => {
        try {
            const updatedData = [...filteredData]; // Clone the current state

            const currentStatus =
                type === "BG" ? updatedData[index].BGQSAppStat :
                    type === "APB" ? updatedData[index].APBQSAppStat :
                        type === "Waive" ? updatedData[index].BGExtWaived :
                            "No"; // Default to "No" if type is unrecognized

            const action = currentStatus === "Yes" ? "deactivate" : "activate";
            const confirmation = window.confirm(`Are you sure you want to ${action} this LA?`);
            if (!confirmation) return; // Stop execution if the user cancels

            const userId = sessionStorage.getItem("UserId") || "";
            const ipAddress = await GetUserIPAddress();
            const currentDate = GetCurrentDateTime();
            let statusToNumber = "1";
            let newStatus = "Yes";
            let ipField = "";

            if (type === "BG") {
                newStatus = currentStatus === "Yes" ? "No" : "Yes";
                updatedData[index].BGQSAppStat = newStatus;
                if (newStatus === "No") {
                    updatedData[index].BGQSAppUserId = "";
                    updatedData[index].BGQSAppDate = "";
                    ipField = "";
                } else {
                    updatedData[index].BGQSAppUserId = userId;
                    updatedData[index].BGQSAppDate = currentDate;
                    ipField = ipAddress;
                }
            } else if (type === "APB") {
                newStatus = currentStatus === "Yes" ? "No" : "Yes";
                updatedData[index].APBQSAppStat = newStatus;
                ipField = newStatus === "No" ? "" : ipAddress;
            } else if (type === "Waive") {
                newStatus = currentStatus === "Yes" ? "No" : "Yes";
                updatedData[index].BGExtWaived = newStatus;
                if (newStatus === "No") {
                    updatedData[index].BGExtWaivedUserId = "";
                    updatedData[index].BGExtWaivedDate = "";
                    ipField = "";
                } else {
                    updatedData[index].BGExtWaivedUserId = userId;
                    updatedData[index].BGExtWaivedDate = currentDate;
                    ipField = ipAddress;
                }
            }

            if (newStatus === "No") {
                statusToNumber = "0";
            }
            if (companyName) {
                await Activator(statusToNumber, userId, ipField, currentDate, type, LANo, companyName);
                setFilteredData(updatedData);
                setToastMessage(`Successfully ${action}d ${type}.`);
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 3000);
            }
            
        } catch (err) {
            console.error("Failed to update status:", err);
            setToastMessage("Failed to update status, Please try again");
            setErrorToastVisible(true);
            setTimeout(() => setErrorToastVisible(false), 3000);
        }
    };

    // Filter data based on search input
    useEffect(() => {
        const filtered = data.filter((item) =>
            Object.values(item).some((val) => val?.toString().toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredData(filtered);
    }, [search, data]);


    // Fetch data when component mounts
    useEffect(() => {
        sessionStorage.setItem("UserId", "KBTAN");
        const UPProjectId = sessionStorage.getItem("Project");
        if (UPProjectId) {
            fetchData(UPProjectId); // Fetch data using UPProjectId
        } else {
            console.error("Please select Project first");
        }
    }, [location]);

    // Effect to filter data based on selected filter and search
    useEffect(() => {
        let filtered = data;

        // Apply filter based on selected card
        if (selectedFilter === "Pending") {
            filtered = data.filter((item) => item.BGQSAppStat === "No");
        } else if (selectedFilter === "Approved") {
            filtered = data.filter(
                (item) =>
                    item.BGQSAppStat === "Yes" ||
                    item.BGQSAppStat === "PBRL Retention" ||
                    item.BGQSAppStat === "PBRL ContSum"
            );
        }

        // Apply search filter
        if (search) {
            filtered = filtered.filter(
                (item) =>
                    item.HawLaNo?.toLowerCase().includes(search.toLowerCase()) ||
                    item.ComName?.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredData(filtered);
    }, [selectedFilter, search, data]);



    return (
        <div className="container-fluid">
            <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">{displayProjectName()}</h3>
                    <Button className="btn" outline color="primary" onClick={openModal}>
                        Select Project
                    </Button>
                </div>
            </CardBody>

            {showModal && (
                <ListProjModal
                    buttonLabel="Select Project"
                    className="custom-class"
                    onClose={closeModal}
                />
            )}

            <Row>
                {/* Summary Cards */}
                <Col lg="12" className="mb-3">
                    <Row>
                        <Col md="4">
                            <Card body color="primary" className="text-center" onClick={() => setSelectedFilter("")}>
                                <CardTitle tag="h5">Total LA</CardTitle>
                                <CardText tag="h3">{totalLA}</CardText>
                            </Card>
                        </Col>
                        <Col md="4">
                            <Card body color="warning" className="text-center" onClick={() => setSelectedFilter("Pending")}>
                                <CardTitle tag="h5">Pending Approval</CardTitle>
                                <CardText tag="h3">{totalPending}</CardText>
                            </Card>
                        </Col>
                        <Col md="4">
                            <Card body color="primary" className="text-center" onClick={() => setSelectedFilter("Approved")}>
                                <CardTitle tag="h5">Approved</CardTitle>
                                <CardText tag="h3">{totalApproved}</CardText>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row>
                <Col lg="12">
                    <Card>
                        <CardBody>
                            {/* Search Filter */}
                            <Row className="mb-3">
                                <Col md="6">
                                    <Form>
                                        <FormGroup>
                                            <Input
                                                type="text"
                                                placeholder="Search by LA No. or Subcontractor..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </FormGroup>
                                    </Form>
                                </Col>
                            </Row>

                            {/* Table */}
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <MaterialReactTable
                                    columns={columns}
                                    data={filteredData}
                                    enablePagination
                                    enableGlobalFilter={false}
                                    renderDetailPanel={({ row }) => {
                                        const detailData = row.original;

                                        return (
                                            <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                                                <h5 style={{ marginBottom: "15px", fontWeight: "bold", color: "#333" }}>
                                                    <i className="bi bi-info-circle-fill" style={{ marginRight: "8px", color: "#007bff" }}></i>
                                                    Detailed Information
                                                </h5>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                                                    {/* Section 1 */}
                                                    <div style={{ flex: "1 1 45%" }}>
                                                        <p><strong>LA No:</strong> {SafeRender(detailData.HawLaNo)}</p>
                                                        <p><strong>Subcontractor:</strong> {SafeRender(detailData.ComName)}</p>
                                                        <p><strong>Work Scope:</strong> {SafeRender(detailData.HawWorkScope)}</p>
                                                    </div>

                                                    {/* Section 2 */}
                                                    <div style={{ flex: "1 1 25%" }}>
                                                        <p><strong>LA Amount:</strong> {SafeRender(detailData.SupLaAmt)}</p>

                                                        <p>
                                                            <strong>Activate BG:</strong>{" "}

                                                            {detailData.BGQSAppStat === "PBRL Retention" || detailData.BGQSAppStat === "PBRL ContSum" ? (
                                                                <Button className="btn" color="secondary" size="sm" disabled>
                                                                    {detailData.BGQSAppStat}
                                                                </Button>
                                                            ) : detailData.BGQSAppStat === "Yes" ? (
                                                                <Button className="btn" color="success" size="sm" onClick={() => toggleStatus(row.index, "BG", detailData.HawLaNo)}>
                                                                    Approved
                                                                </Button>
                                                            ) : (
                                                                <Button className="btn" color="danger" size="sm" onClick={() => toggleStatus(row.index, "BG", detailData.HawLaNo)}>
                                                                    Approve
                                                                </Button>
                                                            )}
                                                        </p>

                                                        <p>
                                                            <strong>Activate APB:</strong>{" "}
                                                            {detailData.APBQSAppStat === "Yes" ? (
                                                                <Button className="btn" color="success" size="sm" onClick={() => toggleStatus(row.index, "APB", detailData.HawLaNo)}>
                                                                    Approved
                                                                </Button>
                                                            ) : (
                                                                <Button className="btn" color="danger" size="sm" onClick={() => toggleStatus(row.index, "APB", detailData.HawLaNo)}>
                                                                    Approve
                                                                </Button>
                                                            )}
                                                        </p>

                                                        <p><strong>Approved By:</strong> {SafeRender(detailData.BGQSAppUserId)}</p>
                                                        <p><strong>Approval Date:</strong> {SafeRenderDatewithTime(detailData.BGQSAppDate)}</p>
                                                    </div>

                                                    {/* Section 3 */}
                                                    <div style={{ flex: "1 1 20%" }}>
                                                        <h6 style={{ marginBottom: "9px", fontWeight: "bold", color: "#333" }}>Waived Information</h6>
                                                        <p>
                                                            <strong>Waived BG Ext.:</strong>{" "}
                                                            {detailData.BGExtWaived === "Yes" ? (
                                                                <Button className="btn" color="success" size="sm" onClick={() => toggleStatus(row.index, "Waive", detailData.HawLaNo)}>
                                                                    Waived
                                                                </Button>
                                                            ) : (
                                                                <Button className="btn" color="danger" size="sm" onClick={() => toggleStatus(row.index, "Waive", detailData.HawLaNo)}>
                                                                    Waive
                                                                </Button>
                                                            )}
                                                        </p>

                                                        <p><strong>Waived By:</strong> {SafeRender(detailData.BGExtWaivedUserId)}</p>
                                                        <p><strong>Waived Date:</strong> {SafeRenderDatewithTime(detailData.BGExtWaivedDate)}</p>
                                                    </div>
                                                </div>

                                                {/* Additional Details */}
                                                <div style={{ marginTop: "20px" }}>

                                                    {/* New Button BG*/}
                                                    <div className="button-group">
                                                        <Button className="btn" color="primary" size="sm" onClick={() => handleBGBtn(row.index)}>
                                                            {showBGSubForm && selectedIndex === row.index ? "Cancel" : "Bank Guarantee"}
                                                        </Button>

                                                        <Button className="btn" color="primary" size="sm" onClick={() => handleAPBBtn(row.index)}>
                                                            {showAPBForm && selectedIndex === row.index ? "Cancel" : "Bank Advance Payment Bond"}
                                                        </Button>
                                                    </div>

                                                    {/* BG Sub Form */}
                                                    {showBGSubForm && !showAPBForm && (
                                                        <div>{bgSubLoading ? (<p> Loading BG Sub data...</p>) : (<BGSubTemplate strLA={SafeRender(detailData.HawLaNo)} />)} </div>
                                                    )}

                                                    {/* APB Form */}
                                                    {showAPBForm && !showBGSubForm && (
                                                        <div>{apbLoading ? (<p> Loading APB data...</p>) : (<APBTemplate strProjId={sessionStorage.getItem("Project") || ""} strLA={SafeRender(detailData.HawLaNo)} />)} </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            )}

                            {/* Success Toast */}
                            <ToastNotification
                                isOpen={toastVisible}
                                type="success"
                                message={toastMessage}
                                toggle={() => setToastVisible(false)}
                            />

                            {/* Error Toast */}
                            <ToastNotification
                                isOpen={errorToastVisible}
                                type="error"
                                message="Something went wrong. Please try again."
                                toggle={() => setErrorToastVisible(false)}
                            />

                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BankGuarantee;
