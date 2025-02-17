﻿import { Row, Col, Card, CardTitle, CardBody, Badge, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { useState, startTransition, useEffect } from "react";

import { FetchProjectsByStatus, FetchProjectStatusOptions } from "../../services/apiService";
import { ProjectDTO, StatusOptionDTO } from "../../dto/dtos";
import { UseProject } from "../../services/globalVariable";

interface ProjectsTableProps {
    closeModal?: () => void; // Accept closeModal as a prop
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ closeModal }) => {

    const [data, setData] = useState<ProjectDTO[]>([]);
    const [statusOptions, setStatusOptions] = useState<StatusOptionDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);// Dropdown state
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
            const projects = await FetchProjectsByStatus(statusID);
            startTransition(() => setData(projects));
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

    const { setSelectedProject } = UseProject();
    const handleRowClick = (project: ProjectDTO) => {
        setSelectedProject(project);
        if (project.UPProjectId) {
            sessionStorage.setItem("Project", project.UPProjectId);
            sessionStorage.setItem("ProjectName", project.ProProjectDesc || '');
        }
        if (closeModal) {
            closeModal();
        }
        window.location.reload();
    };


    const columns: MRT_ColumnDef<ProjectDTO>[] = [
        {
            accessorKey: "UPProjectId",
            header: "Project ID",
        },
        {
            accessorKey: "ProProjectDesc",
            header: "Project Description",
            size: 200,
            minSize: 500,
        },
        {
            accessorKey: "ProProjectType",
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
            accessorKey: "ProjWithFS",
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
    }, []);

    return (
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
                                        style: { cursor: "pointer" },
                                    })}
                                />
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProjectsTable;