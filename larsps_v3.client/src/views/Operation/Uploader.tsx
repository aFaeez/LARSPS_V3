import { Component, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { GetUserIPAddress } from "../../services/globalVariable";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Col, FormGroup, Input, Label } from "reactstrap";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { AttachmentTable } from "../../dto/dtos";
import * as API from "../../services/apiService";
import { UploadRequest } from "../../services/apiClient";
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

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const PdfViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);

    return (
        <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
        </Document>
    );
};

const columnsBG: MRT_ColumnDef<AttachmentTable>[] = [
    {
        accessorKey: "BGAPFile",
        header: "File Name",
        Cell: ({ row }) => {
            const fileName = row.original.BGAPFile;
            const fullFilePath = row.original.FullFilePath;

            return (
                <>
                    {fileName.endsWith(".pdf") ? (
                        <Button color="link" onClick={() => PdfViewer(fullFilePath)}>
                            {fileName}
                        </Button>
                    ) : (
                        <a href={fullFilePath} target="_blank" rel="noopener noreferrer">
                            {fileName}
                        </a>
                    )}
                </>
            );
        },
    },
    { accessorKey: "BGAPUserId", header: "User ID", size: 200 },
    { accessorKey: "BGAPDate", header: "Uploaded Date" },
];

const columnsAPB: MRT_ColumnDef<AttachmentTable>[] = [
    {
        accessorKey: "APBFile",
        header: "File Name",
        Cell: ({ row }) => {
            const fileName = row.original.APBFile;
            const fullFilePath = row.original.FullFilePath;

            return (
                <a href={fullFilePath} target="_blank" rel="noopener noreferrer">
                    {fileName}
                </a>
            );
        },
    },
    { accessorKey: "APBUserId", header: "User ID", size: 200 },
    { accessorKey: "APBDate", header: "Uploaded Date" },
];

const columnsPBRL: MRT_ColumnDef<AttachmentTable>[] = [
    {
        accessorKey: "BGAPFile",
        header: "File Name",
        Cell: ({ row }) => {
            const fileName = row.original.BGAPFile;
            const fullFilePath = row.original.FullFilePath;

            return (
                <a href={fullFilePath} target="_blank" rel="noopener noreferrer">
                    {fileName}
                </a>
            );
        },
    },
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

    uploadFile = async (index: number) => {
        const file = this.state.files[index];
        if (!file) return;
        console.log("Uploading file:", file);
        await this.handleSubmit(file);
    };

    handleSubmit = async (file: FileItem) => {

        try {
            const userId = sessionStorage.getItem("UserId");
            const companyName = sessionStorage.getItem("CompanyName");
            const ipAddress = await GetUserIPAddress();

            if (!(file instanceof File)) {
                console.warn("Converting FileItem to File...");

                // Extract a valid filename
                const fileName = (file as any).name || "uploaded_file.pdf";

                // Convert FileItem to File
                file = new File([file as Blob], fileName, {
                    type: "application/pdf",
                    lastModified: Date.now(),
                });
            }

            if (userId && companyName) {
                // Step 1: Upload file physically
                const fileUploadResponse = await API.BGPhysicalFile(file);

                if (fileUploadResponse.success) {
                    console.log("File uploaded successfully:", fileUploadResponse.filePath);
                } else {
                    console.error("File upload failed:", fileUploadResponse.message);
                }

                // Step 2: Save file details in the database
                const updatedItem: UploadRequest = {
                    queryType:this.props.type,
                    bgapUserId: userId,
                    bgapip: ipAddress,
                    compId: companyName,
                    bgapFile: file.name,
                    bgapProjId: this.props.projectId,
                    bgapLaNo: this.props.laNo,
                    bgapType: this.props.type,

                    //bgpbrlPercent: this.state.dd,   // Deduct ContSum / Increase Ret (%)
                    //pbrlOption: this.state.pbrlOption, // Yes or No
                };
                
                const response = await API.UploadFile(updatedItem);
                if (response.success) {
                    this.fetchDataFile();
                    console.log("Success");
                    //this.showToast("success", "File upload successfully!");
                } else {
                    console.error("Error");
                    //this.showToast("error", `Failed: ${response.message}`);
                }
            }
        } catch (err) {
            console.error("Upload failed:", err);
            //this.showToast("error", "Something went wrong. Please try again.");
        }
    };

    removeFile = (index: number) => {
        this.setState((prevState) => ({
            files: prevState.files.filter((_, i) => i !== index),
        }));
    };

    async fetchDataFile() {
        try {
            const config = await API.WebConfig();
            if (config) {

                const fetchedData = await API.FetchGetFile(this.props.laNo, this.props.projectId);
                //console.log("Fetched Data:", JSON.stringify(fetchedData, null, 2));

                const sanitizedData = fetchedData.map(item => ({
                    ...item,
                    BGAPType: item.BGAPType?.trim(), // Trim whitespace from BGAPType
                    FullFilePath: config.uploadPath + item.BGAPFile,
                    BGPBRLPercent: typeof item.BGPBRLPercent === "object" ? "N/A" : item.BGPBRLPercent
                }));

                this.setState({ data: sanitizedData });
            }
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

        const filteredData = this.state.data.filter((item) => item.BGAPType === this.props.type);

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

                                            <div>
                                                <Button color="primary" size="sm" onClick={() => this.uploadFile(index)}>
                                                    Upload
                                                </Button>
                                                <Button color="danger" size="sm" className="ms-2" onClick={() => this.removeFile(index)}>
                                                    Remove
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <hr className="my-4" />

                        {/* Table */}
                        <MaterialReactTable
                            columns={columns}
                            data={filteredData} 
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