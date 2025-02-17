import { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Col, FormGroup, Input, Label } from "reactstrap";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { AttachmentTable } from "../../dto/dtos";
import * as API from "../../services/apiService";

interface ModalExampleProps {
    type: "BG" | "APB" | "PBRL";
    className?: string;
    laNo: string; 
    projectId: string;
    onClose: () => void;
}
interface ModalExampleState {
    modal: boolean;
    data: AttachmentTable[];
    files: FileItem[];
}

interface FileItem {
    name: string;
    size: number;
    type: string;
}

const columnsBG: MRT_ColumnDef<AttachmentTable>[] = [
    { accessorKey: "BGAPFile", header: "File Name" },
    { accessorKey: "BGAPUserId", header: "User ID", size: 200 },
    { accessorKey: "BGAPDate", header: "Uploaded Date" },
];

const columnsAPB: MRT_ColumnDef<AttachmentTable>[] = [
    { accessorKey: "APBFile", header: "File Name" },
    { accessorKey: "APBUserId", header: "User ID", size: 200 },
    { accessorKey: "APBDate", header: "Uploaded Date" },
];

const columnsPBRL: MRT_ColumnDef<AttachmentTable>[] = [
    { accessorKey: "BGAPFile", header: "File Name" },
    {
        accessorKey: "BGPBRLPercent",
        header: "PRBL Percent",
        Cell: ({ cell }) => {
            const value = cell.getValue();
            return value && typeof value === "object" ? "N/A" : String(value ?? "N/A");
        },
    },
    { accessorKey: "BGAPUserId", header: "User ID", size: 200 },
    { accessorKey: "BGAPDate", header: "Uploaded Date" },
    { accessorKey: "BGRLApprovedStat", header: "Approval Status" },
    { accessorKey: "BGRLRejectReason", header: "Rejected Reason" },
    { accessorKey: "AllowDelete", header: "Delete" },
];


class Uploader extends Component<ModalExampleProps, ModalExampleState> {
    constructor(props: ModalExampleProps) {
        super(props);
        this.state = {
            modal: true,
            data: [],
            files: [],
        };
    }

    toggle = () => {
        this.setState((prevState) => ({ modal: !prevState.modal }), () => {
            if (!this.state.modal) {
                this.props.onClose();
            }
        });
    };

    handleFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const newFiles = Array.from(selectedFiles).map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type.split("/")[1]?.toUpperCase() || "FILE",
        }));
        this.setState((prevState) => ({
            files: [...prevState.files, ...newFiles],
        }));
    };

    removeFile = (index: number) => {
        this.setState((prevState) => ({
            files: prevState.files.filter((_, i) => i !== index),
        }));
    };

    async fetchDataFile() {
        try {
            const fetchedData = await API.FetchGetFile(this.props.laNo, this.props.projectId);

            const sanitizedData = fetchedData.map(item => ({
                ...item,
                BGPBRLPercent: typeof item.BGPBRLPercent === "object" ? "N/A" : item.BGPBRLPercent
            }));

            this.setState({ data: sanitizedData });
        } catch (err) {
            console.error("Error fetching files:", err);
        }
    }

    componentDidMount() {
        this.fetchDataFile();
    }

    render() {

        const columns =
            this.props.type === "BG"
                ? columnsBG
                : this.props.type === "APB"
                    ? columnsAPB
                    : columnsPBRL;

        const title =
            this.props.type === "BG"
                ? "Upload BG File"
                : this.props.type === "APB"
                    ? "Upload APB File"
                    : "Upload PBRL File";

        return (
            <div>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size="xl">
                    <ModalHeader toggle={this.toggle}>{title}</ModalHeader>
                    <ModalBody>

                        {/* Show Form Fields Only for PBRL */}
                        {this.props.type === "PBRL" && (
                            <>
                                <FormGroup row className="mb-3 align-items-center">
                                    <Label sm={4} className="text-right">Deduct ContSum / Increase Ret (%) :</Label>
                                    <Col sm={4}>
                                        <Input type="text" name="dd" placeholder="Enter percentage" />
                                    </Col>
                                </FormGroup>

                                <FormGroup row className="mb-4">
                                    <Label sm={4} className="text-right">PBRL Option :</Label>
                                    <Col sm={6} className="d-flex gap-3">
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" value="Yes" name="pbrlOption" />
                                                Deduct ContSum
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" value="No" name="pbrlOption" />
                                                Increase Ret
                                            </Label>
                                        </FormGroup>
                                    </Col>
                                </FormGroup>
                            </>
                        )}

                        {/* Drag & Drop File Upload */}
                        <div
                            className="border border-dashed border-secondary text-center p-4 rounded"
                            onDrop={(e) => {
                                e.preventDefault();
                                this.handleFiles(e.dataTransfer.files);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <p className="mb-2 fw-bold">Drag and Drop files here or</p>
                            <input
                                type="file"
                                multiple
                                className="d-none"
                                id="fileInput"
                                onChange={(e) => this.handleFiles(e.target.files)}
                            />
                            <Button color="primary" onClick={() => document.getElementById("fileInput")?.click()}>
                                Browse Files
                            </Button>
                        </div>


                        {/* File List */}
                        <div>
                            {this.state.files.length > 0 && (
                                <ul className="list-group mb-3">
                                    {this.state.files.map((file, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{file.name}</strong> <br />
                                                <small>{(file.size / 1024).toFixed(2)} KB - {file.type}</small>
                                            </div>
                                            <Button color="danger" size="sm" onClick={() => this.removeFile(index)}>
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <hr className="my-4" />

                        

                        {/* Table */}
                        <MaterialReactTable
                            columns={columns}
                            data={this.state.data}
                            muiTableBodyCellProps={{ sx: { fontSize: "1rem" } }}
                            enablePagination
                            enableSorting
                            enableGlobalFilter
                            renderEmptyRowsFallback={() => <div>No data available</div>}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default Uploader;