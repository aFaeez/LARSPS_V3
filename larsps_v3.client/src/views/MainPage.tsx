import { useState, useEffect, startTransition } from "react";
import { Row, Col, Card, CardTitle, Badge, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,CardText } from "reactstrap";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { UseProject } from "../services/globalVariable";
import { StatusOptionDTO } from "../dto/dtos";
import { useSession } from "../context/SessionContext";
import { FetchProjectsByStatus, FetchProjectStatusOptions,GetTotalProject, GetPendingApprovals, GetNearExpiry } from "../services/apiService";
import { GetProjectRequest, GetProjectResponse } from "../services/apiClient";

const Starter = () => {
    const { userId,companyName } = useSession();
    const [data, setData] = useState<GetProjectResponse[]>([]);
    const [statusOptions, setStatusOptions] = useState<StatusOptionDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
    const [selectedFilter, setSelectedFilter] = useState<StatusOptionDTO>({
        StatusID: 1,
        StatusDesc: "ON-GOING (GST)",
    });

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const handleSelect = (status: StatusOptionDTO) => {
        setSelectedFilter(status);
        fetchData(status.StatusID);
        setDropdownOpen(false);
    };

    const fetchData = async (statusID = 1) => {
        try {
            setLoading(true);
            setError(null);

            const requestData: GetProjectRequest = {
                userID: userId,
                projStatus: statusID
            } as unknown as GetProjectRequest;

            const projects = await FetchProjectsByStatus(requestData);

            const transformedProjects: GetProjectResponse[] = projects.map((project) => ({
                proProjectId: project.proProjectId,  
                proProjectDesc: project.proProjectDesc,
                proProjectType: project.proProjectType,
                projWithFS: project.projWithFS,
            })) as GetProjectResponse[]; 

            startTransition(() => setData(transformedProjects));
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching project data");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatusOptions = async () => {
        try {
            const options = await FetchProjectStatusOptions();
            startTransition(() => setStatusOptions(options));
        } catch (err: any) {
            console.error("Error fetching project status options:", err);
        }
    };


    const [totalProj, setTotProj] = useState<number>(0); // Default to 0
    const [pending, setPending] = useState<number>(0); // Default to 0
    const [nearExp, setNearExp] = useState<number>(0); // Default to 0
    const fetchDashboard = async () => {
        setLoading(true);
        try {
            if (userId && companyName) {
                const totalProj = await GetTotalProject(userId,companyName);
                const Count = totalProj[0]?.TotalRecords;
                setTotProj(Count);

                const pending = await GetPendingApprovals(userId, companyName);
                const Appr = pending[0]?.TotalRecords;
                setPending(Appr);
                
                const nearExp = await GetNearExpiry(userId,companyName);
                const Pend = nearExp[0]?.TotalRecords;
                setNearExp(Pend);
            }

        } catch (err) {
            console.error("Error fetching dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const [selectedRowId, setSelectedRowId] = useState<string>();
    const { setSelectedProject } = UseProject();
    const handleRowClick = (project: GetProjectResponse) => {
        setSelectedProject(project);
        setSelectedRowId(project.proProjectId); 
        if (project.proProjectId) {
            sessionStorage.setItem("Project", project.proProjectId);
            sessionStorage.setItem("ProjectName", project.proProjectDesc || "");
        }
    };

    const columns: MRT_ColumnDef<GetProjectResponse>[] = [
        {
            accessorKey: "proProjectId",
            header: "Project ID",
        },
        {
            accessorKey: "proProjectDesc",
            header: "Project Description",
            size: 200,
            minSize: 500,
        },
        {
            accessorKey: "proProjectType",
            header: "Project Type",
            Cell: ({ cell }) => {
                const valueType = cell.getValue();
                if (valueType && Object.keys(valueType).length > 0 && typeof valueType === "string") {
                    return (
                        <Badge color="primary" className="ms-3" pill>
                            {valueType}
                        </Badge>
                    );
                }
                return null;
            },
        },
        {
            accessorKey: "projWithFS",
            header: "With FS",
            Cell: ({ cell }) => {
                const valueFS = cell.getValue();
                return valueFS === 1 ? (
                    <Badge color="primary" className="ms-3" pill>
                        Yes
                    </Badge>
                ) : (
                    <Badge color="secondary" className="ms-3" pill>
                        No
                    </Badge>
                );
            },
        },
    ];

    useEffect(() => {
        fetchStatusOptions();
        fetchData();
        fetchDashboard();
    }, []);

    return (
        <div>
            <Row className="mb-4">
                <Col md="4">
                    <Card body className="text-center">
                        <CardTitle>Total Projects</CardTitle>
                        <CardText tag="h3">{totalProj}</CardText>
                    </Card>
                </Col>
                <Col md="4">
                    <Card body className="text-center">
                        <CardTitle>Letter of Award (LA) Pending Approvals</CardTitle>
                        <CardText tag="h3">{pending}</CardText>
                    </Card>                 
                </Col>
                <Col md="4">
                    <Card body className="text-center">
                        <CardTitle>Upcoming LA Expirations</CardTitle>
                        <CardText tag="h3">{nearExp}</CardText>
                    </Card>
                </Col>
            </Row>
            <div>
                <Row>
                    <Col lg="12">
                        <Card>
                            <CardTitle tag="h6" className="border-bottom p-3 mb-0">
                                <i className="bi bi-card-text me-2"></i>
                                My Projects
                            </CardTitle>
                            <CardBody>
                                <div className="mb-3 d-flex justify-content-between">
                                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                                        <DropdownToggle caret color="primary">
                                            Project Status: {selectedFilter.StatusDesc}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {statusOptions.map((status) => (
                                                <DropdownItem
                                                    key={status.StatusID}
                                                    onClick={() => handleSelect(status)}
                                                >
                                                    {status.StatusDesc}
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                                {loading && <p>Loading...</p>}
                                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                                {!loading && !error && (
                                    <MaterialReactTable
                                        columns={columns}
                                        data={data}
                                        state={{ isLoading: loading }}
                                        muiTableBodyCellProps={{ sx: { fontSize: "1rem" } }}
                                        enablePagination
                                        enableSorting
                                        enableGlobalFilter
                                        renderEmptyRowsFallback={() => <div>No data available</div>}
                                        muiTableBodyRowProps={({ row }) => ({
                                            onClick: () => handleRowClick(row.original),
                                            style: {
                                                cursor: "pointer",
                                                backgroundColor: row.original.proProjectId === selectedRowId ? "#562F61" : "transparent",
                                            },
                                        })}
                                    />
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Starter;
